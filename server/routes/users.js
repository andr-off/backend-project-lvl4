import db from '../models';
import buildFormObj from '../lib/formObjectBuilder';
import {
  normalizeEmail,
  normalizeName,
} from '../lib/normilazer';

const { User } = db;

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      await ctx.render('users', { users });
    })

    .get('newUser', '/users/new', async (ctx) => {
      const user = User.build();
      await ctx.render('users/new', { f: buildFormObj(user) });
    })

    .get('editUser', '/users/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const userId = String(ctx.session.userId);

      if (id !== userId) {
        ctx.status = 403;
        return;
      }

      const user = await User.findByPk(id);

      if (!user) {
        ctx.status = 404;
        return;
      }

      await ctx.render('users/edit', { f: buildFormObj(user), user });
    })

    .get('user', '/users/:id', async (ctx) => {
      const { id } = ctx.params;

      const user = await User.findByPk(id);

      if (!user) {
        ctx.status = 404;
        return;
      }

      await ctx.render('users/show', { user });
    })

    .post('/users', async (ctx) => {
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

    .patch('/users/:id', async (ctx) => {
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;

      form.email = normalizeEmail(form.email);
      form.firstName = normalizeName(form.firstName);
      form.lastName = normalizeName(form.lastName);

      const user = await User.findByPk(id);

      try {
        await user.update(form);

        ctx.flash.set('User has been updated');
        ctx.redirect(router.url('userProfile', { id }));
      } catch (e) {
        ctx.status = 422;
        await ctx.render('users/show', { f: buildFormObj(user, e), user });
      }
    })

    .delete('/users/:id', async (ctx) => {
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
