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

export function getLabel(label, ...params) {
  if (typeof label === 'function') {
    return label(...params);
  }
  return label;
}
