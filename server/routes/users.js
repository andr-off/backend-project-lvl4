import db from '../models';
import buildFormObj from '../lib/formObjectBuilder';

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

    .post('users', '/users', async (ctx) => {
      const { request: { body: { form } } } = ctx;
      const user = User.build(form);

      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        log(e);
        ctx.status = 422;
        await ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    });
};
