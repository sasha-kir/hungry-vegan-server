/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
// import knex from 'knex';

import * as foursquare from './controllers/foursquare-auth';

require('dotenv').config();

// const db = knex({
//   client: 'pg',
//   connection: process.env.DATABASE_URL,
// });

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (_req, res) => {
    res.send('Hungry Vegan API is up and running');
});

app.get('/foursquare-client-id', foursquare.getClientID);
app.post('/foursquare-token', foursquare.getToken);

app.listen(port, () => {
    console.log(`Hungry Vegan API is running on port ${port}`);
});
