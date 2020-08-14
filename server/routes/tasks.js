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

export default (router, container) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const { userId } = ctx.session;

      const {
        taskStatusId,
        assignedToId,
        myTasks,
        tagId,
      } = ctx.query;

      const taskStatusQuery = taskStatusId
        ? { model: TaskStatus, where: { id: taskStatusId } }
        : { model: TaskStatus };

      const assignedToQuery = assignedToId
        ? { model: User, as: 'assignee', where: { id: assignedToId } }
        : { model: User, as: 'assignee' };

      const tagQuery = tagId
        ? { model: Tag, as: 'tags', where: { id: tagId } }
        : { model: Tag, as: 'tags' };

      const mytasksQuery = myTasks && userId
        ? { model: User, as: 'maker', where: { id: userId } }
        : { model: User, as: 'maker' };

      const query = {
        order: [['updatedAt', 'DESC']],
        include: [
          taskStatusQuery,
          assignedToQuery,
          tagQuery,
          mytasksQuery,
        ],
      };

      const tasks = await Task.findAll(query);

      const assignees = await User.scope('usedAssignees').findAll();
      const taskStatuses = await TaskStatus.scope('usedStatuses').findAll();
      const tags = await Tag.scope('usedTags').findAll();

      await ctx.render('tasks', {
        tasks,
        assignees,
        taskStatuses,
        tags,
      });
    })

    .get('newTask', '/tasks/new', async (ctx) => {
      const task = Task.build();

      const [status] = await TaskStatus.findCreateFind({ where: { name: 'New' } });
      task.setTaskStatus(status);

      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();

      await ctx.render('tasks/new', {
        f: buildFormObj(task),
        users,
        taskStatuses,
        tags,
      });
    })

    .get('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: { id },
        include: [{ model: Tag, as: 'tags' }],
      });

      if (!task) {
        throw new container.errors.NotFoundError();
      }

      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();
      const selectedTags = await task.getTags();

      await ctx.render('tasks/edit', {
        f: buildFormObj(task),
        users,
        taskStatuses,
        tags,
        selectedTags,
      });
    })

    .post('/tasks', requiredAuthentication, async (ctx) => {
      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);
      form.description = form.description.trim();

      const creator = await User.findByPk(ctx.session.userId);
      const assignedTo = await User.findByPk(form.assignedTo);
      const status = await TaskStatus.findByPk(form.status);

      form.tags = form.tags || [];

      const formTags = await Tag.findAll({
        where: {
          id: form.tags,
        },
      });

      if (!creator || !assignedTo || !status) {
        throw new container.errors.NotFoundError();
      }

      const task = Task.build(form);
      task.setTaskStatus(status);
      task.setAssignee(assignedTo);
      task.setMaker(creator);

      try {
        await task.save();
        await task.setTags(formTags);

        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.status = 422;

        const users = await User.findAll();
        const taskStatuses = await TaskStatus.findAll();
        const tags = await Tag.findAll();
        const selectedTags = formTags;

        await ctx.render('tasks/new', {
          f: buildFormObj(task, e),
          users,
          taskStatuses,
          tags,
          selectedTags,
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

      form.tags = form.tags || [];

      const task = await Task.findOne({
        where: { id },
        include: [{ model: Tag, as: 'tags' }],
      });

      if (!task) {
        throw new container.errors.NotFoundError();
      }

      const formTags = await Tag.findAll({
        where: {
          id: form.tags,
        },
      });

      try {
        await task.update(form);
        await task.setTags(formTags);

        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('tasks', id));
      } catch (e) {
        ctx.status = 422;

        const users = await User.findAll();
        const taskStatuses = await TaskStatus.findAll();
        const tags = await Tag.findAll();
        const selectedTags = formTags;

        await ctx.render('tasks/edit', {
          f: buildFormObj(task, e),
          task,
          users,
          taskStatuses,
          tags,
          selectedTags,
        });
      }
    })

    .delete('/tasks/:id', requiredAuthentication, async (ctx) => {
      const { id } = ctx.params;

      const task = await Task.findByPk(id);

      if (!task) {
        throw new container.errors.NotFoundError();
      }

      await task.destroy();
      ctx.redirect(router.url('tasks'));
    });
};
