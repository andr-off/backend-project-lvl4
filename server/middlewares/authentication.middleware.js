import UnauthorizedError from '../errors/UnauthorizedError';

const requiredAuthentication = async (ctx, next) => {
  const { isSignedIn } = ctx.state;

  if (isSignedIn()) {
    await next();
  } else {
    throw new UnauthorizedError();
  }
};

export default requiredAuthentication;
