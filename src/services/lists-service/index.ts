import { ServiceResponse } from 'internal';
import * as ListDetails from './list-details/index';
import * as UserLists from './user-lists/index';

export interface ListResponse<T> extends ServiceResponse<T> {
    responseCode: number;
}

export default { ...ListDetails, ...UserLists };
