import buildFormObj from '../lib/formObjectBuilder';
import db from '../models';

const { TaskStatus } = db;

export default (router) => {
  router
    .get('taskStatuses', '/taskstatuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      await ctx.render('taskstatuses', { taskStatuses });
    })
};
