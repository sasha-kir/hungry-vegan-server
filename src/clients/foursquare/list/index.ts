/* eslint-disable @typescript-eslint/camelcase */
import { FsqApiList } from 'foursquare-api';
import { FsqListData } from 'foursquare';
import { foursquareApi } from '..';

export const getListData = async (accessToken: string, listId: string): Promise<FsqListData> => {
    const url = `lists/${listId}`;
    try {
        const { data } = await foursquareApi.get(url, {
            params: {
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        const fullList: FsqApiList = data.response.list as FsqApiList;

        if (fullList.listItems.items === undefined) {
            return { data: null, error: 'no list items data found' };
        }

        return { data: fullList, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
