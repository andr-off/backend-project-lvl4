import Koa from 'koa';
import Pug from 'koa-pug';
import serve from 'koa-static';
import path from 'path';
import _ from 'lodash';
import koaWebpack from 'koa-webpack';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';

import webpackConfig from './webpack.config';

export default () => {
  dotenv.config();

  const app = new Koa();

  const rollbar = new Rollbar({
    accessToken: process.env.ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true
  });

  app.use(serve(path.join(__dirname, '/public')));

  koaWebpack({
    config: webpackConfig,
  })
    .then((midleware) => app.use(midleware));

  const pug = new Pug({
    viewPath: path.join(__dirname, './views'),
    locals: {},
    basedir: path.join(__dirname, './views'),
    helperPath: [
      { _ },
    ],
  });

  pug.use(app);

  app.use(async (ctx) => {
    await ctx.render('index', { title: 'Hello, World' });
  });

  return app;
};
