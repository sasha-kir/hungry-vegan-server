import { getUserData } from '../../../clients/foursquare';
import { generateToken } from '../../../utils/jwt/tokens';
import { aquireToken, encryptToken } from '../../../utils/foursquare/accessToken';
import * as TokenQuery from '../../../database/access-tokens';
import UserQuery from '../../../database/users';

interface FsqAuthResponse {
    token: string | null;
    isEmailValid?: boolean;
    error: string | null;
}

export const authorizeUser = async ({
    code,
    redirectUrl,
}: OAuthPayload): Promise<FsqAuthResponse> => {
    const accessToken = await aquireToken(code, redirectUrl);
    const { user, error: dataError } = await getUserData(accessToken);
    if (dataError !== null || user === null) {
        return { token: null, error: dataError };
    }
    const foursquareId = Number(user.id);
    const userFromDb = await UserQuery.getUserByFoursquareId(foursquareId);
    if (userFromDb !== null) {
        const isEmailValid = userFromDb.email !== String(userFromDb.foursquare_id);
        const token = generateToken(`${userFromDb.email}`);
        return { token: token, isEmailValid, error: null };
    }
    const encryptedToken = await encryptToken(accessToken);
    await UserQuery.createUserByFoursquareId(foursquareId, encryptedToken);
    const token = generateToken(foursquareId.toString());
    return { token: token, isEmailValid: false, error: null };
};

export const connectUser = async ({
    code,
    redirectUrl,
    email,
}: OAuthPayload & { email: string }): Promise<FsqAuthResponse> => {
    const userFromDb = await UserQuery.getUserByEmail(email);
    if (userFromDb === null) {
        return { token: null, error: 'user info not found' };
    }
    const foursquareId = Number(userFromDb.foursquare_id);
    const tokenFromDb = await TokenQuery.getTokenByFoursquareId(foursquareId);
    if (tokenFromDb === null) {
        const accessToken = await aquireToken(code, redirectUrl);
        const { user, error: dataError } = await getUserData(accessToken);
        if (dataError !== null || user === null) {
            return { token: null, error: dataError };
        }
        const encryptedToken = await encryptToken(accessToken);
        await UserQuery.setUserFoursquareId(email, foursquareId, encryptedToken);
    }
    const token = generateToken(email);
    return { token: token, error: null };
};
