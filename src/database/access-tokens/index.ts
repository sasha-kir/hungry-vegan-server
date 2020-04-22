import { sql } from 'slonik';
import { encryptToken, decryptToken } from '../../utils/foursquare/accessToken';
import { getUserData } from '../../clients/foursquare';
import db from '..';

interface SetTokenResponse {
    email: string | null;
    isEmailValid?: boolean;
    error: string | null;
}

export const getTokenByEmail = async (userEmail: string): Promise<string | null> => {
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

export const setTokenWithoutEmail = async (accessToken: string): Promise<SetTokenResponse> => {
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
