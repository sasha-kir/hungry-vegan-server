/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import * as foursquareAuth from './controllers/foursquare-auth';
import * as foursquareLists from './controllers/foursquare-lists';
import * as user from './controllers/user-data';
import * as auth from './controllers/auth';

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (_req, res) => {
    res.send('Hungry Vegan API is up and running');
});

app.get('/foursquare-client-id', foursquareAuth.getClientID);
app.post('/foursquare-connect', foursquareAuth.foursquareConnect);
app.post('/foursquare-login', foursquareAuth.foursquareLogin);

app.get('/user_lists', foursquareLists.getLists);
app.post('/list_data', foursquareLists.getListById);

app.get('/user_data', user.getUserData);
app.post('/update_user', user.updateUserData);

app.post('/login', auth.handleLogin);
app.post('/register', auth.handleRegister);
app.post('/hash', auth.hashPass);

export const server = app.listen(port);

export default app;
