import Koa from 'koa';
import Pug from 'koa-pug';
import serve from 'koa-static';
import path from 'path';
import _ from 'lodash';
import koaWebpack from 'koa-webpack';
import Router from 'koa-router';
import Rollbar from 'rollbar';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import bodyPareser from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';
import koaLogger from 'koa-logger';

import addRoutes from './routes';
import container from './container';
import formatDate from './lib/helpers';

export default () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const app = new Koa();

  const log = container.logger;

  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      log(err);

      switch (err.status) {
        case 403:
          ctx.status = err.status;
          await ctx.render('403');
          return;
        case 401:
          ctx.status = err.status;
          await ctx.render('401');
          return;
        case 404:
          ctx.status = err.status;
          await ctx.render('404');
          return;
        default:
          rollbar.error(err, ctx.request);
          ctx.status = 500;
          await ctx.render('500');
      }
    }
  });

  app.keys = ['the most secret key in the world'];
  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
      user: ctx.session.user,
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
    // compileDebug: true,
    locals: {},
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
      { formatDate },
    ],
  });

  pug.use(app);

  return app;
};
