import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';

interface TokenRequest {
    code: string;
    redirectUrl: string;
}

export const getClientID = (_req: Request, res: Response) => {
    return res.json({ clientId: process.env.FOURSQUARE_CLIENT_ID });
};

export const getToken = async (req: Request, res: Response) => {
    const { code, redirectUrl }: TokenRequest = req.body;

    if (code === undefined || redirectUrl === undefined) {
        return res.status(400).json({ error: 'missing required params' });
    }

    const tokenUrl = 'https://foursquare.com/oauth2/access_token';

    try {
        const { data }: AxiosResponse = await axios.get(tokenUrl, {
            params: {
                client_id: process.env.FOURSQUARE_CLIENT_ID,
                client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: redirectUrl,
                code,
            },
        });
        return res.json({ accessToken: data.access_token });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
