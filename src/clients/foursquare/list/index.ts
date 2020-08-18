import { FsqApiList } from 'foursquare-api';
import { FsqListData } from 'foursquare';
import { foursquareApi } from '../index';

export const getListData = async (listId: string): Promise<FsqListData> => {
    const url = `lists/${listId}`;
    try {
        const { data } = await foursquareApi.get(url, {
            params: {
                client_id: process.env.FOURSQUARE_CLIENT_ID,
                client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
                v: '20200220',
            },
        });
        const fullList: FsqApiList = data.response.list as FsqApiList;

        return { data: fullList, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
