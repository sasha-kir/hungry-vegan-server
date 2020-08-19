import * as GetUsers from './get-users';
import * as CreateUsers from './create-users';
import * as UpdateUsers from './update-users';

export default { ...GetUsers, ...CreateUsers, ...UpdateUsers };
