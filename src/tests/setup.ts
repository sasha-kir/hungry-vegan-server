import * as AuthService from '../services/auth-service';

interface TestUser {
    username: string;
    email: string;
    password: string;
    token?: string | null;
}

export const prepareTestUser = async (prefix: string): Promise<TestUser> => {
    const user: TestUser = {
        username: `${prefix}_test`,
        email: `${prefix}_test@example.com`,
        password: 'test',
    };
    const { data: token } = await AuthService.registerUser(user);
    user.token = token;
    return user;
};
