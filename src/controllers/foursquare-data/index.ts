import { Request, Response } from 'express';
import { checkToken } from '../../utils/jwt/tokens';
import { DatabasePoolType } from 'slonik';
import { getUserLists } from '../../utils/foursquare/foursquareUser';
import { getListsData } from '../../utils/foursquare/foursquareLists';
import { getTokenByEmail } from '../../utils/foursquare/accessToken';

export const getLists = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ tokenError });
    }
    const accessToken = await getTokenByEmail(db, email);
    if (accessToken === null) {
        return res.status(400).json({ error: 'user has no associated foursquare id' });
    }
    const { data, error: fsqError } = await getUserLists(accessToken);
    if (fsqError !== null || data === null) {
        return res.status(500).json({ error: fsqError });
    }
    return res.json({ data: data.items });
};

export const getAllLists = async (req: Request, res: Response) => {
    const { accessToken } = req.body;
    const lists = await getListsData(accessToken);
    return res.json(lists);
};
