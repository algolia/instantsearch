export const applyDefaultProps = (props, defaultProps) => {
  // This is the React default props behavior.
  const defaultedProps = {...props};
  for (const propName in defaultProps) {
    if (props[propName] === undefined) {
      defaultedProps[propName] = defaultProps[propName];
    }
  }
  return defaultedProps;
};

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

export function getTranslation(key, defaults, custom, ...params) {
  const translation =
    {}.hasOwnProperty.call(custom, key) ?
      custom[key] :
      defaults[key];
  if (typeof translation === 'function') {
    return translation(...params);
  }
  return translation;
}

export function capitalize(key) {
  return key.length === 0 ? '' : `${key[0].toUpperCase()}${key.slice(1)}`;
}
