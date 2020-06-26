const requiredAuthentication = async (ctx, next) => {
  const { isSignedIn } = ctx.state;

  if (isSignedIn()) {
    await next();
  } else {
    ctx.status = 403;
  }
};

export default requiredAuthentication;
