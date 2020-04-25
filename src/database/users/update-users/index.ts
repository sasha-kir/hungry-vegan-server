import { sql } from 'slonik';
import db from '../..';

export const setUserFoursquareId = async (email: string, foursquareId: number, token: string) => {
    const userInfo = await db.transaction(async trxConnection => {
        const userInfo = await trxConnection.query(sql`
            update users set foursquare_id = ${foursquareId}
            where email = ${email}
            returning *
        `);
        await trxConnection.query(sql`
            insert into access_tokens (foursquare_id, access_token)
            values (${foursquareId}, ${token})
        `);
        return userInfo;
    });
    return userInfo;
};

export const updateUserEmail = async (username: string, currentEmail: string, newEmail: string) => {
    const userInfo = await db.transaction(async trxConnection => {
        const userInfo = await trxConnection.one(sql`
                update users set email = ${newEmail}, username = ${username}
                where email = ${currentEmail}
                returning *
            `);
        await trxConnection.query(sql`
                update login set email = ${newEmail}
                where email = ${currentEmail}
            `);
        return userInfo;
    });
    return userInfo;
};