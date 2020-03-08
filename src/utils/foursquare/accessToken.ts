import { DatabasePoolType, sql } from 'slonik';
import { promiseApi as initCryptus } from 'cryptus';
import { getUserData } from './foursquareUser';

const cryptus = initCryptus();

interface SetTokenResponse {
    error?: string;
}

export const getTokenByEmail = async (db: DatabasePoolType, userEmail: string): Promise<string | null> => {
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
        const accessToken = await cryptus.decrypt(process.env.CRYPTUS_KEY, encryptedToken);
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
    const userData = await getUserData(accessToken);
    if (userData.error !== undefined) {
        return { error: userData.error };
    }
    const foursquareId = Number(userData.data.user.id);
    const encryptedToken = await cryptus.encrypt(process.env.CRYPTUS_KEY, accessToken);
    try {
        db.transaction(async trxConnection => {
            await trxConnection.query(sql`
                insert into access_tokens (foursquare_id, access_token)
                values (${foursquareId}, ${encryptedToken})
            `);
            await trxConnection.query(sql`
                update users set foursquare_id = ${foursquareId}
                where email = ${userEmail}
            `);
        });
        return {};
    } catch (error) {
        return { error: error.message };
    }
};
