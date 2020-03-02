/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response } from 'express';
import axios from 'axios';
import { decodeToken } from '../../utils/tokens';
import { DatabasePoolType, sql } from 'slonik';
import { promiseApi as initCryptus } from 'cryptus';

const cryptus = initCryptus();

export const getLists = (db: DatabasePoolType) => async (req: Request, res: Response) => {
    const token = req.header('Authentication');
    if (token === undefined) {
        res.status(400).json({ error: 'missing authentication header' });
    }
    const decoded = decodeToken(token);
    if (decoded.error || decoded.userId === undefined) {
        res.status(401).json({ error: 'invalid auth token' });
    }
    const userId: number = decoded.userId!;
    try {
        const tokenSearchResult = await db.one(sql`
            select access_token from access_tokens 
            where user_id = ${userId}
        `);
        const encryptedToken = tokenSearchResult['access_token'].toString();
        const accessToken = await cryptus.decrypt(process.env.CRYPTUS_KEY, encryptedToken);

        const foursquareUrl = 'https://api.foursquare.com/v2/users/self/lists';
        const { data } = await axios.get(foursquareUrl, {
            params: {
                group: 'created',
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        return res.json({ data: data.response.lists.items });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
