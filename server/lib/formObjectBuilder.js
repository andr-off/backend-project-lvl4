import _ from 'lodash';

export default (object, error = { errors: [] }, name = 'form') => ({
  name,
  object,
  errors: _.groupBy(error.errors, 'path'),
});
