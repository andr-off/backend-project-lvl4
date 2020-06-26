import buildFormObj from '../lib/formObjectBuilder';
import db from '../models';

const { TaskStatus } = db;

export default (router) => {
  router
    .get('taskStatuses', '/taskstatuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      await ctx.render('taskstatuses', { taskStatuses });
    })

    .get('newTaskStatus', '/taskstatuses/new', async (ctx) => {
      const taskStatus = TaskStatus.build();
      await ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus) });
    })
};
