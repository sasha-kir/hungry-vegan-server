import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import NodeCache from 'node-cache';

import config from './config';
import { checkToken } from './middlewares/jwt';
import { handleUnauthorized } from './middlewares/errorHandler';

import * as foursquareAuth from './api/foursquare-auth';
import * as userLists from './api/user-lists';
import * as user from './api/user-data';
import * as auth from './api/authorization';

const env = process.env.NODE_ENV || 'development';

const cache = new NodeCache();

const app = express();
const port = config[env].port;

app.use(bodyParser.json());
app.use(cors());
app.use(checkToken());
app.use(handleUnauthorized());

app.get('/', (_req, res) => {
    res.send('Hungry Vegan API is up and running');
});

app.get('/oauth_id', foursquareAuth.getClientID);
app.post('/foursquare_login', foursquareAuth.foursquareLogin);
app.post('/foursquare_connect', foursquareAuth.foursquareConnect);

app.get('/user_lists', (req, res) => userLists.getLists(req, res, cache));
app.get('/public_lists', (req, res) => userLists.getPublicLists(req, res, cache));
app.post('/public_list_data', (req, res) => userLists.getListData(req, res, cache));

app.post('/update_lists', (req, res) => userLists.updateLists(req, res, cache));
app.post('/update_venue_details', (req, res) => userLists.updateVenueDetails(req, res, cache));

app.get('/user_data', (req, res) => user.getUserData(req, res, cache));
app.post('/user_location', user.getUserLocation);
app.post('/update_user', (req, res) => user.updateUserData(req, res, cache));

app.post('/login', auth.handleLogin);
app.post('/register', auth.handleRegister);

export const server = app.listen(port);

export default app;
