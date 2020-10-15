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
  let formUserData;

  const userUrl = '/users/1';
  const newUserUrl = '/users/new';
  const usersUrl = '/users';
  const editUserUrl = '/users/1/edit';

  const user = getDataForUser();

  const dbData = {
    user,
  };

  beforeAll(async () => {
    expect.extend(matchers);

    const formUserDataJson = await readFile('formUserData.json');

    formUserData = JSON.parse(formUserDataJson);

    formUserData.user = {
      form: user,
    };
  });

  beforeEach(async () => {
    await resetDb();
    await populateDb(dbData);

    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET /users/new', async () => {
    const res = await req
      .get(newUserUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /users/1/edit', async () => {
    const res1 = await req
      .get(editUserUrl);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await signIn(req, formUserData.user);

    const res2 = await req
      .set('Cookie', cookie)
      .get(editUserUrl);
    expect(res2).toHaveHTTPStatus(200);
  });

  test('POST /users', async () => {
    const res = await req
      .post(usersUrl)
      .type('form')
      .send({
        form: getDataForUser(),
      });
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /users (errors1)', async () => {
    const res = await req
      .post(usersUrl)
      .type('form')
      .send(formUserData.wrong1);
    expect(res).toHaveHTTPStatus(422);
  });

  test('POST /users (errors2)', async () => {
    const res = await req
      .post(usersUrl)
      .type('form')
      .send(formUserData.wrong2);
    expect(res).toHaveHTTPStatus(422);
  });

  test('POST /users (errors3)', async () => {
    const res = await req
      .post(usersUrl)
      .type('form')
      .send(formUserData.wrong3);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /users', async () => {
    const cookie = await signIn(req, formUserData.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(userUrl)
      .type('form')
      .send(formUserData.patch);
    expect(res).toHaveHTTPStatus(302);
  });

  test('PATCH /users (errors1)', async () => {
    const cookie = await signIn(req, formUserData.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(userUrl)
      .type('form')
      .send(formUserData.wrongPatch1);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /users (errors2)', async () => {
    const cookie = await signIn(req, formUserData.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(userUrl)
      .type('form')
      .send(formUserData.wrongPatch2);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /users (errors3)', async () => {
    const cookie = await signIn(req, formUserData.user);

    const res = await req
      .set('Cookie', cookie)
      .patch(userUrl)
      .type('form')
      .send(formUserData.wrongPatch3);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /users/1', async () => {
    const res1 = await req
      .delete(userUrl);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await signIn(req, formUserData.user);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(userUrl);
    expect(res2).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
