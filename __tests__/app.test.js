import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import getApp from '../server';

describe('requests to /', () => {
  let req;
  let server;

  const rootUrl = '/';
  const wrongUrl = '/wrong-path';

  beforeAll(async () => {
    expect.extend(matchers);
    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET 200', async () => {
    const res = await req
      .get(rootUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET 404', async () => {
    const res = await req
      .get(wrongUrl);
    expect(res).toHaveHTTPStatus(404);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
