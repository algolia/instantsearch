import cx from 'classnames';

export const createClassNames = (block, prefix = 'ais') => (...elements) => {
  const suitElements = elements
    .filter(element => element || element === '')
    .map(element => {
      const baseClassName = `${prefix}-${block}`;

      return element ? `${baseClassName}-${element}` : baseClassName;
    });

  return cx(suitElements);
};

export const isSpecialClick = event => {
  const isMiddleClick = event.button === 1;
  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
};

export const capitalize = key =>
  key.length === 0 ? '' : `${key[0].toUpperCase()}${key.slice(1)}`;
