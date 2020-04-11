import request from 'supertest';
import app, { server } from '../server';
import { prepareTestUser } from './setup';

let user;

describe('Auth endpoints', () => {
    beforeAll(async () => {
        user = await prepareTestUser('auth');
    });

    afterAll(() => {
        server.close();
    });

    it('should allow to log in', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: user.username,
                password: user.password,
            });
        expect(response.ok).toBeTrue();
        expect(response.body).toHaveProperty('token');
        expect(response.body.token).toBeString();
    });

    it('should not allow to login with wrong username', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: 'fake',
                password: user.password,
            });
        expect(response.unauthorized).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });

    it('should not allow to login with wrong pass', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: user.username,
                password: 'fake',
            });
        expect(response.unauthorized).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });

    it('should allow to register', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'test2',
                email: 'test2@example.com',
                password: 'test',
            });
        expect(response.ok).toBeTrue();
        expect(response.body).toHaveProperty('token');
        expect(response.body.token).toBeString();
    });

    it('should not allow to register with same email', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'test3',
                email: user.email,
                password: 'test',
            });
        expect(response.badRequest).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });

    it('should not allow to register with same username', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: user.username,
                email: 'test3@example.com',
                password: 'test',
            });
        expect(response.badRequest).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });
});
