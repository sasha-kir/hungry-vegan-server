import db, { sql } from '../../index';

export const getUserByUsername = async (username: string): Promise<UserRecord | null> => {
    const userRecord = await db.maybeOne<UserRecord>(sql`
        select * from users 
        where username = ${username}
    `);
    return userRecord;
};

export const getUserByEmail = async (email: string): Promise<UserRecord | null> => {
    const userRecord = await db.maybeOne<UserRecord>(sql`
        select * from users
        where email = ${email}
    `);
    return userRecord;
};

export const getUserByFoursquareId = async (foursquareId: number): Promise<UserRecord | null> => {
    const userRecord = await db.maybeOne<UserRecord>(sql`
        select * from users 
        where foursquare_id = ${foursquareId}
    `);
    return userRecord;
};

export const getUserByParams = async (
    username: string,
    email: string,
): Promise<UserRecord | null> => {
    const userRecord = await db.maybeOne<UserRecord>(sql`
        select * from users 
        where username = ${username}
        or email = ${email}
    `);
    return userRecord;
};
