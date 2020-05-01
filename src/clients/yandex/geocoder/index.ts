import { GeoObject } from 'yandex-api';
import { ListMetaData } from 'internal';
import { geocoderApi } from '..';

interface GeocoderResponse {
    data: ListMetaData | null;
    error: string | null;
}

const normalizeObject = (geoObject: GeoObject): ListMetaData => {
    const [lon, lat] = geoObject.Point.pos.split(' ');
    return {
        location: geoObject.name,
        coordinates: { latitude: Number(lat), longitude: Number(lon) },
        countryCode: geoObject.metaDataProperty.GeocoderMetaData.Address.country_code,
    };
};

export const getLocationCoords = async (location: string): Promise<GeocoderResponse> => {
    try {
        const query = location.split(' ').join('+');
        const { data } = await geocoderApi.get('', {
            params: {
                geocode: query,
                results: 1,
            },
        });
        const results = data.response.GeoObjectCollection.featureMember;
        if (!results.length) {
            return { data: null, error: 'location not found' };
        }
        const geoObject = normalizeObject(results[0].GeoObject);
        return { data: geoObject, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
