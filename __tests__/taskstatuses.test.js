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

describe('requests to /users', () => {
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
  });

  beforeEach(async () => {
    await resetDb();
    await populateDb(dbData);

    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET /taskstatuses/new', async () => {
    const res1 = await req
      .get(newTaskStatusUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await signIn(req, formData.user.user);

    const res2 = await req
      .set('Cookie', cookie)
      .get(newTaskStatusUrl);
    expect(res2).toHaveHTTPStatus(200);
  });

  test('GET /taskstatuses/1/edit', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .get(editTaskStatusUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /taskstatuses', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .post(taskStatusesUrl)
      .type('form')
      .send(formData.taskStatus.taskStatus);
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /taskstatuses (errors)', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .post(taskStatusesUrl)
      .type('form')
      .send(formData.taskStatus.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /taskstatuses/1', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(taskStatusUrl)
      .type('form')
      .send(formData.taskStatus.patch);
    expect(res).toHaveHTTPStatus(302);
  });

  test('PATCH /taskstatuses/1 (errors)', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(taskStatusUrl)
      .type('form')
      .send(formData.taskStatus.wrong);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /taskstatuses/1', async () => {
    const res1 = await req
      .delete(taskStatusUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await signIn(req, formData.user.user);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(taskStatusUrl);
    expect(res2).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
