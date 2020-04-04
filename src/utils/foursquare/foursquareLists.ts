import axios from 'axios';
import { getUserLists } from './foursquareUser';

const foursquareUrl = 'https://api.foursquare.com/v2/lists/';

export const getListsData = async (accessToken: string) => {
    return await getUserLists(accessToken);
};
