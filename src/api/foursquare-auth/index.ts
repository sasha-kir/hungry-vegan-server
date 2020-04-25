import { Request, Response } from 'express';
import { checkToken } from '../../utils/jwt/tokens';
import FoursquareService from '../../services/foursquare-auth-service';

export const getClientID = (_req: Request, res: Response) => {
    return res.json({ clientId: process.env.FOURSQUARE_CLIENT_ID });
};

export const foursquareLogin = async (req: Request, res: Response) => {
    const { code, redirectUrl }: OAuthPayload = req.body;
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    try {
        const { token, error, isEmailValid } = await FoursquareService.authorizeUser({
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

export const foursquareConnect = async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    const { code, redirectUrl }: OAuthPayload = req.body;
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    try {
        const { token, error } = await FoursquareService.connectUser({ code, redirectUrl, email });
        if (error !== null || token === null) {
            return res.status(500).json({ error: error });
        }
        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
