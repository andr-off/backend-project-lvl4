import i18next from 'i18next';
import buildFormObj from '../lib/formObjectBuilder';
import {
  normalizeEmail,
  normalizeName,
} from '../lib/normilazer';
import requiredAuthorization from '../middlewares/authorization.middleware';

export default (router, container) => {
  router
    .get('users', '/users', async (ctx) => {
      const { User } = container.db;

      const users = await User.findAll();

      await ctx.render('users', { users });
    })

    .get('newUser', '/users/new', async (ctx) => {
      const { User } = container.db;
      const user = User.build();
      await ctx.render('users/new', { f: buildFormObj(user) });
    })

    .get('editUser', '/users/:id/edit', requiredAuthorization, async (ctx) => {
      const { User } = container.db;
      const { id } = ctx.params;
      const user = await User.findByPk(id);

      if (!user) {
        throw new container.errors.NotFoundError();
      }

      await ctx.render('users/edit', { f: buildFormObj(user) });
    })

    .post('/users', async (ctx) => {
      const { User } = container.db;
      const { request: { body: { form } } } = ctx;

      form.email = normalizeEmail(form.email);
      form.firstName = normalizeName(form.firstName);
      form.lastName = normalizeName(form.lastName);

      const user = User.build(form);

      try {
        await user.save();
        ctx.flash('info', i18next.t('flash.users.create.success'));
        ctx.redirect(router.url('newSession'));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.users.create.error'));
        await ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })

    .patch('user', '/users/:id', requiredAuthorization, async (ctx) => {
      const { User } = container.db;
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;

      const user = await User.findByPk(id);

      if (!user) {
        throw new container.errors.NotFoundError();
      }

      form.email = normalizeEmail(form.email);
      form.firstName = normalizeName(form.firstName);
      form.lastName = normalizeName(form.lastName);

      const { password, ...formWithoutPassword } = form;

      const userData = password === '' ? formWithoutPassword : form;

      try {
        await user.update(userData);

        ctx.flash('info', i18next.t('flash.users.patch.success'));
        ctx.redirect(router.url('editUser', id));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.users.patch.error'));
        await ctx.render('users/edit', {
          f: buildFormObj(user, e),
        });
      }
    })

    .delete('/users/:id', requiredAuthorization, async (ctx) => {
      const { User, Task } = container.db;
      const { id } = ctx.params;

      const user = await User.findByPk(id);

      if (!user) {
        throw new container.errors.NotFoundError();
      }

      const tasks = await Task.findAll({
        where: {
          [container.db.Sequelize.Op.or]: [
            { creator: user.id },
            { assignedTo: user.id },
          ],
        },
      });

      if (tasks.length > 0) {
        ctx.flash('error', i18next.t('flash.users.delete.dependError'));
        ctx.status = 422;
        await ctx.render('users/edit', {
          f: buildFormObj(user),
        });
        return;
      }

      try {
        await user.destroy();

        ctx.session.userId = null;
        ctx.session.user = null;
        ctx.flash('info', i18next.t('flash.users.delete.success'));
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.flash('error', i18next.t('flash.users.delete.error'));
        ctx.redirect(router.url('editUser', id));
      }
    });
};
