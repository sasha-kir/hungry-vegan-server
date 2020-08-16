import { Request, Response } from 'express';
import { AuthorizedRequest, TokenPayload } from 'internal';
import NodeCache from 'node-cache';
import ListsService from '../../services/lists-service';

export const getLists = async (
    req: AuthorizedRequest,
    res: Response,
    cache: NodeCache,
): Promise<Response> => {
    const { email } = req.user as TokenPayload;
    const cacheKey = `lists-${email}`;
    if (cache.has(cacheKey)) {
        return res.json({ data: cache.get(cacheKey) });
    }
    try {
        const { data, error, responseCode } = await ListsService.getLists(email);
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        cache.set(cacheKey, data, 60 * 60 * 24);
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getPublicLists = async (
    _req: Request,
    res: Response,
    cache: NodeCache,
): Promise<Response> => {
    const cacheKey = 'publicLists';
    if (cache.has(cacheKey)) {
        return res.json({ data: cache.get(cacheKey) });
    }
    try {
        const { data, error, responseCode } = await ListsService.getPublicLists();
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        cache.set(cacheKey, data, 60 * 60 * 24);
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getListData = async (
    req: Request,
    res: Response,
    cache: NodeCache,
): Promise<Response> => {
    const { owner, listName } = req.body;
    if (owner === undefined || listName === undefined) {
        return res.status(400).json({ error: 'some required parameters not provided' });
    }
    const cacheKey = `listDetails-${owner}-${listName}`;
    if (cache.has(cacheKey)) {
        return res.json({ data: cache.get(cacheKey) });
    }
    try {
        const { data, error, responseCode } = await ListsService.getListDetails(
            owner,
            listName,
            cache,
        );
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateLists = async (
    req: AuthorizedRequest,
    res: Response,
    cache: NodeCache,
): Promise<Response> => {
    const { email } = req.user as TokenPayload;
    const { lists } = req.body;
    const userCacheKey = `lists-${email}`;
    const publicCacheKey = 'publicLists';
    if (lists === undefined) {
        return res.status(400).json({ error: 'nothing to update: no lists in request' });
    }
    try {
        const { data, error, responseCode } = await ListsService.updateLists(email, lists);
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        cache.set(userCacheKey, data);
        cache.del(publicCacheKey);
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateVenueDetails = async (
    req: AuthorizedRequest,
    res: Response,
    cache: NodeCache,
): Promise<Response> => {
    const newDetails = req.body;
    try {
        const { data, error, responseCode } = await ListsService.updateVenueDetails(
            newDetails,
            cache,
        );
        if (error !== null || data === null) {
            return res.status(responseCode).json({ error: error });
        }
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
