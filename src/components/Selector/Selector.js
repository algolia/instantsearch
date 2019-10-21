/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';

function Selector({ currentValue, options, cssClasses, setValue }) {
  return (
    <select
      className={cx(cssClasses.select)}
      onChange={event => setValue(event.target.value)}
      value={`${currentValue}`}
    >
      {options.map(option => (
        <option
          className={cx(cssClasses.option)}
          key={option.label + option.value}
          value={`${option.value}`}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

Selector.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    select: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    option: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
  currentValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  setValue: PropTypes.func.isRequired,
};

export default Selector;
