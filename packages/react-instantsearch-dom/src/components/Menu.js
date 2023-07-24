import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';
import Highlight from '../widgets/Highlight';

import Link from './Link';
import List from './List';

const cx = createClassNames('Menu');

class Menu extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    searchForItems: PropTypes.func.isRequired,
    searchable: PropTypes.bool,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
        isRefined: PropTypes.bool.isRequired,
      })
    ),
    isFromSearch: PropTypes.bool.isRequired,
    canRefine: PropTypes.bool.isRequired,
    showMore: PropTypes.bool,
    limit: PropTypes.number,
    showMoreLimit: PropTypes.number,
    transformItems: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  renderItem = (item, resetQuery) => {
    const { createURL } = this.props;
    const label = this.props.isFromSearch ? (
      <Highlight attribute="label" hit={item} />
    ) : (
      item.label
    );
    return (
      <Link
        className={cx('link')}
        onClick={() => this.selectItem(item, resetQuery)}
        href={createURL(item.value)}
      >
        <span className={cx('label')}>{label}</span>{' '}
        <span className={cx('count')}>{item.count}</span>
      </Link>
    );
  };

  selectItem = (item, resetQuery) => {
    resetQuery();
    this.props.refine(item.value);
  };

  render() {
    const {
      translate,
      items,
      showMore,
      limit,
      showMoreLimit,
      isFromSearch,
      searchForItems,
      searchable,
      canRefine,
      className,
    } = this.props;
    return (
      <List
        renderItem={this.renderItem}
        selectItem={this.selectItem}
        cx={cx}
        translate={translate}
        items={items}
        showMore={showMore}
        limit={limit}
        showMoreLimit={showMoreLimit}
        isFromSearch={isFromSearch}
        searchForItems={searchForItems}
        searchable={searchable}
        canRefine={canRefine}
        className={className}
      />
    );
  }
}

export default translatable({
  showMore: (extended) => (extended ? 'Show less' : 'Show more'),
  noResults: 'No results',
  submit: null,
  reset: null,
  resetTitle: 'Clear the search query.',
  submitTitle: 'Submit your search query.',
  placeholder: 'Search here…',
})(Menu);
