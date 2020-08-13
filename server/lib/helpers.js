const formatDate = (dateObj, options) => {
  const opts = options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  return dateObj.toLocaleString('en-US', opts);
};

export default formatDate;
