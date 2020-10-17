import Koa from 'koa';
import Pug from 'koa-pug';
import serve from 'koa-static';
import path from 'path';
import _ from 'lodash';
import koaWebpack from 'koa-webpack';
import Router from 'koa-router';
import Rollbar from 'rollbar';
import session from 'koa-generic-session';
import flash from 'koa-better-flash';
import bodyPareser from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';
import koaLogger from 'koa-logger';
import i18next from 'i18next';

import ru from './locales/ru';
import addRoutes from './routes';
import container from './container';
import { formatDate, getAlertClass, t } from './lib/helpers';

export default () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const app = new Koa();

  const log = container.logger;

  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  i18next
    .init({
      lng: 'ru',
      fallbackLng: 'en',
      debug: isDevelopment,
      resources: {
        ru,
      },
    });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      log(err);

      switch (err.status) {
        case 403:
          ctx.status = err.status;
          await ctx.render('errors/403');
          return;
        case 401:
          ctx.status = err.status;
          await ctx.render('errors/401');
          return;
        case 404:
          ctx.status = err.status;
          await ctx.render('errors/404');
          return;
        default:
          rollbar.error(err, ctx.request);
          ctx.status = 500;
          await ctx.render('errors/500');
      }
    }
  });

  app.keys = ['the most secret key in the world'];
  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => Boolean(ctx.session.userId),
      user: ctx.session.user,
      currentUrl: ctx.request.url,
    };
    await next();
  });
  app.use(bodyPareser());
  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; //eslint-disable-line
    }
    return null;
  }));

  const publicDir = isDevelopment ? '../public' : '../../public';
  const publicDirPath = path.join(__dirname, publicDir);

  app.use(serve(publicDirPath));

  if (isDevelopment) {
    const configPath = path.join(__dirname, '../webpack.config');
    koaWebpack({
      configPath,
    }).then((midleware) => app.use(midleware));
  }

  app.use(koaLogger());

  const router = new Router();

  addRoutes(router, container);

  app.use(router.routes());
  app.use(router.allowedMethods());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: isDevelopment,
    // debug: isDevelopment,
    compileDebug: true,
    locals: {},
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
      { formatDate },
      { getAlertClass },
      { t },
    ],
  });

  pug.use(app);

  return app;
};
