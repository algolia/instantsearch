export function getObjectType(object: unknown): string {
  return Object.prototype.toString.call(object).slice(8, -1);
}
