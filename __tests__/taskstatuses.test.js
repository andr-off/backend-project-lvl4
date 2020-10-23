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

describe('requests to /taskstatuses', () => {
  let req;
  let server;
  let formData;
  let dbData;

  const taskStatusesUrl = '/taskstatuses';
  const editTaskStatusUrl = '/taskstatuses/1/edit';
  const taskStatusUrl = '/taskstatuses/1';
  const newTaskStatusUrl = '/taskstatuses/new';

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

  test('GET /taskstatuses', async () => {
    const res = await req
      .get(taskStatusesUrl);
    expect(res).toHaveHTTPStatus(200);

    await req.delete('/session');

    const res2 = await req
      .get(taskStatusesUrl);
    expect(res2).toHaveHTTPStatus(401);
  });

  test('GET /taskstatuses/new', async () => {
    const res = await req
      .get(newTaskStatusUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /taskstatuses/1/edit', async () => {
    const res = await req
      .get(editTaskStatusUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /taskstatuses', async () => {
    const res = await req
      .post(taskStatusesUrl)
      .type('form')
      .send(formData.taskStatus.newTaskStatus);
    expect(res).toHaveHTTPStatus(302);

    const newTaskStatusName = formData.taskStatus.newTaskStatus.form.name;
    const taskStatus = await db.TaskStatus.findOne({ where: { name: newTaskStatusName } });

    expect(taskStatus).not.toBeNull();
  });

  test('POST /taskstatuses (errors)', async () => {
    const res = await req
      .post(taskStatusesUrl)
      .type('form')
      .send(formData.taskStatus.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /taskstatuses/1', async () => {
    const res = await req
      .patch(taskStatusUrl)
      .type('form')
      .send(formData.taskStatus.patch);
    expect(res).toHaveHTTPStatus(302);

    const taskStatusNewName = formData.taskStatus.patch.form.name;
    const taskStatus = await db.TaskStatus.findOne({ where: { name: taskStatusNewName } });

    expect(taskStatus).not.toBeNull();
  });

  test('PATCH /taskstatuses/1 (errors)', async () => {
    const res = await req
      .patch(taskStatusUrl)
      .type('form')
      .send(formData.taskStatus.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /taskstatuses/1', async () => {
    const taskUrl = '/tasks/1';

    const res1 = await req
      .delete(taskStatusUrl);
    expect(res1).toHaveHTTPStatus(302);

    const taskStatus1 = await db.TaskStatus.findByPk(1);

    expect(taskStatus1).not.toBeNull();

    await req.delete(taskUrl);

    const res2 = await req
      .delete(taskStatusUrl);
    expect(res2).toHaveHTTPStatus(302);

    const taskStatus2 = await db.TaskStatus.findByPk(1);

    expect(taskStatus2).toBeNull();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
