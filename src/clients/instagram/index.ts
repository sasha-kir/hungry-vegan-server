import axios from 'axios';

import * as Profile from './profile/index';

export const instagramApi = axios.create({
    baseURL: 'https://www.instagram.com/',
});

export default { ...Profile };
