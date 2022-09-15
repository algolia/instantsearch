type ToArray<T> = T extends unknown[] ? T : T[];

export function toArray<T>(value: T): ToArray<T> {
  return (Array.isArray(value) ? value : [value]) as ToArray<T>;
}
