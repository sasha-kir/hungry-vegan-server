import { Request, Response } from 'express';
import { checkToken, generateToken } from '../../utils/jwt/tokens';
import { DatabasePoolType } from 'slonik';

import {
    setTokenByEmail,
    getTokenByEmail,
    aquireToken,
    setTokenWithoutEmail,
} from '../../utils/foursquare/accessToken';

interface TokenRequest {
    code: string;
    redirectUrl: string;
}

export const getClientID = (_req: Request, res: Response) => {
    return res.json({ clientId: process.env.FOURSQUARE_CLIENT_ID });
};

export const foursquareLogin = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const { code, redirectUrl }: TokenRequest = req.body;
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    try {
        const accessToken = await aquireToken(code, redirectUrl);
        const { email, error, isEmailValid = false } = await setTokenWithoutEmail(db, accessToken);
        if (error !== null || email === null) {
            return res.status(500).json({ error: error });
        }
        const responseToken = generateToken(email);
        return res.json({ token: responseToken, isEmailValid });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const foursquareConnect = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const { email, error: tokenError } = checkToken(req.header('Authentication'));
    if (tokenError !== null || email === null) {
        return res.status(401).json({ error: tokenError });
    }
    const { code, redirectUrl }: TokenRequest = req.body;
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    const accessToken = await getTokenByEmail(db, email);
    if (accessToken === null) {
        try {
            const accessToken = await aquireToken(code, redirectUrl);
            const { error: trxError } = await setTokenByEmail(db, accessToken, email);
            if (trxError !== null) {
                return res.status(500).json({ error: trxError });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    const responseToken = generateToken(email);
    return res.json({ token: responseToken });
};
