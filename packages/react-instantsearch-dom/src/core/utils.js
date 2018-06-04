export function isSpecialClick(event) {
  const isMiddleClick = event.button === 1;
  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}

export function capitalize(key) {
  return key.length === 0 ? '' : `${key[0].toUpperCase()}${key.slice(1)}`;
}
