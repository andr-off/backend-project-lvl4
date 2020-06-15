import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';
import db from '../server/models';

import getApp from '../server';


describe('requests', () => {
  const { User } = db;
  let server;
  let data;
  let formData;
  let url;
  let newData;


  beforeAll(async () => {
    expect.extend(matchers);

    await User.sync();

    data = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    formData = { form: data };

    const { id } = await User.create(data);
    url = `/users/${id}`;
  });

  beforeEach(async () => {
    server = getApp().listen();
    newData = {
      form: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    };
  });

  test('GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  test('GET /session/new', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /session', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send(formData);
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /session (errors)', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: { email: '', password: '' } });
    expect(res).toHaveHTTPStatus(422);
  });

  test('DELETE /session', async () => {
    const res1 = await request.agent(server)
      .post('/session')
      .type('form')
      .send(formData);
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await request.agent(server)
      .delete('/session');
    expect(res2).toHaveHTTPStatus(302);
  });

  test('GET /users/new', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /users', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send(newData);
    expect(res).toHaveHTTPStatus(302);
  });

  test('POST /users (errors)', async () => {
    const res1 = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: { email: '', password: formData.form.password } });
    expect(res1).toHaveHTTPStatus(422);

    const res2 = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: { email: formData.form.email, password: '' } });
    expect(res2).toHaveHTTPStatus(422);
  });

  test('GET /users/:id/profile', async () => {
    const urlToProfile = `${url}/profile`;

    await request.agent(server)
      .post('/users')
      .type('form')
      .send(formData);

    const res = await request.agent(server)
      .get(urlToProfile);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /users/:id/profile (errors)', async () => {
    const urlToProfile = `${url}/profile`;

    const res1 = await request.agent(server)
      .get(urlToProfile);
    expect(res1).toHaveHTTPStatus(403);

    await request.agent(server)
      .post('/users')
      .type('form')
      .send(newData);

    const res2 = await request.agent(server)
      .get(urlToProfile);
    expect(res2).toHaveHTTPStatus(403);
  });

  test('GET /users/:id', async () => {
    const res = await request.agent(server)
      .get(url);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /users/:id (errors)', async () => {
    const urlOfUnexistedUser = '/users/10000000';
    const res = await request.agent(server)
      .get(urlOfUnexistedUser);
    expect(res).toHaveHTTPStatus(404);
  });

  test('PATCH /users/:id', async () => {
    const res = await request.agent(server)
      .patch(url)
      .type('form')
      .send(newData);
    expect(res).toHaveHTTPStatus(302);
  });

  test('PATCH /users/:id (errors)', async () => {
    const res1 = await request.agent(server)
      .patch(url)
      .type('form')
      .send({
        ...formData,
        email: '',
      });
    expect(res1).toHaveHTTPStatus(422);

    const res2 = await request.agent(server)
      .patch(url)
      .type('form')
      .send({
        ...formData,
        password: '',
      });
    expect(res2).toHaveHTTPStatus(422);
  });

  test('DELETE /users/:id', async () => {
    const res = await request.agent(server)
      .delete(url);
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
