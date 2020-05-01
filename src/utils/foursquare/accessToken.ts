import { promiseApi as initCryptus } from 'cryptus';

import UserQuery from '../../database/users';
import * as TokenQuery from '../../database/access-tokens';

const cryptus = initCryptus();

export const encryptToken = async (accessToken: string): Promise<string> => {
    return await cryptus.encrypt(process.env.CRYPTUS_KEY, accessToken);
};

export const decryptToken = async (encryptedToken: string): Promise<string> => {
    return await cryptus.decrypt(process.env.CRYPTUS_KEY, encryptedToken);
};

export const getAccessTokenFromDb = async (email: string): Promise<string | null> => {
    const userFromDb = await UserQuery.getUserByEmail(email);
    if (userFromDb === null) {
        return null;
    }
    const foursquareId = userFromDb.foursquare_id;
    if (!foursquareId) {
        return null;
    }
    const tokenFromDb = await TokenQuery.getTokenByFoursquareId(Number(foursquareId));
    if (tokenFromDb === null) {
        return null;
    }
    const encryptedToken = tokenFromDb.access_token;
    return await decryptToken(encryptedToken.toString());
};
