function uniq<TItem>(array: TItem[]): TItem[] {
  return array.filter((value, index, self) => self.indexOf(value) === index);
}

export default uniq;
