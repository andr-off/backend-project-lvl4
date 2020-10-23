import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import db from '../server/models';

import {
  readFile,
  resetDb,
  populateDb,
  signIn,
  getDataForUser,
} from './helpers';

import getApp from '../server';

describe('requests to /tasks', () => {
  let req;
  let server;
  let formData;
  let dbData;

  const tasksUrl = '/tasks';
  const editTaskUrl = '/tasks/1/edit';
  const taskUrl = '/tasks/1';
  const newTaskUrl = '/tasks/new';

  const user = getDataForUser();

  beforeAll(async () => {
    expect.extend(matchers);

    const formDataJson = await readFile('formData.json');
    const dbDataJson = await readFile('dbData.json');

    formData = JSON.parse(formDataJson);
    dbData = JSON.parse(dbDataJson);

    formData.user.user = {
      form: user,
    };

    dbData.user = user;

    server = getApp().listen();
    req = request.agent(server);
  });

  beforeEach(async () => {
    await resetDb();
    await populateDb(dbData);

    const cookie = await signIn(req, formData.user.user);
    await req.set('Cookie', cookie);
  });

  test('GET /tasks', async () => {
    const res1 = await req
      .get(tasksUrl);
    expect(res1).toHaveHTTPStatus(200);

    await req.delete('/session');

    const res2 = await req
      .get(tasksUrl);
    expect(res2).toHaveHTTPStatus(401);
  });

  test('GET /tasks/new', async () => {
    const res2 = await req
      .get(newTaskUrl);
    expect(res2).toHaveHTTPStatus(200);
  });

  test('GET /tasks/1/edit', async () => {
    const res = await req
      .get(editTaskUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /tasks', async () => {
    const res = await req
      .post(tasksUrl)
      .type('form')
      .send(formData.task.newTask);
    expect(res).toHaveHTTPStatus(302);

    const newTaskName = formData.task.newTask.form.name;
    const task = await db.Task.findOne({ where: { name: newTaskName } });

    expect(task).not.toBeNull();
  });

  test('POST /tasks (errors)', async () => {
    const res = await req
      .post(tasksUrl)
      .type('form')
      .send(formData.task.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /tasks/1', async () => {
    const res = await req
      .patch(taskUrl)
      .type('form')
      .send(formData.task.patch);
    expect(res).toHaveHTTPStatus(302);

    const taskNewName = formData.task.patch.form.name;
    const taskNewDescription = formData.task.patch.form.description;
    const task = await db.Task.findByPk(1);

    expect(task.name).toMatch(taskNewName);
    expect(task.description).toMatch(taskNewDescription);
  });

  test('PATCH /tasks/1 (errors)', async () => {
    const res = await req
      .patch(taskUrl)
      .type('form')
      .send(formData.task.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /tasks/1', async () => {
    const res = await req
      .delete(taskUrl);
    expect(res).toHaveHTTPStatus(302);

    const task = await db.Task.findByPk(1);

    expect(task).toBeNull();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
