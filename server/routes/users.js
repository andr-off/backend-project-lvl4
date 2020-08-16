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

    .get('user', '/users/:id', async (ctx) => {
      const { User } = container.db;
      const { id } = ctx.params;
      const user = await User.findByPk(id);

      if (!user) {
        throw new container.errors.NotFoundError();
      }

      await ctx.render('users/show', { user });
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

        ctx.flash.set('User has been created');
        ctx.redirect(router.url('newSession'));
      } catch (e) {
        ctx.status = 422;
        await ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })

    .patch('/users/:id', requiredAuthorization, async (ctx) => {
      const { User } = container.db;
      const { id } = ctx.params;
      const { request: { body: { form, password } } } = ctx;

      const user = await User.findByPk(id);

      if (!user) {
        throw new container.errors.NotFoundError();
      }

      if (form) {
        form.email = normalizeEmail(form.email);
        form.firstName = normalizeName(form.firstName);
        form.lastName = normalizeName(form.lastName);

        try {
          await user.update(form);

          ctx.flash.set('User has been updated');
          ctx.redirect(router.url('editUser', id));
        } catch (e) {
          ctx.status = 422;
          await ctx.render('users/edit', {
            f: buildFormObj(user, e),
            p: buildFormObj(user, e, 'password'),
          });
        }

        return;
      }

      if (user.passwordDigest !== encrypt(password.current)) {
        ctx.status = 422;
        await ctx.render('users/edit', {
          f: buildFormObj(user),
          p: buildFormObj(user, {
            errors: [
              { path: 'current', message: 'Wrong password' },
            ],
          }, 'password'),
        });

        return;
      }

      if (password.password !== password.confirm) {
        ctx.status = 422;
        await ctx.render('users/edit', {
          f: buildFormObj(user),
          p: buildFormObj(user, {
            errors: [
              { path: 'password', message: 'Must be equal "Confirm password"' },
              { path: 'confirm', message: 'Must be equal "New password"' },
            ],
          }, 'password'),
        });

        return;
      }

      try {
        await user.update(password);

        ctx.flash.set('Password has been updated');
        ctx.redirect(router.url('editUser', id));
      } catch (e) {
        ctx.status = 422;
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

      await user.destroy();

      ctx.session = {};
      ctx.flash.set('User has been deleted');
      ctx.redirect(router.url('root'));
    });
};
