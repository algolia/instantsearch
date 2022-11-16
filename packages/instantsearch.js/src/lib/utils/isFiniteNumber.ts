// This is the `Number.isFinite()` polyfill recommended by MDN.
// We do not provide any tests for this function.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite#Polyfill
// @MAJOR Replace with the native `Number.isFinite` method
export function isFiniteNumber(value: any): value is number {
  return typeof value === 'number' && isFinite(value);
}
