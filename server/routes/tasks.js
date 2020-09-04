import i18next from 'i18next';
import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import requiredAuthentication from '../middlewares/authentication.middleware';

export default (router, container) => {
  router
    .get('tasks', '/tasks', requiredAuthentication, async (ctx) => {
      const {
        Task,
        User,
        TaskStatus,
        Tag,
      } = container.db;

      const { userId } = ctx.session;

      const {
        taskStatusId,
        assignedToId,
        myTasks,
        tagId,
      } = ctx.query;

      const query = {
        order: [['createdAt', 'DESC']],
        include: [
          { model: TaskStatus, as: 'taskStatus' },
          { model: User, as: 'maker' },
          { model: User, as: 'assignee' },
          { model: Tag, as: 'tags' },
        ],
        where: {},
      };

      if (taskStatusId) {
        query.where.status = taskStatusId;
      }

      if (assignedToId) {
        query.where.assignedTo = assignedToId;
      }

      if (myTasks) {
        query.where.creator = userId;
      }

      if (tagId) {
        query.where['$tags.id$'] = tagId;
      }

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

    .get('newTask', '/tasks/new', requiredAuthentication, async (ctx) => {
      const {
        Task,
        User,
        TaskStatus,
        Tag,
      } = container.db;

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

    .get('editTask', '/tasks/:id/edit', requiredAuthentication, async (ctx) => {
      const {
        Task,
        User,
        TaskStatus,
        Tag,
      } = container.db;

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
      const {
        Task,
        User,
        TaskStatus,
        Tag,
      } = container.db;

      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);
      form.description = form.description.trim();

      const creator = await User.findByPk(ctx.session.userId);
      const assignedTo = await User.findByPk(form.assignedTo);
      const status = await TaskStatus.findByPk(form.status);

      form.tags = form.tags || [];

      const selectedTags = await Tag.findAll({
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
        await task.setTags(selectedTags);

        ctx.flash('info', i18next.t('flash.tasks.create.success'));
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.tasks.create.error'));

        const users = await User.findAll();
        const taskStatuses = await TaskStatus.findAll();
        const tags = await Tag.findAll();

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
      const {
        Task,
        User,
        TaskStatus,
        Tag,
      } = container.db;

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

        ctx.flash('info', i18next.t('flash.tasks.patch.success'));
        ctx.redirect(router.url('tasks', id));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.tasks.patch.error'));

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
      const { Task } = container.db;
      const { id } = ctx.params;

      const task = await Task.findByPk(id);

      if (!task) {
        throw new container.errors.NotFoundError();
      }

      await task.destroy();

      ctx.flash('info', i18next.t('flash.tasks.delete.success'));
      ctx.redirect(router.url('tasks'));
    });
};
