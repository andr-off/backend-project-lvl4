import i18next from 'i18next';
import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import requiredAuthentication from '../middlewares/authentication.middleware';

export default (router, container) => {
  router
    .get('taskStatuses', '/taskstatuses', requiredAuthentication, async (ctx) => {
      const { TaskStatus } = container.db;

      const taskStatuses = await TaskStatus.findAll();
      await ctx.render('taskstatuses', { taskStatuses });
    })

    .get('newTaskStatus', '/taskstatuses/new', requiredAuthentication, async (ctx) => {
      const { TaskStatus } = container.db;

      const taskStatus = TaskStatus.build();
      await ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus) });
    })

    .get('editTaskStatus', '/taskstatuses/:id/edit', requiredAuthentication, async (ctx) => {
      const { TaskStatus } = container.db;
      const { id } = ctx.params;

      const taskStatus = await TaskStatus.findByPk(id);

      if (!taskStatus) {
        throw new container.errors.NotFoundError();
      }

      await ctx.render('taskstatuses/edit', { f: buildFormObj(taskStatus) });
    })

    .post('/taskstatuses', requiredAuthentication, async (ctx) => {
      const { TaskStatus } = container.db;
      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);

      const taskStatus = TaskStatus.build(form);

      try {
        await taskStatus.save();
        ctx.flash('info', i18next.t('flash.taskStatuses.create.success'));
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.taskStatuses.create.error'));
        await ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })

    .patch('taskStatus', '/taskstatuses/:id', requiredAuthentication, async (ctx) => {
      const { TaskStatus } = container.db;
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;

      const taskStatus = await TaskStatus.findByPk(id);

      if (!taskStatus) {
        throw new container.errors.NotFoundError();
      }

      form.name = normalizeName(form.name);

      try {
        await taskStatus.update(form);
        ctx.flash('info', i18next.t('flash.taskStatuses.patch.success'));
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.taskStatuses.patch.error'));
        await ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })

    .delete('/taskstatuses/:id', requiredAuthentication, async (ctx) => {
      const { TaskStatus, Task } = container.db;
      const { id } = ctx.params;

      const taskStatus = await TaskStatus.findByPk(id);

      if (!taskStatus) {
        throw new container.errors.NotFoundError();
      }

      const tasks = await Task.scope([{ method: ['byStatus', taskStatus.id] }]).findAll();

      if (tasks.length > 0) {
        ctx.flash('error', i18next.t('flash.taskStatuses.delete.dependError'));
        ctx.redirect(router.url('taskStatuses'));
        return;
      }

      try {
        await taskStatus.destroy();

        ctx.flash('info', i18next.t('flash.taskStatuses.delete.success'));
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.flash('error', i18next.t('flash.taskStatuses.delete.error'));
        ctx.redirect(router.url('taskStatuses'));
      }
    });
};
