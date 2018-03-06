import cx from 'classnames';

const createClassNames = (block, prefix = 'ais') => (...elements) => {
  const suitElements = elements
    .filter(element => element || element === '')
    .map(element => {
      const baseClassName = `${prefix}-${block}`;

      return element ? `${baseClassName}-${element}` : baseClassName;
    });

  return cx(suitElements);
};

export default createClassNames;
