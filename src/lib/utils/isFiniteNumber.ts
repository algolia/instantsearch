function isFiniteNumber(value: any): value is number {
  return typeof value === 'number' && isFinite(value);
}

export default isFiniteNumber;
