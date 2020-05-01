import axios from 'axios';

import * as Geocoder from './geocoder';

export const geocoderApi = axios.create({
    baseURL: 'https://geocode-maps.yandex.ru/1.x/',
});

geocoderApi.interceptors.request.use(request => {
    request.params = {
        ...request.params,
        apikey: process.env.YANDEX_API_KEY,
        format: 'json',
        lang: 'en-US',
    };
    return request;
});

export default { ...Geocoder };
