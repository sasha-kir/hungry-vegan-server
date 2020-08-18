import * as GetUsers from './get-users/index';
import * as CreateUsers from './create-users/index';
import * as UpdateUsers from './update-users/index';

export default { ...GetUsers, ...CreateUsers, ...UpdateUsers };
