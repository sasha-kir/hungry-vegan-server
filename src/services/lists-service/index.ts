import { FsqList } from 'foursquare';
import { FullList } from 'internal';
import FoursquareClient from '../../clients/foursquare';
import { getAccessTokenFromDb } from '../../utils/foursquare/accessToken';
import UserQuery from '../../database/users';
import * as ListsQuery from '../../database/user-lists';

interface DefaultResponse {
    error: string | null;
    responseCode: number;
}

interface ListsResponse extends DefaultResponse {
    data: FullList[] | null;
}

interface DetailsResponse extends DefaultResponse {
    data: FsqList | null;
}

const normalizeLists = async (userId: string | number, lists: FsqList[]): Promise<FullList[]> => {
    const sortedData = lists.sort((a, b) => b.id.localeCompare(a.id));
    const dbListData = await ListsQuery.getListsData(userId);
    const normalized: FullList[] = sortedData.map((list, index) => {
        const dbList = dbListData[index];
        const listLocation = dbList.location ? dbList.location : '';
        const listCoords =
            dbList.lat && dbList.lon
                ? { latitude: Number(dbList.lat), longitude: Number(dbList.lat) }
                : null;
        return {
            ...list,
            location: listLocation,
            coordinates: listCoords,
        };
    });
    return normalized;
};

export const getLists = async (email: string): Promise<ListsResponse> => {
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
    const fullData = await normalizeLists(user.id, data);
    return { data: fullData, error: null, responseCode: 200 };
};

export const getListDetails = async (email: string, listId: string): Promise<DetailsResponse> => {
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

export const updateLists = async (email: string, lists: FullList[]): Promise<ListsResponse> => {
    const user = await UserQuery.getUserByEmail(email);
    if (user === null) {
        return { data: null, error: 'user not found in database', responseCode: 404 };
    }
    await ListsQuery.updateListLocations(user.id, lists);
    return await getLists(email);
};
