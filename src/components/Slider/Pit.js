import PropTypes from 'prop-types';
import React from 'preact-compat';
import cx from 'classnames';

import includes from 'lodash/includes';

const Pit = ({ key, style, children }) => {
  // first, end & middle
  const positionValue = Math.round(parseFloat(style.left));
  const shouldDisplayValue = includes([0, 50, 100], positionValue);

  const value = children ? children : key.replace('pit-', '');
  const pitValue = Math.round(parseFloat(value, 10) * 100) / 100;

  return (
    <div
      style={{ ...style, marginLeft: positionValue === 100 ? '-2px' : 0 }}
      className={cx(
        'ais-range-slider--marker ais-range-slider--marker-horizontal',
        {
          'ais-range-slider--marker-large': shouldDisplayValue,
        }
      )}
    >
      {shouldDisplayValue ? (
        <div className="ais-range-slider--value">{pitValue}</div>
      ) : null}
    </div>
  );
};

Pit.propTypes = {
  key: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.shape({
    position: PropTypes.string.isRequired,
    left: PropTypes.string.isRequired,
  }),
};

export default Pit;
