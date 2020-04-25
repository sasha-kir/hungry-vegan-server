import { sql } from 'slonik';
import db from '../..';

export const createUserByEmail = async (username: string, email: string, hash: string) => {
    const userInfo = await db.transaction(async trxConnection => {
        const userInfo = await trxConnection.query(sql`
                insert into users (username, email)
                values (${username}, ${email})
            `);
        await trxConnection.query(sql`
                insert into login (email, password)
                values (${email}, ${hash})
            `);
        return userInfo;
    });
    return userInfo;
};

export const createUserByFoursquareId = async (foursquareId: number, token: string) => {
    const userInfo = await db.transaction(async trxConnection => {
        const userInfo = await trxConnection.query(sql`
            insert into users (email, foursquare_id)
            values (${foursquareId}, ${foursquareId})
        `);
        await trxConnection.query(sql`
            insert into access_tokens (foursquare_id, access_token)
            values (${foursquareId}, ${token})
        `);
        return userInfo;
    });
    return userInfo;
};
