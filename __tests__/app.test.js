import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';
import db from '../server/models';

import getApp from '../server';


describe('requests', () => {
  const { User } = db;
  let server;
  let formData;
  let url;
  let newData;


  beforeAll(async () => {
    expect.extend(matchers);

    await User.sync();

    const data = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email().toLowerCase(),
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
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({
        form:
        {
          firstName: '',
          lastName: '',
          email: '',
          password: formData.form.password,
        },
      });
    expect(res).toHaveHTTPStatus(422);
  });

  test('GET /users/:id/edit', async () => {
    const urlToEditPage = `${url}/edit`;

    const res1 = await request.agent(server)
      .get(urlToEditPage);
    expect(res1).toHaveHTTPStatus(403);

    const res2 = await request.agent(server)
      .post('/session')
      .type('form')
      .send(formData);

    const cookie = res2.headers['set-cookie'];

    const res3 = await request.agent(server)
      .set('Cookie', cookie)
      .get(urlToEditPage);
    expect(res3).toHaveHTTPStatus(200);
  });

  test('GET /users/:id', async () => {
    const res = await request.agent(server)
      .get(url);
    expect(res).toHaveHTTPStatus(200);
  });

  test('PATCH /users/:id', async () => {
    const res = await request.agent(server)
      .patch(url)
      .type('form')
      .send(newData);
    expect(res).toHaveHTTPStatus(302);
  });

  test('PATCH /users/:id (errors)', async () => {
    const wrongData1 = {
      form: {
        ...formData.form,
        email: '',
      },
    };

    const wrongData2 = {
      form: {
        ...formData.form,
        password: '',
      },
    };

    const res1 = await request.agent(server)
      .patch(url)
      .type('form')
      .send(wrongData1);
    expect(res1).toHaveHTTPStatus(422);

    const res2 = await request.agent(server)
      .patch(url)
      .type('form')
      .send(wrongData2);
    expect(res2).toHaveHTTPStatus(422);
  });

  test('DELETE /users/:id', async () => {
    const res1 = await request.agent(server)
      .delete(url);
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await request.agent(server)
      .get(url);
    expect(res2).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
