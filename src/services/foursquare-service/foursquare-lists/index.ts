import { FullFsqList, FsqList } from 'foursquare';
import FoursquareClient from '../../../clients/foursquare';
import { getAccessTokenFromDb } from '../../../utils/foursquare/accessToken';
import { getFullListsData } from '../../../utils/foursquare/lists';

interface DefaultResponse {
    error: string | null;
    responseCode: number;
}

interface ListsResponse extends DefaultResponse {
    data: FullFsqList[] | null;
}

interface DetailsResponse extends DefaultResponse {
    data: FsqList | null;
}

export const getLists = async (email: string): Promise<ListsResponse> => {
    const userToken = await getAccessTokenFromDb(email);
    if (userToken === null) {
        return { data: null, error: 'user has no associated foursquare id', responseCode: 400 };
    }
    const { data, error } = await getFullListsData(userToken, email);
    if (error !== null || data === null) {
        return { data: null, error, responseCode: 500 };
    }
    return { data, error: null, responseCode: 200 };
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