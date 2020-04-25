import axios from 'axios';

import * as OAuth from './oauth';
import * as User from './user';
import * as List from './list';

export const foursquareOAuth = axios.create({
    baseURL: 'https://foursquare.com/oauth2/',
});

export const foursquareApi = axios.create({
    baseURL: 'https://api.foursquare.com/v2/',
});

export default { ...OAuth, ...User, ...List };
