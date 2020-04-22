import { sql } from 'slonik';
import db from '..';

export const getPasswordByEmail = async (email: string) => {
    const loginRecord = await db.maybeOne(sql`
        select password from login
        where email = ${email}
    `);
    return loginRecord;
};
