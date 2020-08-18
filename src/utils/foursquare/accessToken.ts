import initCryptus from 'cryptus';

import UserQuery from '../../database/users/index';
import * as TokenQuery from '../../database/access-tokens/index';

const cryptus = initCryptus.promiseApi();

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
    const foursquareId = userFromDb.foursquareId;
    if (!foursquareId) {
        return null;
    }
    const tokenFromDb = await TokenQuery.getTokenByFoursquareId(foursquareId);
    if (tokenFromDb === null) {
        return null;
    }
    const encryptedToken = tokenFromDb.accessToken;
    return await decryptToken(encryptedToken);
};
