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
    const { email, error } = checkToken(req.header('Authentication'));
    if (error !== null || email === null) {
        return res.status(401).json({ error });
    }
    const { code, redirectUrl }: TokenRequest = req.body;
    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }
    const accessToken = await getTokenByEmail(db, email);
    if (accessToken === null) {
        try {
            const accessToken = await aquireToken(code, redirectUrl);
            const trxResult = await setTokenByEmail(db, accessToken, email);
            if (trxResult.error !== undefined) {
                return res.status(500).json({ error: trxResult.error });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    const responseToken = generateToken(email);
    return res.json({ token: responseToken });
};
