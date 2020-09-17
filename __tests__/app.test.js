import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';
import db from '../server/models';

import getApp from '../server';

describe('app', () => {
  let req;
  let server;

  const singIn = async (data) => {
    const res = await req
      .post('/session')
      .type('form')
      .send(data);

    const cookie = res.headers['set-cookie'];

    return cookie;
  };

  const getDataForUser = () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
  });

  const {
    TaskStatus,
    Task,
    User,
    Tag,
    TaskTag,
  } = db;

  const usersUrl = '/users';
  const taskStatusesUrl = '/taskstatuses';
  const tagsUrl = '/tags';
  const tasksUrl = '/tasks';

  const taskUrl = '/tasks/1';

  const dataForUser1 = getDataForUser();
  const dataForUser2 = getDataForUser();

  const userFormData1 = { form: dataForUser1 };
  const wrongFormData = { form: { name: 'h' } };

  const taskFormData = {
    form: {
      name: 'Delete unused tags',
      description: '',
      creator: 1,
      assignedTo: 1,
      status: 1,
      tags: 1,
    },
  };

  const wrongTaskFormData = {
    form: {
      name: '',
      description: '',
      creator: 1,
      assignedTo: 1,
      status: 1,
      tags: [],
    },
  };

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    await User.drop();
    await User.sync();
    await TaskStatus.drop();
    await TaskStatus.sync();
    await Tag.drop();
    await Tag.sync();
    await TaskTag.drop();
    await TaskTag.sync();
    await Task.drop();
    await Task.sync();

    const { id: userId } = await User.create(dataForUser1);
    await User.create(dataForUser2);

    const { id: statusId } = await TaskStatus.create({ name: 'New' });
    await TaskStatus.create({ name: 'In progress' });

    const tag = await Tag.create({ name: 'UI' });
    await Tag.create({ name: 'Important' });

    const dataForTask = {
      name: 'Create sum function',
      description: 'Function must add two numbers',
      status: statusId,
      creator: userId,
      assignedTo: userId,
    };

    const task = await Task.create(dataForTask);
    await task.setTags(tag);

    server = getApp().listen();
    req = request.agent(server);
  });

  describe('GET requests', () => {
    const rootUrl = '/';
    const wrongUrl = '/wrong-path';
    const newSessionUrl = '/session/new';
    const editUserUrl = '/users/1/edit';
    const newUserUrl = '/users/new';
    const unexistedEditUserUrl = '/users/1000/edit';
    const editTaskStatusUrl = '/taskstatuses/1/edit';
    const newTaskStatusUrl = '/taskstatuses/new';
    const unexistedEditTaskStatusUrl = '/taskstatuses/1000/edit';
    const editTagUrl = '/tags/1/edit';
    const newTagUrl = '/tags/new';
    const unexistedEditTagUrl = '/tags/1000/edit';
    const editTaskUrl = '/tasks/1/edit';
    const newTaskUrl = '/tasks/new';
    const unexistedEditTaskUrl = '/tasks/1000/edit';

    const getRequestTestCases = [
      ['GET /', rootUrl, 200],
      ['GET /wrongUrl', wrongUrl, 404],
      ['GET /session/new', newSessionUrl, 200],
      ['GET /users', usersUrl, 200],
      ['GET /users/new', newUserUrl, 200],
    ];

    test.each(getRequestTestCases)('%s', async (_testName, url, statusCode) => {
      const res = await req
        .get(url);
      expect(res).toHaveHTTPStatus(statusCode);
    });

    const getRequestTestWithAuthCases = [
      ['GET /users/1/edit', editUserUrl, 403, 200],
      ['GET /users/1000/edit (404)', unexistedEditUserUrl, 403, 403],
      ['GET /taskstatuses', taskStatusesUrl, 401, 200],
      ['GET /taskstatuses/1/edit', editTaskStatusUrl, 401, 200],
      ['GET /taskstatuses/1000/edit (404)', unexistedEditTaskStatusUrl, 401, 404],
      ['GET /taskstatuses/new', newTaskStatusUrl, 401, 200],
      ['GET /tags', tagsUrl, 401, 200],
      ['GET /tags/1/edit', editTagUrl, 401, 200],
      ['GET /tags/1000/edit (404)', unexistedEditTagUrl, 401, 404],
      ['GET /tags/new', newTagUrl, 401, 200],
      ['GET /tasks', tasksUrl, 401, 200],
      ['GET /tasks/1/edit', editTaskUrl, 401, 200],
      ['GET /tasks/1000/edit', unexistedEditTaskUrl, 401, 404],
      ['GET /tasks/new', newTaskUrl, 401, 200],
    ];

    test.each(getRequestTestWithAuthCases)('%s', async (_testName, url, statusCode1, statusCode2) => {
      const res1 = await req
        .get(url);
      expect(res1).toHaveHTTPStatus(statusCode1);

      const cookie = await singIn(userFormData1);

      const res2 = await req
        .set('Cookie', cookie)
        .get(url);
      expect(res2).toHaveHTTPStatus(statusCode2);
    });
  });

  describe('POST requests', () => {
    const sessionUrl = '/session';

    const wrongUserFormData = {
      form: {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      },
    };

    const taskstatusFormData = { form: { name: 'Done' } };
    const tagFormData = { form: { name: 'Backend' } };

    const postRequestTestCases = [
      ['POST /session', sessionUrl, userFormData1, 302],
      ['POST /session (error)', sessionUrl, wrongUserFormData, 422],
      ['POST /users', usersUrl, { form: getDataForUser() }, 302],
      ['POST /users (error)', usersUrl, wrongUserFormData, 422],
    ];

    test.each(postRequestTestCases)('%s', async (_testName, url, data, statusCode) => {
      const res = await req
        .post(url)
        .send(data);
      expect(res).toHaveHTTPStatus(statusCode);
    });

    const postRequestTestWithAuthCases = [
      ['POST /taskstatuses', taskStatusesUrl, taskstatusFormData, 302],
      ['POST /taskstatuses (error)', taskStatusesUrl, wrongFormData, 422],
      ['POST /tags', tagsUrl, tagFormData, 302],
      ['POST /tags (error)', tagsUrl, wrongFormData, 422],
      ['POST /tasks', tasksUrl, taskFormData, 302],
      ['POST /tasks (error)', tasksUrl, wrongTaskFormData, 422],
    ];

    test.each(postRequestTestWithAuthCases)('%s', async (_testName, url, data, statusCode) => {
      const cookie = await singIn(userFormData1);

      const res = await req
        .set('Cookie', cookie)
        .post(url)
        .send(data);
      expect(res).toHaveHTTPStatus(statusCode);
    });
  });

  describe('PATCH requests', () => {
    const userUrl1 = '/users/1';
    const taskStatusUrl1 = '/taskstatuses/1';
    const tagsUrl1 = '/tags/1';

    const patchPersonalUserFormData1 = {
      form: {
        email: dataForUser1.email,
        firstName: 'Mike',
        lastName: dataForUser1.lastName,
      },
    };

    const patchPersonalUserFormData2 = {
      form: {
        email: 'admin@gmail.com',
        firstName: dataForUser1.firstName,
        lastName: dataForUser1.lastName,
      },
    };

    const wrongPatchPersonalUserFormData = {
      form: {
        email: '',
        firstName: '',
        lastName: '',
      },
    };

    const patchPasswordUserFormData = {
      password: {
        current: dataForUser1.password,
        password: '12345',
        confirm: '12345',
      },
    };

    const wrongPatchPasswordUserFormData1 = {
      password: {
        current: '',
        password: '12345',
        confirm: '12345',
      },
    };

    const wrongPatchPasswordUserFormData2 = {
      password: {
        current: dataForUser1.password,
        password: '',
        confirm: '',
      },
    };

    const patchTaskstatusFormData = { form: { name: 'Finished' } };
    const patchTagFormData = { form: { name: 'Frontend' } };

    const patchTaskFormData = {
      form: {
        name: taskFormData.form.name,
        description: 'All tags that unused must be deleted',
        creator: 1,
        assignedTo: 1,
        status: 1,
        tags: [],
      },
    };

    const patchRequestTestWithAuthCases = [
      ['PATCH /users/1 (personal)', userUrl1, patchPersonalUserFormData1, 302],
      ['PATCH /users/1 (personal)', userUrl1, patchPersonalUserFormData2, 302],
      ['PATCH /users/1 (personal error)', userUrl1, wrongPatchPersonalUserFormData, 422],
      ['PATCH /users/1 (password)', userUrl1, patchPasswordUserFormData, 302],
      ['PATCH /users/1 (password error1)', userUrl1, wrongPatchPasswordUserFormData1, 422],
      ['PATCH /users/1 (password error2)', userUrl1, wrongPatchPasswordUserFormData2, 422],
      ['PATCH /taskstatuses/1', taskStatusUrl1, patchTaskstatusFormData, 302],
      ['PATCH /taskstatuses/1 (error)', taskStatusUrl1, wrongFormData, 422],
      ['PATCH /tags/1', tagsUrl1, patchTagFormData, 302],
      ['PATCH /tags/1 (error)', tagsUrl1, wrongFormData, 422],
      ['PATCH /tasks/1', taskUrl, patchTaskFormData, 302],
      ['PATCH /tasks/1 (error)', taskUrl, wrongTaskFormData, 422],
    ];

    test.each(patchRequestTestWithAuthCases)('%s', async (_testName, url, data, statusCode) => {
      const cookie = await singIn(userFormData1);

      const res = await req
        .set('Cookie', cookie)
        .patch(url)
        .send(data);
      expect(res).toHaveHTTPStatus(statusCode);
    });
  });

  describe('DELETE requests', () => {
    const userUrl2 = '/users/2';
    const unexistedTaskStatusUrl = '/taskstatuses/1000';
    const taskStatusUrl2 = '/taskstatuses/2';
    const tagsUrl2 = '/tags/2';
    const unexistedTagUrl = '/tags/1000';
    const unexistedTaskUrl = '/tasks/1000';

    const userFormData2 = { form: dataForUser2 };

    const deleteRequestTestWithAuthCases = [
      ['DELETE /users/2', userUrl2, 302],
      ['DELETE /taskstatuses/2', taskStatusUrl2, 302],
      ['DELETE /taskstatuses/1000 (error)', unexistedTaskStatusUrl, 404],
      ['DELETE /tags/2', tagsUrl2, 302],
      ['DELETE /tags/1000 (error)', unexistedTagUrl, 404],
      ['DELETE /tasks/1', taskUrl, 302],
      ['DELETE /tasks/1000 (error)', unexistedTaskUrl, 404],
    ];

    test.each(deleteRequestTestWithAuthCases)('%s', async (_testName, url, statusCode) => {
      const cookie = await singIn(userFormData2);

      const res1 = await req
        .set('Cookie', cookie)
        .delete(url);
      expect(res1).toHaveHTTPStatus(statusCode);
    });
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
