export function toArray<T>(value: T): Extract<T, unknown[]> {
  return (Array.isArray(value) ? value : [value]) as Extract<T, unknown[]>;
}
