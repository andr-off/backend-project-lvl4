import i18next from 'i18next';
import buildFormObj from '../lib/formObjectBuilder';
import {
  normalizeEmail,
  normalizeName,
} from '../lib/normilazer';
import requiredAuthorization from '../middlewares/authorization.middleware';
import encrypt from '../lib/secure';

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

      await ctx.render('users/edit', { f: buildFormObj(user), p: buildFormObj(user, [], 'password') });
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
      const { request: { body: { form, password } } } = ctx;

      const user = await User.findByPk(id);

      if (!user) {
        throw new container.errors.NotFoundError();
      }

      const userData = form || password;

      if (form) {
        userData.email = normalizeEmail(userData.email);
        userData.firstName = normalizeName(userData.firstName);
        userData.lastName = normalizeName(userData.lastName);
      } else {
        if (user.passwordDigest !== encrypt(password.current)) {
          ctx.status = 422;
          ctx.flash('error', i18next.t('flash.users.patch.error'));
          await ctx.render('users/edit', {
            f: buildFormObj(user),
            p: buildFormObj(user, {
              errors: [
                { path: 'current', message: i18next.t('validation.users.wrongPassword') },
              ],
            }, 'password'),
          });

          return;
        }

        if (password.password !== password.confirm) {
          ctx.status = 422;
          ctx.flash('error', i18next.t('flash.users.patch.error'));
          await ctx.render('users/edit', {
            f: buildFormObj(user),
            p: buildFormObj(user, {
              errors: [
                { path: 'password', message: i18next.t('validation.users.passwordsMustBeEqual') },
                { path: 'confirm', message: i18next.t('validation.users.passwordsMustBeEqual') },
              ],
            }, 'password'),
          });

          return;
        }
      }

      try {
        await user.update(userData);

        ctx.flash('info', i18next.t('flash.users.patch.success'));
        ctx.redirect(router.url('editUser', id));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.users.patch.error'));
        await ctx.render('users/edit', {
          f: buildFormObj(user, e),
          p: buildFormObj(user, e, 'password'),
        });
      }
    })

    .delete('/users/:id', requiredAuthorization, async (ctx) => {
      const { User } = container.db;
      const { id } = ctx.params;

      const user = await User.findByPk(id);

      if (!user) {
        throw new container.errors.NotFoundError();
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
