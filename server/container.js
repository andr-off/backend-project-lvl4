import dotenv from 'dotenv';
import logger from './lib/logger';
import errors from './errors';

dotenv.config();

export default { logger, errors };
