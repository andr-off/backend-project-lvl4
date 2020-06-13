import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/secure';
import db from '../models';

const { User } = db;

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      await ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
        return;
      }
      const message = 'email or password were wrong';
      ctx.status = 422;
      await ctx.render('sessions/new', { f: buildFormObj({ email, message }) });
    })
    .delete('session', '/session', (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};