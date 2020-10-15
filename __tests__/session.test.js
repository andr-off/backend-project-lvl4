import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import {
  readFile,
  resetDb,
  populateDb,
  getDataForUser,
} from './helpers';

import getApp from '../server';

describe('requests to /session', () => {
  let req;
  let server;
  let formUserData;

  const sessionUrl = '/session';
  const newSessionUrl = '/session/new';

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

  test('GET /session/new', async () => {
    const res = await req
      .get(newSessionUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /session', async () => {
    const res = await req
      .post(sessionUrl)
      .type('form')
      .send(formUserData.user);
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /session (errors)', async () => {
    const res = await req
      .post(sessionUrl)
      .type('form')
      .send(formUserData.wrong1);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /session', async () => {
    const res1 = await req
      .post('/session')
      .type('form')
      .send(formUserData.user);
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await req
      .delete('/session');
    expect(res2).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
