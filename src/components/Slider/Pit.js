import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import includes from 'lodash/includes';

const Pit = ({ style, children, precision = 2 }) => {
  // first, end & middle
  const positionValue = Math.round(parseFloat(style.left));
  const shouldDisplayValue = includes([0, 50, 100], positionValue);
  const decimal = Math.pow(10, precision);
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
      {shouldDisplayValue
        ? <div className="ais-range-slider--value">{ Math.round(children * decimal) / decimal }</div>
        : null }
    </div>
  );
};

Pit.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
  ]),
  style: PropTypes.shape({
    position: PropTypes.string.isRequired,
    left: PropTypes.string.isRequired,
  }),
  precision: PropTypes.number,
};

export default Pit;
