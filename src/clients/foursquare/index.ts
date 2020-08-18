import axios from 'axios';

import * as OAuth from './oauth/index';
import * as User from './user/index';
import * as List from './list/index';

export const foursquareOAuth = axios.create({
    baseURL: 'https://foursquare.com/oauth2/',
});

export const foursquareApi = axios.create({
    baseURL: 'https://api.foursquare.com/v2/',
});

export default { ...OAuth, ...User, ...List };
