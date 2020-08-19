import db, { sql } from '../..';

export const setUserFoursquareId = async (
    email: string,
    foursquareId: number,
    token: string,
): Promise<UserRecord | null> => {
    const userInfo = await db.transaction(async (trxConnection) => {
        const userInfo = await trxConnection.maybeOne<UserRecord>(sql`
            update users set foursquare_id = ${foursquareId},
            updated_at = now()
            where email = ${email}
            returning *
        `);
        await trxConnection.query(sql`
            insert into access_tokens (foursquare_id, access_token)
            values (${foursquareId}, ${token})
            on conflict do nothing
        `);
        return userInfo;
    });
    return userInfo;
};

export const updateUserEmail = async (
    username: string,
    currentEmail: string,
    newEmail: string,
): Promise<UserRecord | null> => {
    const userInfo = await db.transaction(async (trxConnection) => {
        const userInfo = await trxConnection.maybeOne<UserRecord>(sql`
                update users set email = ${newEmail}, username = ${username},
                updated_at = now()
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
