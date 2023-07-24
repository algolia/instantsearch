import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

import List from './List';

const cx = createClassNames('NumericMenu');

class NumericMenu extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.node.isRequired,
        value: PropTypes.string.isRequired,
        isRefined: PropTypes.bool.isRequired,
        noRefinement: PropTypes.bool.isRequired,
      })
    ).isRequired,
    canRefine: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  renderItem = (item) => {
    const { refine, translate } = this.props;

    return (
      <label className={cx('label')}>
        <input
          className={cx('radio')}
          type="radio"
          checked={item.isRefined}
          disabled={item.noRefinement}
          onChange={() => refine(item.value)}
        />
        <span className={cx('labelText')}>
          {item.value === '' ? translate('all') : item.label}
        </span>
      </label>
    );
  };

  render() {
    const { items, canRefine, className } = this.props;

    return (
      <List
        renderItem={this.renderItem}
        showMore={false}
        canRefine={canRefine}
        cx={cx}
        items={items.map((item) => ({ ...item, key: item.value }))}
        className={className}
      />
    );
  }
}

export default translatable({
  all: 'All',
})(NumericMenu);
