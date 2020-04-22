import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { generateToken } from '../../utils/jwt/tokens';
import { getUserByUsername, getUserByParams, createUser } from '../../database/users';
import { getPasswordByEmail } from '../../database/login';

const saltRounds = 10;

interface CustomRequest<T> extends Request {
    body: T;
}

interface LoginPayload {
    username: string;
    password: string;
}

interface RegisterPayload extends LoginPayload {
    email: string;
}

export const handleLogin = async (req: CustomRequest<LoginPayload>, res: Response) => {
    const { username, password } = req.body;
    if (username === undefined || password === undefined) {
        return res.status(400).json({ error: 'missing required fields in request' });
    }
    try {
        const userRecord = await getUserByUsername(username);
        if (userRecord === null) {
            return res.status(401).json({ error: 'wrong username or password' });
        }
        const loginRecord = await getPasswordByEmail(userRecord.email.toString());
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

export const handleRegister = async (req: CustomRequest<RegisterPayload>, res: Response) => {
    const { username, email, password } = req.body;
    if (username === undefined || email === undefined || password === undefined) {
        return res.status(400).json({ error: 'missing required fields in request' });
    }
    const userRecord = await getUserByParams(username, email);
    if (userRecord !== null) {
        return res.status(400).json({ error: 'user already exists' });
    }
    const hash = bcrypt.hashSync(password, saltRounds);
    const { error: trxError } = await createUser(username, password, hash);
    if (trxError !== null) {
        return res.status(500).json({ error: trxError });
    }
    const token = generateToken(email);
    return res.json({ token: token });
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
