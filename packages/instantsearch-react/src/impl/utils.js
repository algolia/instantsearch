export function isSpecialClick(event) {
  const isMiddleClick = event.button === 1;
  return (
    isMiddleClick ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}

export function getTranslation(translation, ...params) {
  if (typeof translation === 'function') {
    return translation(...params);
  }
  return translation;
}
