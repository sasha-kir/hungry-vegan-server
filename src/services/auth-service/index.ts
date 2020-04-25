import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt/tokens';
import UserQuery from '../../database/users';
import * as LoginQuery from '../../database/login';

const saltRounds = 10;

interface AuthResponse {
    token: string | null;
    error: string | null;
}

export const checkCredentials = async ({
    username,
    password,
}: LoginPayload): Promise<AuthResponse> => {
    const userRecord = await UserQuery.getUserByUsername(username);
    if (userRecord === null) {
        return { error: 'wrong username or password', token: null };
    }
    const loginRecord = await LoginQuery.getPasswordByEmail(userRecord.email.toString());
    if (loginRecord === null) {
        return { error: 'wrong username or password', token: null };
    }
    const isPassMatching = await bcrypt.compare(password, `${loginRecord.password}`);
    if (isPassMatching) {
        const token = generateToken(userRecord.email.toString());
        return { token: token, error: null };
    } else {
        return { error: 'wrong username or password', token: null };
    }
};

export const registerUser = async ({
    username,
    email,
    password,
}: RegisterPayload): Promise<AuthResponse> => {
    const userRecord = await UserQuery.getUserByParams(username, email);
    if (userRecord !== null) {
        return { error: 'user already exists', token: null };
    }
    const hash = bcrypt.hashSync(password, saltRounds);
    await UserQuery.createUserByEmail(username, email, hash);
    const token = generateToken(email);
    return { token: token, error: null };
};
