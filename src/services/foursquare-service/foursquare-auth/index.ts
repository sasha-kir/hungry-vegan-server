import FoursquareClient from '../../../clients/foursquare';
import { OAuthPayload } from 'internal';
import { generateToken } from '../../../utils/jwt';
import { encryptToken, getAccessTokenFromDb } from '../../../utils/foursquare/accessToken';
import UserQuery from '../../../database/users';

interface FsqAuthResponse {
    token: string | null;
    isEmailValid?: boolean;
    error: string | null;
}

const getFoursquareId = async (accessToken: string): Promise<number | null> => {
    const { user, error: dataError } = await FoursquareClient.getUserData(accessToken);
    if (dataError !== null || user === null) {
        return null;
    }
    const foursquareId = Number(user.id);
    return foursquareId;
};

export const registerUser = async ({
    code,
    redirectUrl,
}: OAuthPayload): Promise<FsqAuthResponse> => {
    const accessToken = await FoursquareClient.aquireToken(code, redirectUrl);
    const foursquareId = await getFoursquareId(accessToken);
    if (foursquareId === null) {
        return { token: null, error: 'error fetching user from foursquare' };
    }
    const userFromDb = await UserQuery.getUserByFoursquareId(foursquareId);
    if (userFromDb !== null) {
        const isEmailValid = userFromDb.email !== String(userFromDb.foursquare_id);
        const token = generateToken(userFromDb.email);
        return { token: token, isEmailValid, error: null };
    }
    const encryptedToken = await encryptToken(accessToken);
    await UserQuery.createUserByFoursquareId(foursquareId, encryptedToken);
    const token = generateToken(String(foursquareId));
    return { token: token, isEmailValid: false, error: null };
};

export const connectUser = async ({
    code,
    redirectUrl,
    email,
}: OAuthPayload & { email: string }): Promise<FsqAuthResponse> => {
    const userToken = await getAccessTokenFromDb(email);
    if (userToken === null) {
        const accessToken = await FoursquareClient.aquireToken(code, redirectUrl);
        const foursquareId = await getFoursquareId(accessToken);
        if (foursquareId === null) {
            return { token: null, error: 'error fetching user from foursquare' };
        }
        const encryptedToken = await encryptToken(accessToken);
        await UserQuery.setUserFoursquareId(email, foursquareId, encryptedToken);
    }
    const token = generateToken(email);
    return { token: token, error: null };
};
