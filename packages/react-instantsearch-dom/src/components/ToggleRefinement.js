import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { createClassNames } from '../core/utils';

const cx = createClassNames('ToggleRefinement');

const ToggleRefinement = ({
  currentRefinement,
  label,
  canRefine,
  refine,
  className,
}) => (
  <div className={classNames(cx('', !canRefine && '-noRefinement'), className)}>
    <label className={cx('label')}>
      <input
        className={cx('checkbox')}
        type="checkbox"
        checked={currentRefinement}
        onChange={(event) => refine(event.target.checked)}
      />
      <span className={cx('labelText')}>{label}</span>
    </label>
  </div>
);

ToggleRefinement.propTypes = {
  currentRefinement: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  canRefine: PropTypes.bool.isRequired,
  refine: PropTypes.func.isRequired,
  className: PropTypes.string,
};

ToggleRefinement.defaultProps = {
  className: '',
};

export default ToggleRefinement;
