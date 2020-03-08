/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response } from 'express';
import axios from 'axios';
import { decodeToken } from '../../utils/tokens';
import { DatabasePoolType } from 'slonik';

import { generateToken } from '../../utils/tokens';
import { setTokenByEmail } from '../../utils/foursquare/accessToken';

interface TokenRequest {
    code: string;
    redirectUrl: string;
}

const tokenUrl = 'https://foursquare.com/oauth2/access_token';

export const getClientID = (_req: Request, res: Response) => {
    return res.json({ clientId: process.env.FOURSQUARE_CLIENT_ID });
};

//export const foursquareLogin = (db: DatabasePoolType) => async (req: Request, res: Response) => {};

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
    try {
        const { data: tokenData } = await axios.get(tokenUrl, {
            params: {
                client_id: process.env.FOURSQUARE_CLIENT_ID,
                client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: redirectUrl,
                code,
            },
        });
        const accessToken = tokenData.access_token;
        const trxResult = await setTokenByEmail(db, accessToken, userEmail);
        if (trxResult.error !== undefined) {
            return res.status(500).json({ error: trxResult.error });
        }
        const token = generateToken(userEmail);
        return res.json({ token: token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
