const dotenv = require('dotenv');
const parseDbUrl = require('parse-db-url');

dotenv.config();
const databaseUrl = process.env.DATABASE_URL || 'postgres://localhost';
const config = parseDbUrl(databaseUrl);

const {
  user: username,
  password,
  database,
  host,
  port,
  adapter: dialect,
  ...rest
} = config;

module.exports = {
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
