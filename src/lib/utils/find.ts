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
