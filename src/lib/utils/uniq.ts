function uniq<TItem = unknown>(array: TItem[]): TItem[] {
  return array.filter((value, index, self) => self.indexOf(value) === index);
}

export default uniq;
