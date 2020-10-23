import i18next from 'i18next';

export const t = (key) => i18next.t(key);

export const formatDate = (dateObj, options, locale = 'ru-RU') => {
  const opts = options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  return dateObj.toLocaleString(locale, opts);
};

export const getAlertClass = (type) => {
  switch (type) {
    case 'error':
      return 'danger';
    case 'info':
      return 'info';
    default:
      throw new Error(`Unknown type: '${type}'`);
  }
};

export const getTagObjectsFromStr = async (str) => {
  if (str.length === 0) {
    return [];
  }

  const tagObjects = str.split(',')
    .map((tagName) => {
      const name = tagName.trim();
      return name.length >= 2 ? { name } : null;
    })
    .filter((item) => item);

  return tagObjects;
};
