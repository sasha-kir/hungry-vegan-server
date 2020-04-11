import bcrypt from 'bcrypt';
import { sql } from 'slonik';
import { db } from '../server';
import { generateToken } from '../utils/jwt/tokens';

interface TestUser {
    username: string;
    email: string;
    password: string;
    token?: string;
}

export const prepareTestUser = async (prefix: string): Promise<TestUser> => {
    const user: TestUser = {
        username: `${prefix}_test`,
        email: `${prefix}_test@example.com`,
        password: 'test',
    };
    const hash = await bcrypt.hash(user.password, 10);
    await db.transaction(async trxConnection => {
        await trxConnection.query(sql`
            insert into users (username, email)
            values (${user.username}, ${user.email})
        `);
        await trxConnection.query(sql`
            insert into login (email, password)
            values (${user.email}, ${hash})
        `);
    });
    user.token = generateToken(user.email);
    return user;
};
