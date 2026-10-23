export function flat<T>(arr: T[][]): T[] {
  return arr.reduce((acc, array) => acc.concat(array), []);
}
