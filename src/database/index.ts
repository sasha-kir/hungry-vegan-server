import slonikDefault, * as slonikNamespace from 'slonik';
import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';
import config from '../config';

const env = process.env.NODE_ENV || 'development';

const slonik = env === 'production' ? slonikDefault : slonikNamespace;
export const sql = slonik.sql;

const interceptors = [
    createFieldNameTransformationInterceptor({
        format: 'CAMEL_CASE',
    }),
];

const db = slonik.createPool(config[env].database, {
    interceptors: interceptors,
});

export default db;
