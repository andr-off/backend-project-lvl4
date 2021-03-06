import path from 'path';
import { promises as fs } from 'fs';
import faker from 'faker';

import db from '../../server/models';

export const signIn = async (req, data) => {
  const res = await req
    .post('/session')
    .type('form')
    .send(data);

  const cookie = res.headers['set-cookie'];

  return cookie;
};

export const getDataForUser = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password(),
});

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

export const readFile = (filename) => fs.readFile(getFixturePath(filename), 'utf-8');

export const resetDb = () => db.sequelize.sync({ force: true });

export const populateDb = async (dbData) => {
  await db.User.create(dbData.user);
  await db.TaskStatus.create(dbData.taskStatus);
  await db.Task.create(dbData.task);
};
