import crypto from 'crypto';

const secret = 'unreal secret string';

const encrypt = (value) => crypto
  .createHmac('sha256', secret)
  .update(value)
  .digest('hex');

export default encrypt;
