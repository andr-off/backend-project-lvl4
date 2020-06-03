import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import getApp from '../server';

let server;

beforeAll(() => {
  expect.extend(matchers);
});

beforeEach(() => {
  server = getApp().listen();
});

afterEach((done) => {
  server.close();
  done();
});

describe('requests', () => {
  test('GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  test('Get 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });
});

// describe('requests', () => {
//   test('GET 200', async () => {
//     const res = await request.agent(server)
//       .get('/');
//     expect(res).toHaveHTTPStatus(200);
//   });

//   test('Get 404', async () => {
//     const res = await request.agent(server)
//       .get('/wrong-path');
//     expect(res).toHaveHTTPStatus(404);
//   });
// });
