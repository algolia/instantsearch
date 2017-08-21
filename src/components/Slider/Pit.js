import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import includes from 'lodash/includes';

const Pit = ({ style, children }) => {
  // first, end & middle
  const positionValue = Math.round(parseFloat(style.left));
  const shouldDisplayValue = includes([0, 50, 100], positionValue);

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
        ? <div className="ais-range-slider--value">
            {Math.round(children * 100) / 100}
          </div>
        : null}
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
};

export default Pit;
