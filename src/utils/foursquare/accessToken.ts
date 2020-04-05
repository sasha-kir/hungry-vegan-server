/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';
import { DatabasePoolType, sql } from 'slonik';
import { promiseApi as initCryptus } from 'cryptus';
import { getUserData } from '../../clients/foursquare';

const cryptus = initCryptus();

interface SetTokenResponse {
    email: string | null;
    isEmailValid?: boolean;
    error: string | null;
}

const tokenUrl = 'https://foursquare.com/oauth2/access_token';

export const aquireToken = async (code: string, redirectUrl: string): Promise<string> => {
    const { data: tokenData } = await axios.get(tokenUrl, {
        params: {
            client_id: process.env.FOURSQUARE_CLIENT_ID,
            client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: redirectUrl,
            code,
        },
    });
    return tokenData.access_token;
};

const encryptToken = async (accessToken: string): Promise<string> => {
    return await cryptus.encrypt(process.env.CRYPTUS_KEY, accessToken);
};

const decryptToken = async (encryptedToken: string): Promise<string> => {
    return await cryptus.decrypt(process.env.CRYPTUS_KEY, encryptedToken);
};

export const getTokenByEmail = async (
    db: DatabasePoolType,
    userEmail: string,
): Promise<string | null> => {
    const foursquareIdResult = await db.maybeOne(sql`
        select foursquare_id from users
        where email = ${userEmail}
    `);
    if (foursquareIdResult === null) {
        return null;
    }
    const foursquareId = foursquareIdResult['foursquare_id'] || '';
    try {
        const tokenSearchResult = await db.one(sql`
            select access_token 
            from access_tokens 
            where foursquare_id = ${foursquareId}
        `);
        const encryptedToken = tokenSearchResult['access_token'].toString();
        const accessToken = await decryptToken(encryptedToken);
        return accessToken;
    } catch (error) {
        return null;
    }
};

export const setTokenByEmail = async (
    db: DatabasePoolType,
    accessToken: string,
    userEmail: string,
): Promise<SetTokenResponse> => {
    const { user, error } = await getUserData(accessToken);
    if (error !== null || user === null) {
        return { email: null, error: error };
    }
    const foursquareId = Number(user.id);
    const encryptedToken = await encryptToken(accessToken);
    try {
        await db.transaction(async trxConnection => {
            await trxConnection.query(sql`
                insert into access_tokens (foursquare_id, access_token)
                values (${foursquareId}, ${encryptedToken})
            `);
            await trxConnection.query(sql`
                update users set foursquare_id = ${foursquareId}
                where email = ${userEmail}
            `);
        });
        return { email: userEmail, error: null };
    } catch (error) {
        return { email: null, error: error.message };
    }
};

export const setTokenWithoutEmail = async (
    db: DatabasePoolType,
    accessToken: string,
): Promise<SetTokenResponse> => {
    const { user, error } = await getUserData(accessToken);
    if (error !== null || user === null) {
        return { email: null, error: error };
    }
    const foursquareId = Number(user.id);
    const userWithFoursquareId = await db.maybeOne(sql`
        select * from users 
        where foursquare_id = ${foursquareId}
    `);
    if (userWithFoursquareId !== null) {
        const isEmailValid =
            userWithFoursquareId.email !== String(userWithFoursquareId.foursquare_id);
        return { email: `${userWithFoursquareId.email}`, isEmailValid, error: null };
    }
    const encryptedToken = await encryptToken(accessToken);
    try {
        await db.transaction(async trxConnection => {
            await trxConnection.query(sql`
                insert into access_tokens (foursquare_id, access_token)
                values (${foursquareId}, ${encryptedToken})
            `);
            await trxConnection.query(sql`
                insert into users (email, foursquare_id)
                values (${foursquareId}, ${foursquareId})
            `);
        });
        return { email: `${foursquareId}`, isEmailValid: false, error: null };
    } catch (error) {
        return { email: null, error: error.message };
    }
};
