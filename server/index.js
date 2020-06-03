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

import webpackConfig from '../../webpack.config';
import addRoutes from './routes';
import container from '../container';

export default () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const app = new Koa();

  const rollbar = new Rollbar({
    accessToken: process.env.ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.use(serve(path.join(__dirname, '../../public')));

  if (process.env.NODE_ENV === 'development') {
    koaWebpack({
      config: webpackConfig,
    }).then((midleware) => app.use(midleware));
  }

  const router = new Router();

  addRoutes(router);

  app.use(router.routes());
  app.use(router.allowedMethods());
  console.log(path.join(__dirname, '../../server/views'));
  const pug = new Pug({
    viewPath: path.join(__dirname, '../../server/views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development',
    compileDebug: true,
    locals: {},
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });

  pug.use(app);

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
    }
  });

  return app;
};
