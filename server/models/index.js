import path from 'path';
import fs from 'fs';
import Sequelize from 'sequelize';

import configByEnv from '../config/config';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configByEnv[env];
const db = {};

const sequelize = new Sequelize(config);

fs.readdirSync(__dirname)
  .filter((filepath) => {
    const { ext } = path.parse(filepath);
    return ext && (filepath !== basename) && (ext === '.js');
  })
  .forEach((filepath) => {
    const model = sequelize.import(path.join(__dirname, filepath));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
