import db, { sql } from '..';

export const getPasswordByEmail = async (email: string): Promise<LoginRecord | null> => {
    const loginRecord = await db.maybeOne<LoginRecord>(sql`
        select * from login
        where email = ${email}
    `);
    return loginRecord;
};
