import request from 'supertest';
import matchers from 'jest-supertest-matchers';

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
  });

  beforeEach(async () => {
    await resetDb();
    await populateDb(dbData);

    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET /tasks/new', async () => {
    const res1 = await req
      .get(newTaskUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await signIn(req, formData.user.user);

    const res2 = await req
      .set('Cookie', cookie)
      .get(newTaskUrl);
    expect(res2).toHaveHTTPStatus(200);
  });

  test('GET /tasks/1/edit', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .get(editTaskUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /tasks', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .post(tasksUrl)
      .type('form')
      .send(formData.task.task);
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /tasks (errors)', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .post(tasksUrl)
      .type('form')
      .send(formData.task.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /tasks/1', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(taskUrl)
      .type('form')
      .send(formData.task.patch);
    expect(res).toHaveHTTPStatus(302);
  });

  test('PATCH /tasks/1 (errors)', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(taskUrl)
      .type('form')
      .send(formData.task.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /tasks/1', async () => {
    const res1 = await req
      .delete(taskUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await signIn(req, formData.user.user);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(taskUrl);
    expect(res2).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
