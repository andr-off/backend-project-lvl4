import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import taskStatuses from './taskstatuses';
import tags from './tags';
import tasks from './tasks';

const controllers = [welcome, users, sessions, taskStatuses, tags, tasks];

export default (router, container) => controllers.forEach((f) => f(router, container));
