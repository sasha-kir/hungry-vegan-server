import request from 'supertest';
import app, { server } from '../server';
import { prepareTestUser } from './setup';

let user;

describe('User endpoints', () => {
    beforeAll(async () => {
        user = await prepareTestUser('user');
    });

    afterAll(() => {
        server.close();
    });

    it('should return user data', async () => {
        const response = await request(app)
            .get('/user_data')
            .set('Authentication', user.token);
        expect(response.ok).toBe(true);
        expect(response.body).toHaveProperty('user');
    });

    it('should not return user data without authorization', async () => {
        const response = await request(app).get('/user_data');
        expect(response.unauthorized).toBe(true);
        expect(response.body).toHaveProperty('error');
    });

    it('should allow to update user email', async () => {
        const response = await request(app)
            .post('/update_user')
            .set('Authentication', user.token)
            .send({
                username: user.username,
                email: 'new_email@example.com',
            });
        expect(response.ok).toBe(true);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
    });

    it('should not update user data without authorization', async () => {
        const response = await request(app)
            .post('/update_user')
            .send({
                username: user.username,
                email: 'new_email@example.com',
            });
        expect(response.unauthorized).toBe(true);
        expect(response.body).toHaveProperty('error');
    });
});
