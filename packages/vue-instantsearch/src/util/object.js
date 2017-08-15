export const getPropertyByPath = function(object, path) {
  const parts = path.split('.');

  return parts.reduce((current, key) => current && current[key], object);
};
