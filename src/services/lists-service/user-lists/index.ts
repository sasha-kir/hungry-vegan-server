import { FsqList } from 'foursquare';
import { FullList, PublicList } from 'internal';
import FoursquareClient from '../../../clients/foursquare';
import { getAccessTokenFromDb } from '../../../utils/foursquare/accessToken';
import UserQuery from '../../../database/users';
import * as ListsQuery from '../../../database/user-lists';
import YandexClient from '../../../clients/yandex';
import { ListResponse } from '..';

type MergedList = FsqList & Partial<ListWithOwnerRecord>;

const constructCoords = (lat: number, lon: number) => ({ latitude: lat, longitude: lon });

const mergeLists = async (userId: string | number, lists: FsqList[]): Promise<MergedList[]> => {
    const sortedData = lists.sort((a, b) => b.id.localeCompare(a.id));
    const dbListData = await ListsQuery.getListsData(userId);
    const merged = sortedData.map((list, i) => {
        const { location, lat, lon, updatedAt, owner } = dbListData[i];
        return {
            ...list,
            location,
            lat,
            lon,
            updatedAt,
            owner,
        };
    });
    return merged;
};

const normalizeLists = async (lists: MergedList[]): Promise<FullList[]> => {
    const normalized: FullList[] = lists.map((list) => {
        const { location, lat, lon, owner, ...basicList } = list;
        const listCoords = lat && lon ? constructCoords(Number(lat), Number(lon)) : null;
        return {
            ...basicList,
            location: location || '',
            owner: owner || '',
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

export const getPublicLists = async (): Promise<ListResponse<PublicList[]>> => {
    const dbLists = await ListsQuery.getPublicLists();
    const normalizedData = dbLists.map((list) => {
        const { lat, lon } = list;
        const listCoords = lat && lon ? constructCoords(lat, lon) : null;
        return {
            id: list.listId,
            name: list.listName,
            owner: list.owner,
            location: list.location || '',
            updatedAt: list.updatedAt,
            coordinates: listCoords,
            itemsCount: list.itemsCount,
        };
    });
    return { data: normalizedData, error: null, responseCode: 200 };
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
