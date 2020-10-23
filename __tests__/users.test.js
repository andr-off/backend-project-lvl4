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

describe('requests to /users', () => {
  let req;
  let server;
  let formData;
  let dbData;

  const userUrl = '/users/1';
  const newUserUrl = '/users/new';
  const usersUrl = '/users';
  const editUserUrl = '/users/1/edit';

  const user = getDataForUser();

  beforeAll(async () => {
    expect.extend(matchers);

    const formDataJson = await readFile('formData.json');
    const dbDataJson = await readFile('dbData.json');

    formData = JSON.parse(formDataJson);
    dbData = JSON.parse(dbDataJson);

    dbData.user = user;

    formData.user.user = {
      form: user,
    };

    server = getApp().listen();
    req = request.agent(server);
  });

  beforeEach(async () => {
    await resetDb();
    await populateDb(dbData);

    const cookie = await signIn(req, formData.user.user);

    await req.set('Cookie', cookie);
  });

  test('GET /users', async () => {
    const res = await req
      .get(usersUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /users/new', async () => {
    const res = await req
      .get(newUserUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /users/1/edit', async () => {
    const res1 = await req
      .get(editUserUrl);
    expect(res1).toHaveHTTPStatus(200);

    await req.delete('/session');

    const res2 = await req
      .get(editUserUrl);
    expect(res2).toHaveHTTPStatus(403);
  });

  test('POST /users', async () => {
    const newUserData = getDataForUser();

    const res = await req
      .post(usersUrl)
      .type('form')
      .send({
        form: newUserData,
      });
    expect(res).toHaveHTTPStatus(302);

    const userFromDb = await db.User.findOne({
      where: {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
      },
    });

    expect(userFromDb.firstName).not.toBeNull();
  });

  test('POST /users (errors1)', async () => {
    const res = await req
      .post(usersUrl)
      .type('form')
      .send(formData.user.wrong1);
    expect(res).toHaveHTTPStatus(422);
  });

  test('POST /users (errors2)', async () => {
    const res = await req
      .post(usersUrl)
      .type('form')
      .send(formData.user.wrong2);
    expect(res).toHaveHTTPStatus(422);
  });

  test('POST /users (errors3)', async () => {
    const res = await req
      .post(usersUrl)
      .type('form')
      .send(formData.user.wrong3);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /users', async () => {
    const res = await req
      .patch(userUrl)
      .type('form')
      .send(formData.user.patch);
    expect(res).toHaveHTTPStatus(302);

    const userNewName = formData.user.patch.form.firstName;
    const userNewEmail = formData.user.patch.form.email;
    const userFromDb = await db.User.findByPk(1);

    expect(userFromDb.firstName).toMatch(userNewName);
    expect(userFromDb.email).toMatch(userNewEmail);
  });

  test('PATCH /users (errors1)', async () => {
    const res = await req
      .patch(userUrl)
      .type('form')
      .send(formData.user.wrongPatch1);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /users (errors2)', async () => {
    const res = await req
      .patch(userUrl)
      .type('form')
      .send(formData.user.wrongPatch2);
    expect(res).toHaveHTTPStatus(422);
  });

  test('PATCH /users (errors3)', async () => {
    const res = await req
      .patch(userUrl)
      .type('form')
      .send(formData.user.wrongPatch3);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /users/1', async () => {
    const taskUrl = '/tasks/1';

    req.delete(userUrl);

    const userFromDb1 = await db.User.findByPk(1);

    expect(userFromDb1).not.toBeNull();

    await req.delete(taskUrl);

    const res2 = await req
      .delete(userUrl);
    expect(res2).toHaveHTTPStatus(302);

    const userFromDb2 = await db.User.findByPk(1);

    expect(userFromDb2).toBeNull();
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
