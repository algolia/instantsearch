function getPropertyByPath(
  object: object | undefined,
  path: string | string[]
): any {
  const parts = Array.isArray(path) ? path : path.split('.');

  return parts.reduce((current, key) => current && current[key], object);
}

export default getPropertyByPath;
