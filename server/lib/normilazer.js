import _ from 'lodash';

export const normalizeEmail = (email) => (
  email.toLowerCase().trim()
);

export const normalizeName = (name) => (
  _.capitalize(name.trim().toLowerCase())
);
