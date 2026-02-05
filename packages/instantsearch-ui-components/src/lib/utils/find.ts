export function find<T>(
  array: T[],
  predicate: (item: T, i: number, a: T[]) => boolean
): T | undefined {
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    if (predicate(item, index, array)) {
      return item;
    }
  }
  return undefined;
}
