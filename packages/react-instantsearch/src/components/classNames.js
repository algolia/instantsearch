import cx from 'classnames';
const prefix = 'ais';

export default function classNames(block) {
  return (...elements) => ({
    className: cx(
      elements
        .filter(element => element !== undefined && element !== false)
        .map(element => `${prefix}-${block}__${element}`)
      ),
  });
}
