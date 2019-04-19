function isFiniteNumber(value: any): boolean {
  return isFinite(value) && !isNaN(parseFloat(value));
}

export default isFiniteNumber;
