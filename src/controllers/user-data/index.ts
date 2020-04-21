import { Request, Response } from 'express';
import { checkToken, generateToken } from '../../utils/jwt/tokens';
import { DatabasePoolType, sql } from 'slonik';
import db from '../../db';

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
    const userInfo = await db.maybeOne(sql`
        select * from users
        where email = ${email}
    `);
    if (userInfo === null) {
        return res.status(404).json({ error: 'user info not found' });
    }
    return res.json({ user: buildUser(userInfo) });
};

export const updateUserData = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const { email: currentEmail, error } = checkToken(req.header('Authentication'));
    if (error !== null || currentEmail === null) {
        return res.status(401).json({ error });
    }
    const { username, email } = req.body;
    if (username === undefined || email === undefined || email === '') {
        return res.status(400).json({ error: 'received invalid user data' });
    }
    try {
        const userInfo = await db.transaction(async trxConnection => {
            const userInfo = await trxConnection.one(sql`
                update users set email = ${email}, username = ${username}
                where email = ${currentEmail}
                returning *
            `);
            await trxConnection.query(sql`
                update login set email = ${email}
                where email = ${currentEmail}
            `);
            return userInfo;
        });
        const responseToken = generateToken(email);
        return res.json({ user: buildUser(userInfo), token: responseToken });
    } catch (error) {
        return res.status(500).json({ error: 'internal server error' });
    }
};
