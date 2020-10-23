import i18next from 'i18next';
import buildFormObj from '../lib/formObjectBuilder';
import { getTagObjectsFromStr } from '../lib/helpers';
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

      const scopes = [
        { method: ['byStatus', taskStatusId] },
        { method: ['byCreator', myTasks === 'on' ? userId : null] },
        { method: ['byAssignedTo', assignedToId] },
        { method: ['byTag', tagId] },
      ];

      const tasks = await Task.scope(['defaultScope', ...scopes]).findAll();

      const assignees = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();

      await ctx.render('tasks', {
        tasks,
        assignees,
        taskStatuses,
        tags,
        filterState: ctx.query,
      });
    })

    .get('newTask', '/tasks/new', requiredAuthentication, async (ctx) => {
      const {
        Task,
        User,
        TaskStatus,
      } = container.db;

      const task = Task.build();
      const [status] = await TaskStatus.findCreateFind({ where: { name: 'New' } });

      task.setTaskStatus(status);

      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      await ctx.render('tasks/new', {
        f: buildFormObj(task),
        users,
        taskStatuses,
      });
    })

    .get('editTask', '/tasks/:id/edit', requiredAuthentication, async (ctx) => {
      const {
        Task,
        User,
        TaskStatus,
      } = container.db;

      const { id } = ctx.params;

      const task = await Task.findByPk(id);

      if (!task) {
        throw new container.errors.NotFoundError();
      }

      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();

      await ctx.render('tasks/edit', {
        f: buildFormObj(task),
        users,
        taskStatuses,
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

      const creator = ctx.session.user;
      const assignedTo = await User.findByPk(form.assignedTo);
      const status = await TaskStatus.findByPk(form.status);

      const tagObjects = await getTagObjectsFromStr(form.tags);

      const users = await User.findAll();
      const taskStatuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();

      const task = Task.build(form);

      if (!assignedTo || !status) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.tasks.create.error'));

        await ctx.render('tasks/new', {
          f: buildFormObj(task, {
            errors: [
              { path: 'assignedTo', message: i18next.t('flash.tasks.mustExist') },
              { path: 'status', message: i18next.t('flash.tasks.mustExist') },
            ],
          }),
          users,
          taskStatuses,
          tags,
        });

        return;
      }

      task.setTaskStatus(status);
      task.setAssignee(assignedTo);
      task.setMaker(creator);

      const t = await container.db.sequelize.transaction();

      try {
        await task.save({ transaction: t });

        const createdTags = await Tag.bulkCreate(tagObjects, {
          ignoreDuplicates: true,
          transaction: t,
        });

        const tagNames = createdTags.map(({ name }) => name);

        const selectedTags = await Tag.findAll({ where: { name: tagNames } });

        await task.setTags(selectedTags, { transaction: t });

        await t.commit();

        ctx.flash('info', i18next.t('flash.tasks.create.success'));
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        await t.rollback();

        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.tasks.create.error'));

        await ctx.render('tasks/new', {
          f: buildFormObj(task, e),
          users,
          taskStatuses,
          tags,
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
      form.assignedTo = Number(form.assignedTo);
      form.status = Number(form.status);

      const task = await Task.findByPk(id);

      if (!task) {
        throw new container.errors.NotFoundError();
      }

      const tagObjects = await getTagObjectsFromStr(form.tags);

      const { creator, ...formWithoutCreator } = form;

      const t = await container.db.sequelize.transaction();

      try {
        await task.update(formWithoutCreator, { transaction: t });

        const createdTags = await Tag.bulkCreate(tagObjects, {
          ignoreDuplicates: true,
          transaction: t,
        });

        const tagNames = createdTags.map(({ name }) => name);

        const selectedTags = await Tag.findAll({ where: { name: tagNames } });

        await task.setTags(selectedTags, { transaction: t });

        await t.commit();

        ctx.flash('info', i18next.t('flash.tasks.patch.success'));
        ctx.redirect(router.url('tasks', id));
      } catch (e) {
        await t.rollback();

        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.tasks.patch.error'));

        const users = await User.findAll();
        const taskStatuses = await TaskStatus.findAll();
        const tags = await Tag.findAll();

        await ctx.render('tasks/edit', {
          f: buildFormObj(task, e),
          users,
          taskStatuses,
          tags,
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
