/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import * as foursquareAuth from './api/foursquare-auth';
import * as userLists from './api/user-lists';
import * as user from './api/user-data';
import * as auth from './api/authorization';

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

app.get('/user_lists', userLists.getLists);
app.post('/list_data', userLists.getListById);
app.post('/update_lists', userLists.updateLists);

app.get('/user_data', user.getUserData);
app.post('/update_user', user.updateUserData);

app.post('/login', auth.handleLogin);
app.post('/register', auth.handleRegister);

export const server = app.listen(port);

export default app;
