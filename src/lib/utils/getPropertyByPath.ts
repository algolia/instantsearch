function getPropertyByPath(object: object, path: string) {
  const parts = path.split('.');

  return parts.reduce((current, key) => current && current[key], object);
}

export default getPropertyByPath;
