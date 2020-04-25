import { sql } from 'slonik';
import db from '..';

interface UserResponse {
    userData: object | null;
    error: string | null;
}

export const getUserByUsername = async (username: string) => {
    const userRecord = await db.maybeOne(sql`
        select * from users 
        where username = ${username}
    `);
    return userRecord;
};

export const getUserByEmail = async (email: string) => {
    const userRecord = await db.maybeOne(sql`
        select * from users
        where email = ${email}
    `);
    return userRecord;
};

export const getUserByFoursquareId = async (foursquareId: number) => {
    const userRecord = await db.maybeOne(sql`
        select * from users 
        where foursquare_id = ${foursquareId}
    `);
    return userRecord;
};

export const getUserByParams = async (username: string, email: string) => {
    const userRecord = await db.maybeOne(sql`
        select * from users 
        where username = ${username}
        or email = ${email}
    `);
    return userRecord;
};

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

export const updateUserEmail = async (
    username: string,
    currentEmail: string,
    newEmail: string,
): Promise<UserResponse> => {
    try {
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
        return { userData: userInfo, error: null };
    } catch (error) {
        return { userData: null, error: error.message };
    }
};
