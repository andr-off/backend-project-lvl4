const requiredAuthorizetion = async (ctx, next) => {
  const { id } = ctx.params;
  const userId = String(ctx.session.userId);

  if (id === userId) {
    await next();
  } else {
    ctx.status = 403;
  }
};

export default requiredAuthorizetion;
