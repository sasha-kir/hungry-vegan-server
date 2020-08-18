import { Request, Response } from 'express';
import { AuthorizedRequest, TokenPayload, OAuthPayload } from 'internal';
import FoursquareService from '../../services/foursquare-service/index';

export const getClientID = (_req: Request, res: Response): Response => {
    return res.json({ clientId: process.env.FOURSQUARE_CLIENT_ID });
};

export const foursquareLogin = async (req: Request, res: Response): Promise<Response> => {
    const { code, redirectUrl }: OAuthPayload = req.body;
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    try {
        const { data: token, error, isEmailValid } = await FoursquareService.registerUser({
            code,
            redirectUrl,
        });
        if (error !== null || token === null) {
            return res.status(500).json({ error: error });
        }
        return res.json({ token, isEmailValid });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const foursquareConnect = async (
    req: AuthorizedRequest,
    res: Response,
): Promise<Response> => {
    const { email } = req.user as TokenPayload;
    const { code, redirectUrl }: OAuthPayload = req.body;
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    try {
        const { data: token, error } = await FoursquareService.connectUser({
            code,
            redirectUrl,
            email,
        });
        if (error !== null || token === null) {
            return res.status(500).json({ error: error });
        }
        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
