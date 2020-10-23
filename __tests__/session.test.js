import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import {
  readFile,
  resetDb,
  populateDb,
  getDataForUser,
  signIn,
} from './helpers';

import getApp from '../server';

describe('requests to /session', () => {
  let req;
  let server;
  let formData;

  const sessionUrl = '/session';
  const newSessionUrl = '/session/new';

  const user = getDataForUser();

  const dbData = {
    user,
  };

  beforeAll(async () => {
    expect.extend(matchers);

    const formDataJson = await readFile('formData.json');

    formData = JSON.parse(formDataJson);

    formData.user.user = {
      form: user,
    };

    server = getApp().listen();
    req = request.agent(server);
  });

  beforeEach(async () => {
    await resetDb();
    await populateDb(dbData);
  });

  test('GET /session/new', async () => {
    const res = await req
      .get(newSessionUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /session', async () => {
    const res = await req
      .post(sessionUrl)
      .type('form')
      .send(formData.user.user);
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /session (errors)', async () => {
    const res = await req
      .post(sessionUrl)
      .type('form')
      .send(formData.user.wrong1);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /session', async () => {
    const cookie = await signIn(req, formData.user.user);

    const res = await req
      .set('Cookie', cookie)
      .delete('/session');
    expect(res).toHaveHTTPStatus(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
