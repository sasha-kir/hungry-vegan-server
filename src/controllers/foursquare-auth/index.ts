/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response } from 'express';
import axios from 'axios';
import { DatabasePoolType, sql } from 'slonik';
import { promiseApi as initCryptus } from 'cryptus';

import { generateToken } from '../../utils/tokens';

const cryptus = initCryptus();

interface TokenRequest {
    code: string;
    redirectUrl: string;
    userId: number;
}

export const getClientID = (_req: Request, res: Response) => {
    return res.json({ clientId: process.env.FOURSQUARE_CLIENT_ID });
};

export const getToken = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const { code, redirectUrl, userId }: TokenRequest = req.body;

    if (code === undefined || redirectUrl === undefined || userId === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }

    const tokenUrl = 'https://foursquare.com/oauth2/access_token';

    try {
        const tokenSearchResult = await db.maybeOne(sql`
          select access_token 
          from access_tokens 
          where user_id = ${userId}
        `);
        if (tokenSearchResult === null) {
            const { data } = await axios.get(tokenUrl, {
                params: {
                    client_id: process.env.FOURSQUARE_CLIENT_ID,
                    client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUrl,
                    code,
                },
            });
            const accessToken = data.access_token;
            const encryptedToken = await cryptus.encrypt(process.env.CRYPTUS_KEY, accessToken);
            await db.query(sql`
              insert into access_tokens (user_id, access_token)
              values (${userId}, ${encryptedToken})
          `);
        }
        // } else {
        //     await db.query(sql`
        //       update access_tokens
        //       set access_token = ${encryptedToken},
        //       updated_at = to_timestamp(${Date.now() / 1000})
        //     `);
        // }
        const token = generateToken(userId);
        return res.json({ token: token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
