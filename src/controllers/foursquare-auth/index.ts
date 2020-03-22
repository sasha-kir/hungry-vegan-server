import { Request, Response } from 'express';
import { decodeToken } from '../../utils/tokens';
import { DatabasePoolType } from 'slonik';

import { generateToken } from '../../utils/tokens';
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
    let userEmail = '';
    let isEmailValid = false;
    try {
        const accessToken = await aquireToken(code, redirectUrl);
        const trxResult = await setTokenWithoutEmail(db, accessToken);
        if (trxResult.error !== undefined) {
            return res.status(500).json({ error: trxResult.error });
        }
        if (trxResult.email !== undefined) {
            userEmail = trxResult.email;
        }
        if (trxResult.isEmailValid === true) {
            isEmailValid = true;
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
    if (!userEmail) {
        return res.status(500).json({ error: 'internal error' });
    }
    const responseToken = generateToken(userEmail);
    return res.json({ token: responseToken, isEmailValid });
};

export const foursquareConnect = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const token = req.header('Authentication');
    const { code, redirectUrl }: TokenRequest = req.body;
    if (token === undefined) {
        return res.status(401).json({ error: 'missing authentication header' });
    }
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    const decoded = decodeToken(token);
    if (decoded.error || decoded.email === undefined) {
        return res.status(401).json({ error: 'invalid auth token' });
    }
    const userEmail = decoded['email'] || '';
    const accessToken = await getTokenByEmail(db, userEmail);
    if (accessToken === null) {
        try {
            const accessToken = await aquireToken(code, redirectUrl);
            const trxResult = await setTokenByEmail(db, accessToken, userEmail);
            if (trxResult.error !== undefined) {
                return res.status(500).json({ error: trxResult.error });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    const responseToken = generateToken(userEmail);
    return res.json({ token: responseToken });
};
