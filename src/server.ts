/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createPool } from 'slonik';

import * as foursquareAuth from './controllers/foursquare-auth';
import * as foursquareData from './controllers/foursquare-data';
import * as user from './controllers/user-data';
import * as auth from './controllers/auth';

require('dotenv').config();

const db = createPool(process.env.DATABASE_URL);

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (_req, res) => {
    res.send('Hungry Vegan API is up and running');
});

app.get('/foursquare-client-id', foursquareAuth.getClientID);
app.post('/foursquare-connect', foursquareAuth.foursquareConnect(db));
app.post('/foursquare-login', foursquareAuth.foursquareLogin(db));

app.get('/foursquare-lists', foursquareData.getLists(db));

app.get('/user_data', user.getUserData(db));

app.post('/login', auth.handleLogin(db));
app.post('/hash', auth.hashPass);

app.listen(port, () => {
    console.log(`Hungry Vegan API is running on port ${port}`);
});
