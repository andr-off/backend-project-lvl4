import dotenv from 'dotenv';
import parseDbUrl from 'parse-db-url';

dotenv.config();
const databaseUrl = process.env.DATABASE_URL || 'postgres://localhost';
const config = parseDbUrl();

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
    ...rest,
  },
};
