import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import db from '../models';
import requiredAuthentication from '../middlewares/authentication.middleware';

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

    .get('editTaskStatus', '/taskstatuses/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findByPk(id);

      if (!taskStatus) {
        ctx.status = 404;
        return;
      }

      await ctx.render('taskstatuses/edit', { f: buildFormObj(taskStatus), taskStatus });
    })

    .post('/taskstatuses', requiredAuthentication, async (ctx) => {
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

    .patch('taskStatus', '/taskstatuses/:id', requiredAuthentication, async (ctx) => {
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

    .delete('/taskstatuses/:id', requiredAuthentication, async (ctx) => {
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findByPk(id);

      if (!taskStatus) {
        ctx.status = 404;
        return;
      }

      await taskStatus.destroy();
      ctx.redirect(router.url('taskStatuses'));
    });
};
