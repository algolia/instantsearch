import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

const cx = createClassNames('ClearRefinements');

class ClearRefinements extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    canRefine: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  render() {
    const { items, canRefine, refine, translate, className } = this.props;

    return (
      <div className={classNames(cx(''), className)}>
        <button
          className={cx('button', !canRefine && 'button--disabled')}
          onClick={() => refine(items)}
          disabled={!canRefine}
        >
          {translate('reset')}
        </button>
      </div>
    );
  }
}

export default translatable({
  reset: 'Clear all filters',
})(ClearRefinements);
