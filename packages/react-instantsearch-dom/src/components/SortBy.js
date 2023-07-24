import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { createClassNames } from '../core/utils';

import Select from './Select';

const cx = createClassNames('SortBy');

class SortBy extends Component {
  static propTypes = {
    id: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    currentRefinement: PropTypes.string.isRequired,
    refine: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  render() {
    const { id, items, currentRefinement, refine, className } = this.props;

    return (
      <div className={classNames(cx(''), className)}>
        <Select
          id={id}
          cx={cx}
          items={items}
          selectedItem={currentRefinement}
          onSelect={refine}
        />
      </div>
    );
  }
}

export default SortBy;
