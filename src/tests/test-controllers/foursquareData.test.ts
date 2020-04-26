import request from 'supertest';
import app, { server } from '../../server';
import { prepareTestUser } from '../setup';
import FoursquareClient from '../../clients/foursquare';
import * as TokenUtils from '../../utils/foursquare/accessToken';

let user;

describe('Foursquare data endpoints', () => {
    beforeAll(async done => {
        user = await prepareTestUser('fsq-data');
        done();
    });

    afterAll(() => {
        server.close();
    });

    it('should fetch foursquare lists', async () => {
        const testToken = '12345';
        const testData = [
            {
                id: '1',
                itemsCount: 1,
            },
        ];
        const mockGetToken = jest.spyOn(TokenUtils, 'getAccessTokenFromDb');
        mockGetToken.mockResolvedValueOnce(testToken);
        const mockGetLists = jest.spyOn(FoursquareClient, 'getUserLists');
        mockGetLists.mockResolvedValueOnce({
            error: null,
            data: testData,
        });
        const response = await request(app)
            .get('/user_lists')
            .set('Authentication', user.token);
        expect(mockGetToken).toHaveBeenCalled();
        expect(mockGetLists).toHaveBeenCalledWith(testToken);
        expect(response.ok).toBeTrue();
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toBeArrayOfSize(1);
    });

    it('should not fetch foursquare lists without foursquareId', async () => {
        const response = await request(app)
            .get('/user_lists')
            .set('Authentication', user.token);
        expect(response.badRequest).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });

    it('should not fetch foursquare lists without authentication', async () => {
        const response = await request(app).get('/user_lists');
        expect(response.unauthorized).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });

    it('should fetch foursquare list data', async () => {
        const listId = 1;
        const testToken = '12345';
        const testData = {
            id: '1',
            itemsCount: 1,
        };
        const mockGetToken = jest.spyOn(TokenUtils, 'getAccessTokenFromDb');
        mockGetToken.mockResolvedValueOnce(testToken);
        const mockGetList = jest.spyOn(FoursquareClient, 'getListData');
        mockGetList.mockResolvedValueOnce({
            error: null,
            data: testData,
        });
        const response = await request(app)
            .post('/list_data')
            .send({ listId })
            .set('Authentication', user.token);
        expect(mockGetToken).toHaveBeenCalled();
        expect(mockGetList).toHaveBeenCalledWith(testToken, listId);
        expect(response.ok).toBeTrue();
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toContainAllKeys(['id', 'itemsCount']);
    });

    it('should not fetch list data without foursquareId', async () => {
        const response = await request(app)
            .post('/list_data')
            .send({ listId: 1 })
            .set('Authentication', user.token);
        expect(response.badRequest).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });

    it('should not fetch list data without authentication', async () => {
        const response = await request(app)
            .post('/list_data')
            .send({ listId: 1 });
        expect(response.unauthorized).toBeTrue();
        expect(response.body).toHaveProperty('error');
    });
});
