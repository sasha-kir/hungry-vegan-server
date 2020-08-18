import { FsqApiUser, FsqApiList } from 'foursquare-api';
import { FsqUserData, FsqUserListsData, FsqUser, FsqList } from 'foursquare';
import { foursquareApi } from '../index';

const normalizeUser = (fullUser: FsqApiUser): FsqUser => ({
    id: fullUser.id,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    birthday: fullUser.birthday,
    homeCity: fullUser.homeCity,
});

const normalizeList = (list: FsqApiList): FsqList => ({
    id: list.id,
    name: list.name,
    url: list.canonicalUrl,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    itemsCount: list.listItems.count,
});

export const getUserData = async (accessToken: string): Promise<FsqUserData> => {
    const url = 'users/self/';
    try {
        const { data } = await foursquareApi.get(url, {
            params: {
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        const fullUser: FsqApiUser = data.response.user as FsqApiUser;
        const foursquareUser: FsqUser = normalizeUser(fullUser);
        return { user: foursquareUser, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const getUserLists = async (accessToken: string): Promise<FsqUserListsData> => {
    const url = 'users/self/lists';
    try {
        const { data } = await foursquareApi.get(url, {
            params: {
                group: 'created',
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        const userLists: FsqApiList[] = data.response.lists.items as FsqApiList[];
        const listsInfo: FsqList[] = userLists.map((list) => normalizeList(list));
        return { data: listsInfo, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
