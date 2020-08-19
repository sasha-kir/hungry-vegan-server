import { ServiceResponse } from 'internal';
import * as ListDetails from './list-details';
import * as UserLists from './user-lists';

export interface ListResponse<T> extends ServiceResponse<T> {
    responseCode: number;
}

export default { ...ListDetails, ...UserLists };
