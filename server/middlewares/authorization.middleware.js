import ForbiddenError from '../errors/ForbiddenError';

const requiredAuthorizetion = async (ctx, next) => {
  const { id } = ctx.params;
  const userId = String(ctx.session.userId);

  if (id === userId) {
    await next();
  } else {
    throw new ForbiddenError();
  }
};

export default requiredAuthorizetion;
