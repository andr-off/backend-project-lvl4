import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import db from '../server/models';

import getApp from '../server';

describe('requests to /tasks', () => {
  let req;
  let server;

  const {
    TaskStatus,
    Task,
    User,
    Tag,
    TaskTag,
  } = db;

  const singIn = async (data) => {
    const res = await req
      .post('/session')
      .type('form')
      .send(data);

    const cookie = res.headers['set-cookie'];

    return cookie;
  };

  const userData = {
    firstName: 'Admin',
    lastName: '',
    email: 'admin@mail.ru',
    password: 'qwerty',
  };

  const formData = { form: userData };
  let taskFormData;
  const wrongFormData = {
    form: {
      name: '',
      description: '',
      creator: 1,
      assignedTo: 1,
      status: 1,
      tags: '',
    },
  };

  let taskUrl;
  let editTaskUrl;
  const tasksUrl = '/tasks';
  const newTaskUrl = '/tasks/new';
  const taskUnexistedUrl = '/tasks/5';

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    await User.drop();
    await User.sync();
    await TaskStatus.drop();
    await TaskStatus.sync();
    await Task.drop();
    await Task.sync();
    await Tag.drop();
    await Tag.sync();
    await TaskTag.drop();
    await TaskTag.sync();

    const { id: userId } = await User.create(userData);
    const { id: statusId } = await TaskStatus.create({ name: 'New' });
    await TaskStatus.create({ name: 'In progress' });

    const taskData = {
      name: 'Create sum function',
      description: '',
      creator: userId,
      assignedTo: userId,
      status: statusId,
      tags: 'foo, bar',
    };

    taskFormData = { form: taskData };

    const task = await Task.create(taskData);

    taskUrl = `/tasks/${task.id}`;
    editTaskUrl = `${taskUrl}/edit`;

    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET /tasks', async () => {
    const res = await req
      .get(tasksUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /tasks/new', async () => {
    const res = await req
      .get(newTaskUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /tasks/:id/edit', async () => {
    const res = await req
      .get(editTaskUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('POST /tasks', async () => {
    const res1 = await req
      .post(tasksUrl)
      .send(taskFormData);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .post(tasksUrl)
      .type('form')
      .send(taskFormData);
    expect(res2).toHaveHTTPStatus(302);
  });

  test('POST /tasks (errors)', async () => {
    const res1 = await req
      .post(tasksUrl)
      .send(wrongFormData);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .post(tasksUrl)
      .type('form')
      .send(wrongFormData);
    expect(res2).toHaveHTTPStatus(422);
  });

  test('PATCH /tasks/:id', async () => {
    const res1 = await req
      .patch(taskUrl)
      .send({ form: { ...taskFormData.form, status: 2 } });
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .patch(taskUrl)
      .type('form')
      .send({ form: { ...taskFormData.form, status: 2 } });
    expect(res2).toHaveHTTPStatus(302);
  });

  test('PATCH /tasks/:id (errors)', async () => {
    const res1 = await req
      .patch(taskUrl)
      .send(wrongFormData);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .patch(taskUrl)
      .type('form')
      .send(wrongFormData);
    expect(res2).toHaveHTTPStatus(422);
  });

  test('DELETE /tasks/:id', async () => {
    const res1 = await req
      .delete(taskUrl);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(taskUrl);
    expect(res2).toHaveHTTPStatus(302);
  });

  test('DELETE /tasks/:id (errors)', async () => {
    const res1 = await req
      .delete(taskUnexistedUrl);
    expect(res1).toHaveHTTPStatus(403);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(taskUnexistedUrl);
    expect(res2).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});