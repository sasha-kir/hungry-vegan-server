import { Request, Response } from 'express';

import { checkToken } from '../../utils/jwt/tokens';
import FoursquareService from '../../services/foursquare-service';

export const getLists = async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    try {
        const { data, error, responseCode } = await FoursquareService.getLists(email);
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getListById = async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    const { listId } = req.body;
    if (listId === undefined) {
        return res.status(400).json({ error: 'no listId was provided' });
    }
    try {
        const { data, error, responseCode } = await FoursquareService.getListDetails(email, listId);
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
