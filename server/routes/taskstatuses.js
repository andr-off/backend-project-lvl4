import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import db from '../models';

const { TaskStatus } = db;

export default (router) => {
  router
    .get('taskStatuses', '/taskstatuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      await ctx.render('taskstatuses', { taskStatuses });
    })

    .get('newTaskStatus', '/taskstatuses/new', async (ctx) => {
      const taskStatus = TaskStatus.build();
      await ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus) });
    })

    .post('/taskstatuses', async (ctx) => {
      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);

      const taskStatus = TaskStatus.build(form);

      try {
        await taskStatus.save();
        ctx.flash.set('Status has been created');
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.status = 422;
        await ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })

    .patch('taskStatus', '/taskstatuses/:id', async (ctx) => {
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;
      const taskStatus = await TaskStatus.findByPk(id);

      form.name = normalizeName(form.name);

      try {
        await taskStatus.update(form);
        ctx.flash.set('Status has been updated');
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.status = 422;
        await ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })
};
