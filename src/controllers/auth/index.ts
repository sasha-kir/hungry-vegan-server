import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { DatabasePoolType, sql } from 'slonik';

import { generateToken } from '../../utils/tokens';

const saltRounds = 10;

interface CustomRequest<T> extends Request {
    body: T;
}

interface LoginPayload {
    username: string;
    password: string;
}

export const handleLogin = (db: DatabasePoolType) => async (req: CustomRequest<LoginPayload>, res: Response) => {
    const { username, password } = req.body;
    if (username === undefined || password === undefined) {
        return res.status(400).json({ error: 'missing required fields in request' });
    }
    try {
        const userRecord = await db.maybeOne(sql`
          select *
          from users 
          where username = ${username}
        `);
        if (userRecord === null) {
            return res.status(401).json({ error: 'wrong username or password' });
        }
        const loginRecord = await db.maybeOne(sql`
            select password
            from login
            where email = ${userRecord.email}
        `);
        if (loginRecord === null) {
            return res.status(401).json({ error: 'wrong username or password' });
        }
        const isPassMatching = await bcrypt.compare(password, `${loginRecord.password}`);
        if (isPassMatching) {
            const token = generateToken(userRecord.email.toString());
            return res.json({ token: token });
        } else {
            return res.status(401).json({ error: 'wrong username or password' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const hashPass = (req, res) => {
    const { password } = req.body;
    try {
        const hash = bcrypt.hashSync(password, saltRounds);
        return res.json(hash);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
