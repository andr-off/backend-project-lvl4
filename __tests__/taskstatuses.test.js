import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import db from '../server/models';

import getApp from '../server';

describe('requests to /taskstatuses', () => {
  let req;
  let server;

  const { TaskStatus, User } = db;

  const singIn = async (data) => {
    const res = await req
      .post('/session')
      .type('form')
      .send(data);

    const cookie = res.headers['set-cookie'];

    return cookie;
  };

  const data = {
    firstName: 'Admin',
    lastName: '',
    email: 'admin@mail.ru',
    password: 'qwerty',
  };

  const formData = { form: data };

  let taskStatusUrl;
  let editTaskStatusUrl;
  const taskStatusesUrl = '/taskstatuses';
  const newTaskStatusUrl = '/taskstatuses/new';
  const taskStatusUnexistedUrl = '/taskstatuses/5';

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    await TaskStatus.drop();
    await TaskStatus.sync();
    await User.drop();
    await User.sync();

    const { id } = await TaskStatus.create({ name: 'new' });

    taskStatusUrl = `/taskstatuses/${id}`;
    editTaskStatusUrl = `${taskStatusUrl}/edit`;

    await User.create(data);

    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET /taskstatuses', async () => {
    const res = await req
      .get(taskStatusesUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /taskstatuses/new', async () => {
    const res = await req
      .get(newTaskStatusUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /taskstatuses/:id/edit', async () => {
    const res = await req
      .get(editTaskStatusUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /taskstatuses', async () => {
    const res1 = await req
      .post(taskStatusesUrl)
      .send({ form: { name: 'done' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .post(taskStatusesUrl)
      .type('form')
      .send({ form: { name: 'done' } });
    expect(res2).toHaveHTTPStatus(302);
  });

  test('POST /taskstatuses (errors)', async () => {
    const res1 = await req
      .post(taskStatusesUrl)
      .send({ form: { name: 'do' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .post(taskStatusesUrl)
      .type('form')
      .send({ form: { name: 'do' } });
    expect(res2).toHaveHTTPStatus(422);
  });

  test('PATCH /taskstatuses/:id', async () => {
    const res1 = await req
      .patch(taskStatusUrl)
      .send({ form: { name: 'done' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .patch(taskStatusUrl)
      .type('form')
      .send({ form: { name: 'done' } });
    expect(res2).toHaveHTTPStatus(302);
  });

  test('PATCH /taskstatuses/:id (errors)', async () => {
    const res1 = await req
      .patch(taskStatusUrl)
      .send({ form: { name: 'do' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .patch(taskStatusUrl)
      .type('form')
      .send({ form: { name: 'do' } });
    expect(res2).toHaveHTTPStatus(422);
  });

  test('DELETE /taskstatuses/:id', async () => {
    const res1 = await req
      .delete(taskStatusUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(taskStatusUrl);
    expect(res2).toHaveHTTPStatus(302);
  });

  test('DELETE /taskstatuses/:id (errors)', async () => {
    const res1 = await req
      .delete(taskStatusUnexistedUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(taskStatusUnexistedUrl);
    expect(res2).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
