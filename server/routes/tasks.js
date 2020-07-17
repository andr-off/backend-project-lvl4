import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import db from '../models';
import requiredAuthentication from '../middlewares/authentication.middleware';

const {
  Task,
  User,
  TaskStatus,
  Tag,
} = db;

const getTagsFromStr = async (str) => {
  if (str.length === 0) {
    return [];
  }

  const promises = str.split(' ')
    .map((name) => ({ name: normalizeName(name) }))
    .map(async (item) => {
      const [tag] = await Tag.findCreateFind({ where: item });
      return tag;
    });

  const tags = await Promise.all(promises);

  return tags;
};

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const { filter, value } = ctx.query;
      let tasks;

      const query = {
        order: [['updatedAt', 'DESC']],
        include: [
          { model: User, as: 'maker' },
          { model: User, as: 'assignee' },
          TaskStatus,
        ],
      };

      if (!filter || !value) {
        tasks = await Task.findAll(query);
      } else {
        tasks = await Task.scope({ method: [filter, value] }).findAll(query);
      }

      const assignees = await User.scope('usedAssignees').findAll();
      const statuses = await TaskStatus.scope('usedStatuses').findAll();
      const tags = await Tag.scope('usedTags').findAll();

      await ctx.render('tasks', {
        tasks,
        assignees,
        statuses,
        tags,
      });
    })

    .get('newTask', '/tasks/new', async (ctx) => {
      const task = Task.build();

      const [{ id }] = await TaskStatus.findCreateFind({ where: { name: 'New' } });
      task.status = id;

      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      await ctx.render('tasks/new', { f: buildFormObj(task), users, taskStatuses });
    })

    .get('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: { id },
        include: [{ model: Tag, as: 'tags' }],
      });
      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      if (!task) {
        ctx.status = 404;
        return;
      }

      await ctx.render('tasks/edit', {
        f: buildFormObj(task),
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

      const tags = await getTagsFromStr(form.tags);

      const task = Task.build(form);

      try {
        await task.save();
        await task.setTags(tags);

        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.status = 422;

        const users = await User.findAll();
        const taskStatuses = await TaskStatus.findAll();

        await ctx.render('tasks/new', {
          f: buildFormObj(task, e),
          users,
          taskStatuses,
        });
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

      const tags = await getTagsFromStr(form.tags);

      const task = await Task.findOne({
        where: { id },
        include: [{ model: Tag, as: 'tags' }],
      });

      try {
        await task.update(form);
        await task.setTags(tags);

        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('tasks', id));
      } catch (e) {
        ctx.status = 422;

        const users = await User.findAll();
        const taskStatuses = await TaskStatus.findAll();

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
