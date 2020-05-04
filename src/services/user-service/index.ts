import { ListCoordinates } from 'foursquare';
import { ServiceResponse } from 'internal';
import YandexClient from '../../clients/yandex';
import { generateToken } from '../../utils/jwt';
import UserQuery from '../../database/users';
import { UserRecord } from '../../generated/db';

interface UserInfo {
    id: string | number;
    username: string;
    email: string;
    foursquareId: string | number;
}

interface UserResponse extends ServiceResponse<UserInfo> {
    token?: string | null;
}

const buildUser = (userInfo: UserRecord): UserInfo => {
    return {
        id: userInfo.id,
        username: userInfo.username || '',
        email: userInfo.email,
        foursquareId: userInfo.foursquare_id || '',
    };
};

export const getUser = async (email: string): Promise<UserResponse> => {
    const userInfo = await UserQuery.getUserByEmail(email);
    if (userInfo === null) {
        return { data: null, error: 'user info not found' };
    }
    return { data: buildUser(userInfo), error: null };
};

export const getUserLocation = async (
    coords: ListCoordinates,
): Promise<ServiceResponse<string>> => {
    const { data, error } = await YandexClient.getLocationName(coords);
    if (error !== null || data === null) {
        return { data: null, error: error };
    }
    return { data: data.description, error: null };
};

export const updateUser = async (
    username: string,
    currentEmail: string,
    email: string,
): Promise<UserResponse> => {
    const userInfo = await UserQuery.updateUserEmail(username, currentEmail, email);
    if (!userInfo) {
        return { data: null, error: 'user update unsuccessful' };
    }
    const responseToken = generateToken(email);
    return { data: buildUser(userInfo), error: null, token: responseToken };
};
