/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';

const foursquareUrl = 'https://api.foursquare.com/v2/users/self/';

export const getUserData = async (accessToken: string, path = '', params = {}) => {
    const url = foursquareUrl + path;
    try {
        const { data } = await axios.get(url, {
            params: {
                ...params,
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        return { data: data.response };
    } catch (error) {
        return { error: error.message };
    }
};

export const getUserLists = async (accessToken: string) => {
    return getUserData(accessToken, 'lists', { group: 'created' });
};
