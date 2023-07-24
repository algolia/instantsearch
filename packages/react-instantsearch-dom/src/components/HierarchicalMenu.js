import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

import Link from './Link';
import List from './List';

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

  renderItem = (item) => {
    const { createURL, refine } = this.props;

    return (
      <Link
        className={cx('link', item.isRefined && 'link--selected')}
        onClick={() => refine(item.value)}
        href={createURL(item.value)}
      >
        <span className={cx('label')}>{item.label}</span>{' '}
        <span className={cx('count')}>{item.count}</span>
      </Link>
    );
  };

  render() {
    const {
      translate,
      items,
      showMore,
      limit,
      showMoreLimit,
      canRefine,
      className,
    } = this.props;
    return (
      <List
        renderItem={this.renderItem}
        cx={cx}
        translate={translate}
        items={items}
        showMore={showMore}
        limit={limit}
        showMoreLimit={showMoreLimit}
        canRefine={canRefine}
        className={className}
      />
    );
  }
}

export default translatable({
  showMore: (extended) => (extended ? 'Show less' : 'Show more'),
})(HierarchicalMenu);
