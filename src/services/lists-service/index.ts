/* eslint-disable @typescript-eslint/camelcase */
import { FsqList } from 'foursquare';
import { FullList, ServiceResponse } from 'internal';
import FoursquareClient from '../../clients/foursquare';
import { getAccessTokenFromDb } from '../../utils/foursquare/accessToken';
import UserQuery from '../../database/users';
import * as ListsQuery from '../../database/user-lists';
import { ListRecord } from '../../generated/db';
import YandexClient from '../../clients/yandex';

type MergedList = FsqList & Partial<ListRecord>;

interface ListResponse<T> extends ServiceResponse<T> {
    responseCode: number;
}

const mergeLists = async (userId: string | number, lists: FsqList[]): Promise<MergedList[]> => {
    const sortedData = lists.sort((a, b) => b.id.localeCompare(a.id));
    const dbListData = await ListsQuery.getListsData(userId);
    const merged = sortedData.map((list, i) => {
        const { location, lat, lon } = dbListData[i];
        return { ...list, location, lat, lon };
    });
    return merged;
};

const normalizeLists = async (lists: MergedList[]): Promise<FullList[]> => {
    const normalized: FullList[] = lists.map(list => {
        const { location, lat, lon, ...basicList } = list;
        const listLocation = location ? location : '';
        const listCoords = lat && lon ? { latitude: Number(lat), longitude: Number(lon) } : null;
        return {
            ...basicList,
            location: listLocation,
            coordinates: listCoords,
        };
    });
    return normalized;
};

const prepareLists = async (userId: string | number, lists: FullList[]): Promise<FullList[]> => {
    const currentData = await mergeLists(userId, lists);
    return Promise.all(
        lists.map(async (list, i) => {
            const currentList = currentData[i];
            if (list.location !== currentList.location && list.location) {
                const { data, error } = await YandexClient.getLocationCoords(list.location);
                if (error === null && data !== null) {
                    return { ...list, location: data.location, coordinates: data.coordinates };
                }
            }
            if (list.location !== currentList.location && !list.location) {
                return { ...list, coordinates: null };
            }
            return list;
        }),
    );
};

export const getLists = async (email: string): Promise<ListResponse<FullList[]>> => {
    const userToken = await getAccessTokenFromDb(email);
    if (userToken === null) {
        return { data: null, error: 'user has no associated foursquare id', responseCode: 400 };
    }
    const user = await UserQuery.getUserByEmail(email);
    if (user === null) {
        return { data: null, error: 'user not found in database', responseCode: 404 };
    }
    const { data, error } = await FoursquareClient.getUserLists(userToken);
    if (error !== null || data === null) {
        return { data: null, error, responseCode: 500 };
    }
    await ListsQuery.saveInitialData(user.id, data);
    const mergedData = await mergeLists(user.id, data);
    const normalizedData = await normalizeLists(mergedData);
    return { data: normalizedData, error: null, responseCode: 200 };
};

export const getListDetails = async (
    email: string,
    listId: string,
): Promise<ListResponse<FsqList>> => {
    const userToken = await getAccessTokenFromDb(email);
    if (userToken === null) {
        return { data: null, error: 'user has no associated foursquare id', responseCode: 400 };
    }
    const { data, error } = await FoursquareClient.getListData(userToken, listId);
    if (error !== null || data === null) {
        return { data: null, error: error, responseCode: 500 };
    }
    return { data: data, error: null, responseCode: 200 };
};

export const updateLists = async (
    email: string,
    lists: FullList[],
): Promise<ListResponse<FullList[]>> => {
    const user = await UserQuery.getUserByEmail(email);
    if (user === null) {
        return { data: null, error: 'user not found in database', responseCode: 404 };
    }
    const preparedLists = await prepareLists(user.id, lists);
    await ListsQuery.updateListLocations(user.id, preparedLists);
    return await getLists(email);
};
