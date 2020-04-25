import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt/tokens';
import { getUserByUsername, getUserByParams, createUserByEmail } from '../../database/users';
import { getPasswordByEmail } from '../../database/login';

const saltRounds = 10;

interface AuthResponse {
    token: string | null;
    error: string | null;
}

class AuthService {
    checkCredentials = async ({ username, password }: LoginPayload): Promise<AuthResponse> => {
        const userRecord = await getUserByUsername(username);
        if (userRecord === null) {
            return { error: 'wrong username or password', token: null };
        }
        const loginRecord = await getPasswordByEmail(userRecord.email.toString());
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

    registerUser = async ({
        username,
        email,
        password,
    }: RegisterPayload): Promise<AuthResponse> => {
        const userRecord = await getUserByParams(username, email);
        if (userRecord !== null) {
            return { error: 'user already exists', token: null };
        }
        const hash = bcrypt.hashSync(password, saltRounds);
        await createUserByEmail(username, email, hash);
        const token = generateToken(email);
        return { token: token, error: null };
    };
}

export default new AuthService();
