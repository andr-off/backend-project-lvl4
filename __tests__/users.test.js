import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';
import db from '../server/models';

import getApp from '../server';


describe('requests to /users', () => {
  let req;
  let server;

  const { User } = db;

  const rootUrl = '/';
  const wrongUrl = '/wrong-path';
  const userUrl1 = '/users/1';
  const wrongUserUrl = '/users/5';
  const newUserUrl = '/users/new';
  const usersUrl = '/users';
  const editUserUrl1 = '/users/1/edit';
  const sessionUrl = '/session';
  const newSessionUrl = '/session/new';

  const getDataForUser = () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
  });

  const dataForUser1 = getDataForUser();
  const dataForUser2 = getDataForUser();

  const formData = {
    form: dataForUser1,
  };

  const formData2 = {
    form: dataForUser2,
  };

  const getQueriesTestCases = [
    ['GET 200', rootUrl, 200],
    ['GET 404', wrongUrl, 404],
    ['GET /session/new', newSessionUrl, 200],
    ['GET /users/new', newUserUrl, 200],
    ['GET /users/:id', userUrl1, 200],
    ['GET /users/:id 404', wrongUserUrl, 404],
  ];

  const postQueriesTestCases = [
    ['POST /session', sessionUrl, formData, 302],
    ['POST /users', usersUrl, { form: getDataForUser() }, 302],
    ['POST /session (errors)', sessionUrl, { form: { email: '', password: '' } }, 422],
    ['POST /users (errors)', usersUrl, { form: { ...dataForUser1, email: '' } }, 422],
  ];

  const patchQueriesTestCases = [
    ['PATCH /users/:id', userUrl1, { form: getDataForUser() }, 302],
    ['PATCH /users/:id (errors1)', userUrl1, { form: { ...formData.form, email: '' } }, 422],
    ['PATCH /users/:id (errors2)', userUrl1, { form: { ...formData.form, password: '' } }, 422],
  ];

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    await User.drop();
    await User.sync();

    server = getApp().listen();
    req = request.agent(server);

    await User.create(dataForUser1);
    await User.create(dataForUser2);
  });

  test.each(getQueriesTestCases)('%s', async (_testName, url, statusCode) => {
    const res = await req
      .get(url);
    expect(res).toHaveHTTPStatus(statusCode);
  });

  test.each(postQueriesTestCases)('%s', async (_testName, url, data, statusCode) => {
    const res = await req
      .post(url)
      .type('form')
      .send(data);
    expect(res).toHaveHTTPStatus(statusCode);
  });

  test.each(patchQueriesTestCases)('%s', async (_testName, url, data, statusCode) => {
    const res = await req
      .patch(url)
      .type('form')
      .send(data);
    expect(res).toHaveHTTPStatus(statusCode);
  });

  test('DELETE /session', async () => {
    const res1 = await req
      .post('/session')
      .type('form')
      .send(formData);
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await req
      .delete('/session');
    expect(res2).toHaveHTTPStatus(302);
  });

  test('DELETE /users/:id', async () => {
    const res1 = await req
      .delete(userUrl1);
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await req
      .get(userUrl1);
    expect(res2).toHaveHTTPStatus(404);
  });


  test('GET /users/:id/edit', async () => {
    const res1 = await req
      .get(editUserUrl1);
    expect(res1).toHaveHTTPStatus(403);

    const res2 = await req
      .post('/session')
      .type('form')
      .send(formData);

    const cookie = res2.headers['set-cookie'];

    const res3 = await req
      .set('Cookie', cookie)
      .get(editUserUrl1);
    expect(res3).toHaveHTTPStatus(200);

    const res4 = await req
      .delete('/session');
    expect(res4).toHaveHTTPStatus(302);

    const res5 = await req
      .post('/session')
      .type('form')
      .send(formData2);

    const cookie2 = res5.headers['set-cookie'];

    const res6 = await req
      .set('Cookie', cookie2)
      .get(editUserUrl1);
    expect(res6).toHaveHTTPStatus(403);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
