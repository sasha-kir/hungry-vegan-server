/* eslint-disable @typescript-eslint/camelcase */
import { FsqApiUser, FsqApiList } from '../models/foursquareApi';
import { FsqUserData, FsqUserListsData, FsqUser, FsqList } from '../models/internal';
import { foursquareApi } from '..';

const normalizeUser = (fullUser: FsqApiUser): FsqUser => ({
    id: fullUser.id,
    firstName: fullUser.firstName,
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

export const getUserData = async (
    accessToken: string,
    includeLists = false,
    params = {},
): Promise<FsqUserData> => {
    const url = `users/self/${includeLists ? 'lists' : ''}`;
    try {
        const { data } = await foursquareApi.get(url, {
            params: {
                ...params,
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        const fullUser: FsqApiUser = data.response as FsqApiUser;
        const foursquareUser: FsqUser = normalizeUser(fullUser);
        if (includeLists) foursquareUser.userLists = fullUser.lists.items;
        return { user: foursquareUser, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const getUserLists = async (accessToken: string): Promise<FsqUserListsData> => {
    const { user, error } = await getUserData(accessToken, true, {
        group: 'created',
    });
    if (error !== null || user === null || user.userLists === undefined) {
        return { data: null, error: error };
    }
    const userLists: FsqApiList[] = user.userLists as FsqApiList[];
    const listsInfo: FsqList[] = userLists.map(list => normalizeList(list));
    return { data: listsInfo, error: null };
};
