import dotenv from 'dotenv';
import parseDbUrl from 'parse-db-url';

dotenv.config();
const config = parseDbUrl(process.env.DATABASE_URL);

const {
  user: username,
  password,
  database,
  host,
  port,
  adapter: dialect,
  ...rest
} = config;

export default {
  development: {
    storage: './db.development.sqlite',
    dialect: 'sqlite',
  },
  test: {
    storage: ':memory:',
    dialect: 'sqlite',
  },
  production: {
    username,
    password,
    database,
    host,
    port,
    dialect,
    options: rest,
  },
};
