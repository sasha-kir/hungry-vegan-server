import bcrypt from 'bcrypt';
import request from 'supertest';
import { sql } from 'slonik';
import app, { db, server } from '../server';

const testUsername = 'test';
const testEmail = 'test@example.com';
const testPass = 'test';

describe('Auth endpoints', () => {
    beforeAll(async () => {
        const hash = await bcrypt.hash(testPass, 10);
        await db.transaction(async trxConnection => {
            await trxConnection.query(sql`
                insert into users (username, email)
                values (${testUsername}, ${testEmail})
            `);
            await trxConnection.query(sql`
                insert into login (email, password)
                values (${testEmail}, ${hash})
            `);
        });
    });

    afterAll(() => {
        server.close();
    });

    it('should allow to log in', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: testUsername,
                password: testPass,
            });
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should not allow to login with wrong username', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: 'fake',
                password: testPass,
            });
        expect(response.unauthorized).toBe(true);
        expect(response.body).toHaveProperty('error');
    });

    it('should not allow to login with wrong pass', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                username: testUsername,
                password: 'fake',
            });
        expect(response.unauthorized).toBe(true);
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
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should not allow to register with same email', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'test3',
                email: testEmail,
                password: 'test',
            });
        expect(response.badRequest).toBe(true);
        expect(response.body).toHaveProperty('error');
    });

    it('should not allow to register with same username', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: testUsername,
                email: 'test3@example.com',
                password: 'test',
            });
        expect(response.badRequest).toBe(true);
        expect(response.body).toHaveProperty('error');
    });
});
