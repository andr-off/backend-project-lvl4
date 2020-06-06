import dotenv from 'dotenv';
import parseDbUrl from 'parse-db-url';

dotenv.config();
const config = parseDbUrl(process.env.DATABASE_URL);

console.log(config);
export default {
  development: {
    username: config.user,
    password: config.password,
    database: config.database,
    host: config.host,
    port: config.port,
    dialect: config.adapter,
  },
  test: {
    storage: './db.development.sqlite',
    dialect: 'sqlite',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
};
