function uniq(array: any[]): any[] {
  return array.filter((value, index, self) => self.indexOf(value) === index);
}

export default uniq;
