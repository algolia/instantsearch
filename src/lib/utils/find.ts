// We aren't using the native `Array.prototype.find` because the refactor away from Lodash is not
// published as a major version.
// Relying on the `find` polyfill on user-land, which before was only required for niche use-cases,
// was decided as too risky.
// @MAJOR Replace with the native `Array.prototype.find` method
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
export function find<TItem>(
  items: TItem[],
  predicate: (value: TItem, index: number, obj: TItem[]) => boolean
): TItem | undefined {
  let value: TItem;
  for (let i = 0; i < items.length; i++) {
    value = items[i];
    // inlined for performance: if (Call(predicate, thisArg, [value, i, list])) {
    if (predicate(value, i, items)) {
      return value;
    }
  }

  return undefined;
}
