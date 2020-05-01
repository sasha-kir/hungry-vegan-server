import db, { sql } from '..';

export const getPasswordByEmail = async (email: string) => {
    const loginRecord = await db.maybeOne(sql.LoginRecord`
        select password from login
        where email = ${email}
    `);
    return loginRecord;
};
