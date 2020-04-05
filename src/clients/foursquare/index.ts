import axios from 'axios';

import { getUserData, getUserLists } from './user';
import { getListData } from './list';

export const foursquareApi = axios.create({
    baseURL: 'https://api.foursquare.com/v2/',
});

export { getUserData, getUserLists, getListData };
