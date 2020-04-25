import { getUserData } from '../../clients/foursquare';
import { generateToken } from '../../utils/jwt/tokens';
import { aquireToken, encryptToken } from '../../utils/foursquare/accessToken';
import { getTokenByFoursquareId } from '../../database/access-tokens';
import {
    getUserByFoursquareId,
    getUserByEmail,
    createUserByFoursquareId,
    setUserFoursquareId,
} from '../../database/users';

interface FsqAuthResponse {
    token: string | null;
    isEmailValid?: boolean;
    error: string | null;
}

class FoursquareAuthService {
    authorizeUser = async ({ code, redirectUrl }: OAuthPayload): Promise<FsqAuthResponse> => {
        const accessToken = await aquireToken(code, redirectUrl);
        const { user, error: dataError } = await getUserData(accessToken);
        if (dataError !== null || user === null) {
            return { token: null, error: dataError };
        }
        const foursquareId = Number(user.id);
        const userFromDb = await getUserByFoursquareId(foursquareId);
        if (userFromDb !== null) {
            const isEmailValid = userFromDb.email !== String(userFromDb.foursquare_id);
            const token = generateToken(`${userFromDb.email}`);
            return { token: token, isEmailValid, error: null };
        }
        const encryptedToken = await encryptToken(accessToken);
        await createUserByFoursquareId(foursquareId, encryptedToken);
        const token = generateToken(foursquareId.toString());
        return { token: token, isEmailValid: false, error: null };
    };

    connectUser = async ({
        code,
        redirectUrl,
        email,
    }: OAuthPayload & { email: string }): Promise<FsqAuthResponse> => {
        const userFromDb = await getUserByEmail(email);
        if (userFromDb === null) {
            return { token: null, error: 'user info not found' };
        }
        const foursquareId = Number(userFromDb.foursquare_id);
        const tokenFromDb = await getTokenByFoursquareId(foursquareId);
        if (tokenFromDb === null) {
            const accessToken = await aquireToken(code, redirectUrl);
            const { user, error: dataError } = await getUserData(accessToken);
            if (dataError !== null || user === null) {
                return { token: null, error: dataError };
            }
            const encryptedToken = await encryptToken(accessToken);
            await setUserFoursquareId(email, foursquareId, encryptedToken);
        }
        const token = generateToken(email);
        return { token: token, error: null };
    };
}

export default new FoursquareAuthService();
