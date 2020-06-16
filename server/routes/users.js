import db from '../models';
import buildFormObj from '../lib/formObjectBuilder';
import {
  normalizeEmail,
  normalizeName,
} from '../lib/normilazer';

const { User } = db;

export default (router, container) => {
  const log = container.logger;

  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      await ctx.render('users', { users });
    })

    .get('newUser', '/users/new', async (ctx) => {
      const user = User.build();
      await ctx.render('users/new', { f: buildFormObj(user) });
    })

    .get('userPage', '/users/:id', async (ctx) => {
      const { id } = ctx.params;

      try {
        const user = await User.findOne({
          where: {
            id,
          },
        });

        if (!user) {
          ctx.status = 404;
          return;
        }

        await ctx.render('users/page', { user });
      } catch (e) {
        log(e);
        ctx.status = 500;
      }
    })

    .get('userProfile', '/users/:id/profile', async (ctx) => {
      const { id } = ctx.params;
      const userId = String(ctx.session.userId);
      let user;

      if (id !== userId) {
        ctx.status = 403;
        return;
      }

      try {
        user = await User.findOne({
          where: {
            id,
          },
        });

        if (!user) {
          ctx.status = 404;
          return;
        }

        await ctx.render('users/profile', { f: buildFormObj(user), user });
      } catch (e) {
        log(e);
        ctx.status = 422;
        await ctx.render('users/profile', { f: buildFormObj(user, e) });
      }
    })

    .post('users', '/users', async (ctx) => {
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
        log(e);
        ctx.status = 422;
        await ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })

    .patch('userUpdate', '/users/:id', async (ctx) => {
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;

      form.email = normalizeEmail(form.email);
      form.firstName = normalizeName(form.firstName);
      form.lastName = normalizeName(form.lastName);

      let user;

      try {
        user = await User.findOne({
          where: {
            id,
          },
        });

        await user.update(form);

        ctx.flash.set('User has been updated');
        ctx.redirect(router.url('userProfile', { id }));
      } catch (e) {
        log(e);
        ctx.status = 422;
        await ctx.render('users/profile', { f: buildFormObj(user, e), user });
      }
    })

    .delete('deleteUser', '/users/:id', async (ctx) => {
      const { id } = ctx.params;

      const user = await User.findByPk(id);

      if (!user) {
        ctx.status = 404;
        return;
      }

      await user.destroy();
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
