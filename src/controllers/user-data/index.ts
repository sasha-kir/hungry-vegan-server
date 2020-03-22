import { Request, Response } from 'express';
import { decodeToken } from '../../utils/tokens';
import { DatabasePoolType, sql } from 'slonik';

export const getUserData = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const token = req.header('Authentication');
    if (token === undefined) {
        return res.status(401).json({ error: 'missing authentication header' });
    }
    const decoded = decodeToken(token);
    if (decoded.error || decoded.email === undefined) {
        return res.status(401).json({ error: 'invalid auth token' });
    }
    const userEmail = decoded['email'] || '';
    const userInfo = await db.maybeOne(sql`
        select * from users
        where email = ${userEmail}
    `);
    if (userInfo === null) {
        return res.status(404).json({ error: 'user info not found' });
    }
    return res.json({
        user: {
            id: userInfo.id,
            username: userInfo.username || '',
            email: userInfo.email,
            foursquareId: userInfo.foursquare_id || '',
        },
    });
};
