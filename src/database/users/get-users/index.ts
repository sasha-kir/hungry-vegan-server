import db, { sql } from '../..';

export const getUserByUsername = async (username: string) => {
    const userRecord = await db.maybeOne(sql.UserRecord`
        select * from users 
        where username = ${username}
    `);
    return userRecord;
};

export const getUserByEmail = async (email: string) => {
    const userRecord = await db.maybeOne(sql.UserRecord`
        select * from users
        where email = ${email}
    `);
    return userRecord;
};

export const getUserByFoursquareId = async (foursquareId: number) => {
    const userRecord = await db.maybeOne(sql.UserRecord`
        select * from users 
        where foursquare_id = ${foursquareId}
    `);
    return userRecord;
};

export const getUserByParams = async (username: string, email: string) => {
    const userRecord = await db.maybeOne(sql.UserRecord`
        select * from users 
        where username = ${username}
        or email = ${email}
    `);
    return userRecord;
};
