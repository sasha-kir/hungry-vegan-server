/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';
import { promiseApi as initCryptus } from 'cryptus';

const cryptus = initCryptus();

const tokenUrl = 'https://foursquare.com/oauth2/access_token';

export const aquireToken = async (code: string, redirectUrl: string): Promise<string> => {
    const { data: tokenData } = await axios.get(tokenUrl, {
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

export const encryptToken = async (accessToken: string): Promise<string> => {
    return await cryptus.encrypt(process.env.CRYPTUS_KEY, accessToken);
};

export const decryptToken = async (encryptedToken: string): Promise<string> => {
    return await cryptus.decrypt(process.env.CRYPTUS_KEY, encryptedToken);
};
