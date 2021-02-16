function getPropertyByPath(
  // eslint-disable-next-line @typescript-eslint/ban-types
  object: object | undefined,
  path: string | string[]
): any {
  const parts = Array.isArray(path) ? path : path.split('.');

  return parts.reduce((current, key) => current && current[key], object);
}

export default getPropertyByPath;
