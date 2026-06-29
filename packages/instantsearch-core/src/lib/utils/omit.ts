/**
 * Creates a new object with the same keys as the original object, but without the excluded keys.
 * @param source original object
 * @param excluded keys to remove from the original object
 * @returns the new object
 */
export function omit<
  TSource extends Record<string, unknown>,
  TExcluded extends keyof TSource
>(source: TSource, excluded: TExcluded[]): Omit<TSource, TExcluded> {
  if (source === null || source === undefined) {
    return source;
  }

  type Output = Omit<TSource, TExcluded>;
  return Object.keys(source).reduce((target, key) => {
    if ((excluded as Array<keyof TSource>).indexOf(key) >= 0) {
      return target;
    }

    const validKey = key as keyof Output;
    target[validKey] = source[validKey];

    return target;
  }, {} as unknown as Output);
}
