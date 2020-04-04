/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';

const foursquareUrl = 'https://api.foursquare.com/v2/users/self/';

interface FsqUserLists {
    count: number;
    items: object[];
}

interface FsqUser {
    id: string;
    firstName: string;
    birthday: number;
    homeCity: string;
    lists: FsqUserLists;
}

interface FsqUserData {
    user: FsqUser | null;
    error: string | null;
}

interface FsqUserListsData {
    data: FsqUserLists | null;
    error: string | null;
}

export const getUserData = async (accessToken: string, path = '', params = {}): Promise<FsqUserData> => {
    const url = foursquareUrl + path;
    try {
        const { data } = await axios.get(url, {
            params: {
                ...params,
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        return { user: data.response, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const getUserLists = async (accessToken: string): Promise<FsqUserListsData> => {
    const { user, error } = await getUserData(accessToken, 'lists', { group: 'created' });
    if (error !== null || user === null) {
        return { data: null, error: error };
    }
    return { data: user.lists, error: null };
};
