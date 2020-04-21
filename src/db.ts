import { createPool } from 'slonik';
import config from './config';

const env = process.env.NODE_ENV || 'development';
const db = createPool(config[env].database);

export default db;
