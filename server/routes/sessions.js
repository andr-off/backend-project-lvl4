import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/secure';
import db from '../models';
import { normalizeEmail } from '../lib/normilazer';

const { User } = db;

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      await ctx.render('sessions/new', { f: buildFormObj(data) });
    })

    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;

      const normalizedEmail = normalizeEmail(email);

      const user = await User.findOne({
        where: {
          email: normalizedEmail,
        },
      });

      if (user && user.passwordDigest === encrypt(password)) {
        ctx.flash.set('You are logged in');
        ctx.session.userId = user.id;
        ctx.session.user = user;
        ctx.redirect(router.url('root'));
        return;
      }

      const message = 'email or password were wrong';

      ctx.status = 422;
      await ctx.render('sessions/new', { f: buildFormObj({ email }), message });
    })

    .delete('/session', (ctx) => {
      ctx.session = {};
      ctx.flash.set('You are logged out');
      ctx.redirect(router.url('root'));
    });
};
