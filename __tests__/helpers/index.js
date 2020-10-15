import path from 'path';
import { promises as fs } from 'fs';
import db from '../../server/models';
import faker from 'faker';

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

  // const { id: statusId } = await TaskStatus.create({ name: 'New' });
  // await TaskStatus.create({ name: 'In progress' });

  // const tag = await Tag.create({ name: 'UI' });
  // await Tag.create({ name: 'Important' });

  // const dataForTask = {
  //   name: 'Create sum function',
  //   description: 'Function must add two numbers',
  //   status: statusId,
  //   creator: userId,
  //   assignedTo: userId,
  // };

  // const task = await Task.create(dataForTask);
  // await task.setTags(tag);
};
