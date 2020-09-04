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

  const singIn = async (data) => {
    const res = await req
      .post('/session')
      .type('form')
      .send(data);

    const cookie = res.headers['set-cookie'];

    return cookie;
  };

  const getDataForUser = () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
  });

  const dataForUser1 = getDataForUser();
  const dataForUser2 = getDataForUser();

  const formData1 = {
    form: dataForUser1,
  };

  const formData2 = {
    form: dataForUser2,
  };

  const wrongData1 = {
    form: {
      ...dataForUser1,
      email: '',
    },
  };

  const wrongData2 = {
    form: {
      ...dataForUser1,
      password: '123',
    },
  };

  const { password, ...personalData } = getDataForUser();

  const patchReqPersonalFormData = {
    form: personalData,
  };

  const wrongPatchReqPersonalFormData1 = {
    form: {
      ...personalData,
      email: '',
    },
  };

  const wrongPatchReqPersonalFormData2 = {
    form: {
      ...personalData,
      password: '123',
    },
  };

  const patchReqPasswordFormData = {
    password: {
      current: dataForUser1.password,
      password: '12345',
      confirm: '12345',
    },
  };

  const wrongPatchReqPasswordFormData1 = {
    password: {
      current: 'wrongpassword',
      password: '12345',
      confirm: '12345',
    },
  };

  const wrongPatchReqPasswordFormData2 = {
    password: {
      current: dataForUser1.password,
      password: '1234',
      confirm: '12345',
    },
  };

  const wrongPatchReqPasswordFormData3 = {
    password: {
      current: dataForUser1.password,
      password: '123',
      confirm: '123',
    },
  };

  const getRequestTestCases = [
    ['GET 200', rootUrl, 200],
    ['GET 404', wrongUrl, 404],
    ['GET /session/new', newSessionUrl, 200],
    ['GET /users/new', newUserUrl, 200],
  ];

  const postRequestTestCases = [
    ['POST /session', sessionUrl, formData1, 302],
    ['POST /users', usersUrl, { form: getDataForUser() }, 302],
    ['POST /session (errors)', sessionUrl, { form: { email: '', password: '' } }, 422],
    ['POST /users (errors1)', usersUrl, wrongData1, 422],
    ['POST /users (errors2)', usersUrl, wrongData2, 422],
  ];

  const patchRequestTestCases = [
    ['PATCH /users/:id personal', userUrl1, patchReqPersonalFormData, 302],
    ['PATCH /users/:id personal (errors1)', userUrl1, wrongPatchReqPersonalFormData1, 422],
    ['PATCH /users/:id personal (errors2)', userUrl1, wrongPatchReqPersonalFormData2, 422],
    ['PATCH /users/:id password', userUrl1, patchReqPasswordFormData, 302],
    ['PATCH /users/:id password (errors1)', userUrl1, wrongPatchReqPasswordFormData1, 422],
    ['PATCH /users/:id password (errors2)', userUrl1, wrongPatchReqPasswordFormData2, 422],
    ['PATCH /users/:id password (errors3)', userUrl1, wrongPatchReqPasswordFormData3, 422],
  ];

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    await User.drop();
    await User.sync();

    await User.create(dataForUser1);
    await User.create(dataForUser2);

    server = getApp().listen();
    req = request.agent(server);
  });

  test.each(getRequestTestCases)('%s', async (_testName, url, statusCode) => {
    const res = await req
      .get(url);
    expect(res).toHaveHTTPStatus(statusCode);
  });

  test.each(postRequestTestCases)('%s', async (_testName, url, data, statusCode) => {
    const res = await req
      .post(url)
      .type('form')
      .send(data);
    expect(res).toHaveHTTPStatus(statusCode);
  });

  test.each(patchRequestTestCases)('%s', async (_testName, url, data, statusCode) => {
    const res1 = await req
      .patch(url)
      .type('form')
      .send(data);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData1);

    const res2 = await req
      .set('Cookie', cookie)
      .patch(url)
      .type('form')
      .send(data);
    expect(res2).toHaveHTTPStatus(statusCode);
  });

  test('DELETE /session', async () => {
    const res1 = await req
      .post('/session')
      .type('form')
      .send(formData1);
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await req
      .delete('/session');
    expect(res2).toHaveHTTPStatus(302);
  });

  test('DELETE /users/:id', async () => {
    const res1 = await req
      .delete(userUrl1);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData1);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(userUrl1);
    expect(res2).toHaveHTTPStatus(302);
  });

  test('GET /users/:id/edit', async () => {
    const res1 = await req
      .get(editUserUrl1);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData1);

    const res2 = await req
      .set('Cookie', cookie)
      .get(editUserUrl1);
    expect(res2).toHaveHTTPStatus(200);

    const res3 = await req
      .delete('/session');
    expect(res3).toHaveHTTPStatus(302);

    const cookie2 = await singIn(formData2);

    const res4 = await req
      .set('Cookie', cookie2)
      .get(editUserUrl1);
    expect(res4).toHaveHTTPStatus(403);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
