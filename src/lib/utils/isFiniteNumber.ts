function isFiniteNumber(value: any): value is number {
  return isFinite(value) && !isNaN(parseFloat(value));
}

export default isFiniteNumber;
