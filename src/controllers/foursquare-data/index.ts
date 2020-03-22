import { Request, Response } from 'express';
import { decodeToken } from '../../utils/tokens';
import { DatabasePoolType } from 'slonik';
import { getUserLists } from '../../utils/foursquare/foursquareUser';
import { getTokenByEmail } from '../../utils/foursquare/accessToken';

export const getLists = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const token = req.header('Authentication');
    if (token === undefined) {
        return res.status(401).json({ error: 'missing authentication header' });
    }
    const decoded = decodeToken(token);
    if (decoded.error || decoded.email === undefined) {
        return res.status(401).json({ error: 'invalid auth token' });
    }
    const userEmail = decoded['email'] || '';
    const accessToken = await getTokenByEmail(db, userEmail);
    if (accessToken === null) {
        return res.status(400).json({ error: 'user has no associated foursquare id' });
    }
    const responseData = await getUserLists(accessToken);
    if (responseData.error !== undefined) {
        return res.status(500).json({ error: responseData.error });
    }
    return res.json({ data: responseData.data.lists.items });
};
