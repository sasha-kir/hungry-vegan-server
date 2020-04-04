import { Request, Response } from 'express';
import { checkToken } from '../../utils/jwt/tokens';
import { DatabasePoolType } from 'slonik';
import { getUserLists } from '../../utils/foursquare/foursquareUser';
import { getTokenByEmail } from '../../utils/foursquare/accessToken';

export const getLists = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const { email, error } = checkToken(req.header('Authentication'));
    if (error !== null || email === null) {
        return res.status(401).json({ error });
    }
    const accessToken = await getTokenByEmail(db, email);
    if (accessToken === null) {
        return res.status(400).json({ error: 'user has no associated foursquare id' });
    }
    const responseData = await getUserLists(accessToken);
    if (responseData.error !== undefined) {
        return res.status(500).json({ error: responseData.error });
    }
    return res.json({ data: responseData.data.lists.items });
};
