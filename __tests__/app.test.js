import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';
import db from '../server/models';

import getApp from '../server';


describe('requests', () => {
  const { User } = db;
  User.sync();

  let server;
  let query;
  let formData;
  let wrongData;
  let resAfterAddingUser;

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    server = getApp().listen();
    query = request.agent(server);
    formData = {
      form: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    };
    wrongData = {
      form: {
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    };
    resAfterAddingUser = await query
      .post('/users')
      .type('form')
      .send(formData);
  });

  test('GET 200', async () => {
    const res = await query
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET 404', async () => {
    const res = await query
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  test('GET /session/new', async () => {
    const res = await query
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /session', async () => {
    const res = await query
      .post('/session')
      .type('form')
      .send(formData);
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /session (errors)', async () => {
    const res = await query
      .post('/session')
      .type('form')
      .send(wrongData);
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /session', async () => {
    const res1 = await query
      .post('/session')
      .type('form')
      .send(formData);
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await query
      .delete('/session');
    expect(res2).toHaveHTTPStatus(302);
  });

  test('GET /users/new', async () => {
    const res = await query
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /users', async () => {
    expect(resAfterAddingUser).toHaveHTTPStatus(302);
  });

  test('POST /users (errors)', async () => {
    const res1 = await query
      .post('/users')
      .type('form')
      .send({ form: { email: '', password: formData.form.password } });
    expect(res1).toHaveHTTPStatus(422);

    const res2 = await query
      .post('/users')
      .type('form')
      .send({ form: { email: formData.form.email, password: '' } });
    expect(res2).toHaveHTTPStatus(422);
  });

  test('GET /users/:id/settings', async () => {
    const url = resAfterAddingUser.headers.location;

    const res2 = await query
      .get(url);
    expect(res2).toHaveHTTPStatus(200);
  });

  test('PATCH /users/:id', async () => {
    const url = resAfterAddingUser.headers.location.match(/\/users\/\d+/)[0];

    const res = await query
      .patch(url)
      .type('form')
      .send({
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: faker.internet.password(),
      });
    expect(res).toHaveHTTPStatus(302);
  });

  test('PATCH /users/:id (errors)', async () => {
    const url = resAfterAddingUser.headers.location.match(/\/users\/\d+/)[0];

    const res = await query
      .patch(url)
      .type('form')
      .send({
        ...formData,
        email: '',
      });
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /users/:id', async () => {
    const url = resAfterAddingUser.headers.location.match(/\/users\/\d+/)[0];

    const res = await query
      .delete(url);
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
