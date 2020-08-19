import bcrypt from 'bcrypt';
import { LoginPayload, RegisterPayload, ServiceResponse } from 'internal';
import { generateToken } from '../../utils/jwt';
import UserQuery from '../../database/users';
import * as LoginQuery from '../../database/login';

const saltRounds = 10;

type AuthResponse = ServiceResponse<string>;

export const checkCredentials = async ({
    username,
    password,
}: LoginPayload): Promise<AuthResponse> => {
    const userRecord = await UserQuery.getUserByUsername(username);
    if (userRecord === null) {
        return { error: 'wrong username or password', data: null };
    }
    const loginRecord = await LoginQuery.getPasswordByEmail(userRecord.email);
    if (loginRecord === null) {
        return { error: 'wrong username or password', data: null };
    }
    const isPassMatching = await bcrypt.compare(password, `${loginRecord.password}`);
    if (isPassMatching) {
        const token = generateToken(userRecord.email.toString());
        return { data: token, error: null };
    } else {
        return { error: 'wrong username or password', data: null };
    }
};

export const registerUser = async ({
    username,
    email,
    password,
}: RegisterPayload): Promise<AuthResponse> => {
    const userRecord = await UserQuery.getUserByParams(username, email);
    if (userRecord !== null) {
        return { error: 'user already exists', data: null };
    }
    const hash = bcrypt.hashSync(password, saltRounds);
    await UserQuery.createUserByEmail(username, email, hash);
    const token = generateToken(email);
    return { data: token, error: null };
};
