import { foursquareOAuth } from '../index';

export const aquireToken = async (code: string, redirectUrl: string): Promise<string> => {
    const url = 'access_token';
    const { data: tokenData } = await foursquareOAuth.get(url, {
        params: {
            client_id: process.env.FOURSQUARE_CLIENT_ID,
            client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: redirectUrl,
            code,
        },
    });
    return tokenData.access_token;
};
