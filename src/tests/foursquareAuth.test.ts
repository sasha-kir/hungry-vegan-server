import request from 'supertest';
import app, { server } from '../server';
import { prepareTestUser } from './setup';
import * as tokenUtils from '../utils/foursquare/accessToken';

let user;

describe('Foursquare auth endpoints', () => {
    beforeAll(async () => {
        user = await prepareTestUser('fsq-auth');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        server.close();
    });

    it('should return foursquare client ID', async () => {
        const response = await request(app).get('/foursquare-client-id');
        expect(response.ok).toBeTrue();
        expect(response.body).toHaveProperty('clientId');
        expect(response.body.clientId).toBeString();
    });

    it('should complete login on foursquare', async () => {
        const mockAquireToken = jest.spyOn(tokenUtils, 'aquireToken');
        mockAquireToken.mockResolvedValue('test');
        const mockSetToken = jest.spyOn(tokenUtils, 'setTokenWithoutEmail');
        mockSetToken.mockResolvedValue({
            error: null,
            email: 'test',
        });
        const response = await request(app)
            .post('/foursquare-login')
            .send({
                code: 'code',
                redirectUrl: 'url',
            });
        expect(mockAquireToken).toHaveBeenCalledWith('code', 'url');
        expect(mockSetToken).toHaveBeenCalled();
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('isEmailValid');
        expect(response.body.token).toBeString();
        expect(response.body.isEmailValid).toBeFalse();
    });

    it('should connect existing user to foursquare', async () => {
        const mockAquireToken = jest.spyOn(tokenUtils, 'aquireToken');
        mockAquireToken.mockResolvedValue('test');
        const mockSetToken = jest.spyOn(tokenUtils, 'setTokenByEmail');
        mockSetToken.mockResolvedValue({
            error: null,
            email: user.email,
        });
        const response = await request(app)
            .post('/foursquare-connect')
            .set('Authentication', user.token)
            .send({
                code: 'code',
                redirectUrl: 'url',
            });
        expect(mockAquireToken).toHaveBeenCalledWith('code', 'url');
        expect(mockSetToken).toHaveBeenCalled();
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.token).toBeString();
    });
});
