// We aren't using the native `Array.prototype.find` because the refactor away from Lodash is not
// published as a major version.
// Relying on the `find` polyfill on user-land, which before was only required for niche use-cases,
// was decided as too risky.
// @MAJOR Replace with the native `Array.prototype.find` method
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
function find<TItem>(
  items: TItem[],
  predicate: (value: TItem, index: number, obj: TItem[]) => boolean,
  thisArg?: any
): TItem | undefined {
  if (!Array.prototype.find) {
    return items.filter(predicate, thisArg)[0];
  }

  return items.find(predicate, thisArg);
}

export default find;
