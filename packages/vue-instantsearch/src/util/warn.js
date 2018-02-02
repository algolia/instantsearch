const cache = new Set();

export function warn(message) {
  if (cache.has(message)) return;
  cache.add(message);
  // eslint-disable-next-line no-console
  console.warn(message);
}
