import { Request, Response } from 'express';

import { checkToken } from '../../utils/jwt/tokens';
import * as ListsService from '../../services/lists-service';

export const getLists = async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    try {
        const { data, error, responseCode } = await ListsService.getLists(email);
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
        const { data, error, responseCode } = await ListsService.getListDetails(email, listId);
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateLists = async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    const { lists } = req.body;
    if (lists === undefined) {
        return res.status(400).json({ error: 'nothing to update: no lists in request' });
    }
    try {
        const { data, error, responseCode } = await ListsService.updateLists(email, lists);
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
