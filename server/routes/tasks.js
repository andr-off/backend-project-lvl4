import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import db from '../models';
import requiredAuthentication from '../middlewares/authentication.middleware';

const { Task, User, TaskStatus } = db;

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const rawTasks = await Task.findAll();

      const promises = rawTasks.map(async (task) => {
        const maker = await task.getMaker();
        const creator = maker.fullName;

        const assignee = await task.getAssignee();
        const assignedTo = assignee.fullName;

        const taskStatus = await task.getTaskStatus();
        const status = taskStatus.name;

        return {
          id: task.id,
          name: task.name,
          description: task.description,
          creator,
          assignedTo,
          status,
        };
      });

      const tasks = await Promise.all(promises);

      await ctx.render('tasks', { tasks });
    })

    .get('newTask', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      await ctx.render('tasks/new', { f: buildFormObj(task), users, taskStatuses });
    })

    .get('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      if (!task) {
        ctx.status = 404;
        return;
      }

      await ctx.render('tasks/edit', {
        f: buildFormObj(task),
        task,
        users,
        taskStatuses,
      });
    })

    .post('/tasks', requiredAuthentication, async (ctx) => {
      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);
      form.description = form.description.trim();
      form.creator = Number(ctx.session.userId);
      form.assignedTo = Number(form.assignedTo);
      form.status = Number(form.status);


      const task = Task.build(form);

      try {
        await task.save();

        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.status = 422;

        await ctx.render('tasks/new', { f: buildFormObj(task, e) });
      }
    })

    .patch('task', '/tasks/:id', requiredAuthentication, async (ctx) => {
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);
      form.description = form.description.trim();
      form.creator = Number(ctx.session.userId);
      form.assignedTo = Number(form.assignedTo);
      form.status = Number(form.status);

      const task = await Task.findByPk(id);
      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      try {
        await task.update(form);

        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('tasks', id));
      } catch (e) {
        ctx.status = 422;
        await ctx.render('tasks/edit', {
          f: buildFormObj(task, e),
          task,
          users,
          taskStatuses,
        });
      }
    })

    .delete('/tasks/:id', requiredAuthentication, async (ctx) => {
      const { id } = ctx.params;

      const task = await Task.findByPk(id);

      if (!task) {
        ctx.status = 404;
        return;
      }

      await task.destroy();

      ctx.redirect(router.url('tasks'));
    });
};
