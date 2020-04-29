import { FullFsqList } from 'foursquare';
import FoursquareClient from '../../clients/foursquare';
import UserQuery from '../../database/users';
import * as FsqListsQuery from '../../database/foursquare-lists';

interface FullListsData {
    data: FullFsqList[] | null;
    error: string | null;
}

export const getFullListsData = async (
    accessToken: string,
    email: string,
): Promise<FullListsData> => {
    const { data, error } = await FoursquareClient.getUserLists(accessToken);
    if (error !== null || data === null) {
        return { data: null, error: error };
    }
    const user = await UserQuery.getUserByEmail(email);
    if (user === null) {
        return { data: null, error: 'error retrieving user data' };
    }
    const sortedData = data.sort((a, b) => b.id.localeCompare(a.id));
    try {
        await FsqListsQuery.saveInitialData(user['id'], data);
        const dbListData = await FsqListsQuery.getListsData(user['id']);
        const fullData: FullFsqList[] = sortedData.map((list, index) => ({
            ...list,
            city: dbListData[index]['city'] ? dbListData[index]['city'].toString() : '',
        }));
        return { data: fullData, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
