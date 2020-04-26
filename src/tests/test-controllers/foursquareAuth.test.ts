import request from 'supertest';
import app, { server } from '../../server';
import { prepareTestUser } from '../setup';
import FoursquareClient from '../../clients/foursquare';

let user;

describe('Foursquare auth endpoints', () => {
    beforeAll(async () => {
        user = await prepareTestUser('fsq-auth');
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
        const testData = {
            code: 'code',
            url: 'url',
            accessToken: '12345',
            foursquareId: '123',
        };
        const mockAquireToken = jest.spyOn(FoursquareClient, 'aquireToken');
        mockAquireToken.mockResolvedValueOnce(testData.accessToken);
        const mockGetUser = jest.spyOn(FoursquareClient, 'getUserData');
        mockGetUser.mockResolvedValueOnce({
            user: { id: testData.foursquareId },
            error: null,
        });
        const response = await request(app)
            .post('/foursquare-login')
            .send({
                code: testData.code,
                redirectUrl: testData.url,
            });
        expect(mockAquireToken).toHaveBeenCalledWith(testData.code, testData.url);
        expect(mockGetUser).toHaveBeenCalledWith(testData.accessToken);
        expect(response.ok).toBeTrue();
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('isEmailValid');
        expect(response.body.token).toBeString();
        expect(response.body.isEmailValid).toBeFalse();
    });

    it('should connect existing user to foursquare', async () => {
        const testData = {
            code: 'code',
            url: 'url',
            accessToken: '12345',
            foursquareId: '456',
        };
        const mockAquireToken = jest.spyOn(FoursquareClient, 'aquireToken');
        mockAquireToken.mockResolvedValueOnce(testData.accessToken);
        const mockGetUser = jest.spyOn(FoursquareClient, 'getUserData');
        mockGetUser.mockResolvedValueOnce({
            user: { id: testData.foursquareId },
            error: null,
        });
        const response = await request(app)
            .post('/foursquare-connect')
            .set('Authentication', user.token)
            .send({
                code: testData.code,
                redirectUrl: testData.url,
            });
        expect(mockAquireToken).toHaveBeenCalledWith(testData.code, testData.url);
        expect(mockGetUser).toHaveBeenCalledWith(testData.accessToken);
        expect(response.ok).toBeTrue();
        expect(response.body).toHaveProperty('token');
        expect(response.body.token).toBeString();
    });
});
