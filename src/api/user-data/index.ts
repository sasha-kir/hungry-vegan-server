import { Request, Response } from 'express';
import { checkToken, generateToken } from '../../utils/jwt/tokens';
import { getUserByEmail, updateUserByEmail } from '../../database/users';

interface UserInfo {
    id: string | number;
    username: string;
    email: string;
    foursquareId: string | number;
}

const buildUser = (userInfo): UserInfo => {
    return {
        id: userInfo.id,
        username: userInfo.username || '',
        email: userInfo.email,
        foursquareId: userInfo.foursquare_id || '',
    };
};

export const getUserData = async (req: Request, res: Response) => {
    const { email, error } = checkToken(req.header('Authentication'));
    if (error !== null || email === null) {
        return res.status(401).json({ error });
    }
    const userInfo = await getUserByEmail(email);
    if (userInfo === null) {
        return res.status(404).json({ error: 'user info not found' });
    }
    return res.json({ user: buildUser(userInfo) });
};

export const updateUserData = async (req: Request, res: Response) => {
    const { email: currentEmail, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || currentEmail === null) {
        return res.status(401).json({ error: tokenError });
    }
    const { username, email } = req.body;
    if (username === undefined || email === undefined || email === '') {
        return res.status(400).json({ error: 'received invalid user data' });
    }
    const { userData, error: trxError } = await updateUserByEmail(username, currentEmail, email);
    if (trxError !== null || userData === null) {
        return res.status(500).json({ error: 'internal server error' });
    }
    const responseToken = generateToken(email);
    return res.json({ user: buildUser(userData), token: responseToken });
};
