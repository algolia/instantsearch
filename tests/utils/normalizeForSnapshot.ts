export function normalizeForSnapshot(
  received: Element | null,
  normalizeFn: (html: string) => string
) {
  if (received === null) {
    throw new TypeError('Expected an Element to normalize for snapshot.');
  }

  const normalizedElement = document.createElement('div');
  normalizedElement.innerHTML = normalizeFn(received.outerHTML);

  return normalizedElement.firstChild;
}
