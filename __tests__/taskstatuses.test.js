import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import db from '../server/models';

import getApp from '../server';

describe('requests to /taskstatuses', () => {
  let req;
  let server;

  const { TaskStatus } = db;

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    await TaskStatus.drop();
    await TaskStatus.sync();

    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET /taskstatuses', async () => {
    const res = await req
      .get('/taskstatuses');
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /taskstatuses/new', async () => {
    const res = await req
      .get('/taskstatuses/new');
    expect(res).toHaveHTTPStatus(200);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
