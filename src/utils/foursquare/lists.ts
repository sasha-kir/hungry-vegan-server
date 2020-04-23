import { getUserLists } from '../../clients/foursquare';
import { FsqList } from '../../clients/foursquare/types';
import { getUserByEmail } from '../../database/users';
import { saveListsData, getListsData } from '../../database/foursquare-lists';

interface FullList extends FsqList {
    city: string;
}

interface FullListsData {
    data: FullList[] | null;
    error: string | null;
}

export const getFullListsData = async (
    accessToken: string,
    email: string,
): Promise<FullListsData> => {
    const { data, error } = await getUserLists(accessToken);
    if (error !== null || data === null) {
        return { data: null, error: error };
    }
    const user = await getUserByEmail(email);
    if (user === null) {
        return { data: null, error: 'error retrieving user data' };
    }
    const sortedData = data.sort((a, b) => b.id.localeCompare(a.id));
    try {
        await saveListsData(data, user['id']);
        const dbListData = await getListsData(user['id']);
        const fullData: FullList[] = sortedData.map((list, index) => ({
            ...list,
            city: dbListData[index]['city'] ? dbListData[index]['city'].toString() : '',
        }));
        return { data: fullData, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
