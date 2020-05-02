import { generateToken } from '../../utils/jwt';
import UserQuery from '../../database/users';
import { UserRecord } from '../../generated/db';

interface UserInfo {
    id: string | number;
    username: string;
    email: string;
    foursquareId: string | number;
}

const buildUser = (userInfo: UserRecord): UserInfo => {
    return {
        id: userInfo.id,
        username: userInfo.username || '',
        email: userInfo.email,
        foursquareId: userInfo.foursquare_id || '',
    };
};

interface UserResponse {
    user: UserInfo | null;
    error: string | null;
    token?: string | null;
}

export const getUser = async (email: string): Promise<UserResponse> => {
    const userInfo = await UserQuery.getUserByEmail(email);
    if (userInfo === null) {
        return { user: null, error: 'user info not found' };
    }
    return { user: buildUser(userInfo), error: null };
};

export const updateUser = async (username: string, currentEmail: string, email: string) => {
    const userInfo = await UserQuery.updateUserEmail(username, currentEmail, email);
    if (!userInfo) {
        return { user: null, error: 'user update unsuccessful' };
    }
    const responseToken = generateToken(email);
    return { user: buildUser(userInfo), error: null, token: responseToken };
};
