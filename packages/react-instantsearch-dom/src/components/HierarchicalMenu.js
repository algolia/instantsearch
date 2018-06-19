import { pick } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translatable } from 'react-instantsearch-core';
import { createClassNames } from '../core/utils';
import List from './List';
import Link from './Link';

const cx = createClassNames('HierarchicalMenu');

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    count: PropTypes.number.isRequired,
    items: (...args) => itemsPropType(...args),
  })
);

class HierarchicalMenu extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,
    items: itemsPropType,
    showMore: PropTypes.bool,
    className: PropTypes.string,
    limit: PropTypes.number,
    showMoreLimit: PropTypes.number,
    transformItems: PropTypes.func,
  };

  static defaultProps = {
    className: '',
  };

  renderItem = item => {
    const { createURL, refine } = this.props;

    return (
      <Link
        className={cx('link')}
        onClick={() => refine(item.value)}
        href={createURL(item.value)}
      >
        <span className={cx('label')}>{item.label}</span>{' '}
        <span className={cx('count')}>{item.count}</span>
      </Link>
    );
  };

  render() {
    return (
      <List
        renderItem={this.renderItem}
        cx={cx}
        {...pick(this.props, [
          'translate',
          'items',
          'showMore',
          'limit',
          'showMoreLimit',
          'isEmpty',
          'canRefine',
          'className',
        ])}
      />
    );
  }
}

export default translatable({
  showMore: extended => (extended ? 'Show less' : 'Show more'),
})(HierarchicalMenu);
