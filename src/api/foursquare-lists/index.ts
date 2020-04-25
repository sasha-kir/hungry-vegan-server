import { Request, Response } from 'express';

import { checkToken } from '../../utils/jwt/tokens';
import { getListData } from '../../clients/foursquare';
import { getTokenByEmail } from '../../database/access-tokens';
import { getFullListsData } from '../../utils/foursquare/lists';

export const getLists = async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    const accessToken = await getTokenByEmail(email);
    if (accessToken === null) {
        return res.status(400).json({ error: 'user has no associated foursquare id' });
    }
    const { data, error: fsqError } = await getFullListsData(accessToken, email);
    if (fsqError !== null || data === null) {
        return res.status(500).json({ error: fsqError });
    }
    return res.json({ data: data });
};

export const getListById = async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    const accessToken = await getTokenByEmail(email);
    if (accessToken === null) {
        return res.status(400).json({ error: 'user has no associated foursquare id' });
    }
    const { listId } = req.body;
    if (listId === undefined) {
        return res.status(400).json({ error: 'no listId was provided' });
    }
    const { data, error } = await getListData(accessToken, listId);
    if (error !== null || data === null) {
        return res.status(500).json({ error: error });
    }
    return res.json({ data: data });
};