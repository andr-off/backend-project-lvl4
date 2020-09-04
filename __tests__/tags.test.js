import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import db from '../server/models';

import getApp from '../server';

describe('requests to /tags', () => {
  let req;
  let server;

  const { Tag, User } = db;

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

  let tagUrl;
  let editTagUrl;
  const tagsUrl = '/tags';
  const newTagUrl = '/tags/new';
  const tagUnexistedUrl = '/tags/5';

  beforeAll(async () => {
    expect.extend(matchers);
  });

  beforeEach(async () => {
    await Tag.drop();
    await Tag.sync();
    await User.drop();
    await User.sync();

    const { id } = await Tag.create({ name: 'UI' });

    tagUrl = `/tags/${id}`;
    editTagUrl = `${tagUrl}/edit`;

    await User.create(data);

    server = getApp().listen();
    req = request.agent(server);
  });

  test('GET /tags', async () => {
    const res1 = await req
      .get(tagsUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res = await req
      .set('Cookie', cookie)
      .get(tagsUrl);
    expect(res).toHaveHTTPStatus(200);
  });

  test('GET /tags/new', async () => {
    const res1 = await req
      .get(newTagUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .get(newTagUrl);
    expect(res2).toHaveHTTPStatus(200);
  });

  test('GET /tags/:id/edit', async () => {
    const res1 = await req
      .get(editTagUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .get(editTagUrl);
    expect(res2).toHaveHTTPStatus(200);
  });

  test('POST /tags', async () => {
    const res1 = await req
      .post(tagsUrl)
      .send({ form: { name: 'database' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .post(tagsUrl)
      .type('form')
      .send({ form: { name: 'database' } });
    expect(res2).toHaveHTTPStatus(302);
  });

  test('POST /tags (errors)', async () => {
    const res1 = await req
      .post(tagsUrl)
      .send({ form: { name: 'd' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .post(tagsUrl)
      .type('form')
      .send({ form: { name: 'd' } });
    expect(res2).toHaveHTTPStatus(422);
  });

  test('PATCH /tags/:id', async () => {
    const res1 = await req
      .patch(tagUrl)
      .send({ form: { name: 'db' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .patch(tagUrl)
      .type('form')
      .send({ form: { name: 'db' } });
    expect(res2).toHaveHTTPStatus(302);
  });

  test('PATCH /tags/:id (errors)', async () => {
    const res1 = await req
      .patch(tagUrl)
      .send({ form: { name: '' } });
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .patch(tagUrl)
      .type('form')
      .send({ form: { name: '' } });
    expect(res2).toHaveHTTPStatus(422);
  });

  test('DELETE /tags/:id', async () => {
    const res1 = await req
      .delete(tagUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(tagUrl);
    expect(res2).toHaveHTTPStatus(302);
  });

  test('DELETE /tags/:id (errors)', async () => {
    const res1 = await req
      .delete(tagUnexistedUrl);
    expect(res1).toHaveHTTPStatus(401);

    const cookie = await singIn(formData);

    const res2 = await req
      .set('Cookie', cookie)
      .delete(tagUnexistedUrl);
    expect(res2).toHaveHTTPStatus(404);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
