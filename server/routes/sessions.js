import i18next from 'i18next';
import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/secure';
import { normalizeEmail } from '../lib/normilazer';

export default (router, container) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      await ctx.render('sessions/new', { f: buildFormObj(data) });
    })

    .post('session', '/session', async (ctx) => {
      const { User } = container.db;
      const { email, password } = ctx.request.body.form;

      const normalizedEmail = normalizeEmail(email);

      const user = await User.findOne({
        where: {
          email: normalizedEmail,
        },
      });

      if (user && user.passwordDigest === encrypt(password)) {
        ctx.flash('info', i18next.t('flash.session.create.success'));
        ctx.session.userId = user.id;
        ctx.session.user = user;
        ctx.redirect(router.url('tasks'));
        return;
      }

      ctx.flash('error', i18next.t('flash.session.create.error'));
      ctx.status = 422;
      await ctx.render('sessions/new', { f: buildFormObj({ email }) });
    })

    .delete('/session', (ctx) => {
      ctx.session = {};
      ctx.flash('info', i18next.t('flash.session.delete.success'));
      ctx.redirect(router.url('root'));
    });
};
