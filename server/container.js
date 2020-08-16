import dotenv from 'dotenv';
import logger from './lib/logger';
import errors from './errors';
import db from './models';

dotenv.config();

export default { logger, errors, db };
