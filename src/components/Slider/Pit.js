/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Pit = ({ style, children }) => {
  // first, end & middle
  const positionValue = Math.round(parseFloat(style.left));
  const shouldDisplayValue = [0, 50, 100].includes(positionValue);

  // Children could be an array, unwrap the value if it's the case
  // see: https://github.com/developit/preact-compat/issues/436
  const value = Array.isArray(children) ? children[0] : children;
  const pitValue = Math.round(parseInt(value, 10) * 100) / 100;

  return (
    <div
      style={{ ...style, marginLeft: positionValue === 100 ? '-2px' : 0 }}
      className={cx('rheostat-marker', 'rheostat-marker-horizontal', {
        'rheostat-marker-large': shouldDisplayValue,
      })}
    >
      {shouldDisplayValue && <div className={'rheostat-value'}>{pitValue}</div>}
    </div>
  );
};

Pit.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.number,
    // Hack for preact-compat
    // see: https://github.com/developit/preact-compat/issues/436
    PropTypes.arrayOf(PropTypes.number),
  ]),
  style: PropTypes.shape({
    position: PropTypes.string.isRequired,
    left: PropTypes.string.isRequired,
  }),
};

export default Pit;
