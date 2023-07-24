import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames, capitalize, range } from '../core/utils';

import LinkList from './LinkList';

const cx = createClassNames('Pagination');

// Determines the size of the widget (the number of pages displayed - that the user can directly click on)
function calculateSize(padding, maxPages) {
  return Math.min(2 * padding + 1, maxPages);
}

function calculatePaddingLeft(currentPage, padding, maxPages, size) {
  if (currentPage <= padding) {
    return currentPage;
  }

  if (currentPage >= maxPages - padding) {
    return size - (maxPages - currentPage);
  }

  return padding + 1;
}

// Retrieve the correct page range to populate the widget
function getPages(currentPage, maxPages, padding) {
  const size = calculateSize(padding, maxPages);
  // If the widget size is equal to the max number of pages, return the entire page range
  if (size === maxPages) return range({ start: 1, end: maxPages + 1 });

  const paddingLeft = calculatePaddingLeft(
    currentPage,
    padding,
    maxPages,
    size
  );
  const paddingRight = size - paddingLeft;

  const first = currentPage - paddingLeft;
  const last = currentPage + paddingRight;
  return range({ start: first + 1, end: last + 1 });
}

class Pagination extends Component {
  static propTypes = {
    nbPages: PropTypes.number.isRequired,
    currentRefinement: PropTypes.number.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,

    translate: PropTypes.func.isRequired,
    listComponent: PropTypes.func,

    showFirst: PropTypes.bool,
    showPrevious: PropTypes.bool,
    showNext: PropTypes.bool,
    showLast: PropTypes.bool,
    padding: PropTypes.number,
    totalPages: PropTypes.number,
    className: PropTypes.string,
  };

  static defaultProps = {
    listComponent: LinkList,
    showFirst: true,
    showPrevious: true,
    showNext: true,
    showLast: false,
    padding: 3,
    totalPages: Infinity,
    className: '',
  };

  getItem(modifier, translationKey, value) {
    const { nbPages, totalPages, translate } = this.props;
    return {
      key: `${modifier}.${value}`,
      modifier,
      disabled: value < 1 || value >= Math.min(totalPages, nbPages),
      label: translate(translationKey, value),
      value,
      ariaLabel: translate(`aria${capitalize(translationKey)}`, value),
    };
  }

  render() {
    const {
      listComponent: ListComponent,
      nbPages,
      totalPages,
      currentRefinement,
      padding,
      showFirst,
      showPrevious,
      showNext,
      showLast,
      refine,
      createURL,
      canRefine,
      translate,
      className,
      ...otherProps
    } = this.props;

    const maxPages = Math.min(nbPages, totalPages);
    const lastPage = maxPages;

    let items = [];
    if (showFirst) {
      items.push({
        key: 'first',
        modifier: 'item--firstPage',
        disabled: currentRefinement === 1,
        label: translate('first'),
        value: 1,
        ariaLabel: translate('ariaFirst'),
      });
    }
    if (showPrevious) {
      items.push({
        key: 'previous',
        modifier: 'item--previousPage',
        disabled: currentRefinement === 1,
        label: translate('previous'),
        value: currentRefinement - 1,
        ariaLabel: translate('ariaPrevious'),
      });
    }

    items = items.concat(
      getPages(currentRefinement, maxPages, padding).map((value) => ({
        key: value,
        modifier: 'item--page',
        label: translate('page', value),
        value,
        selected: value === currentRefinement,
        ariaLabel: translate('ariaPage', value),
      }))
    );
    if (showNext) {
      items.push({
        key: 'next',
        modifier: 'item--nextPage',
        disabled: currentRefinement === lastPage || lastPage <= 1,
        label: translate('next'),
        value: currentRefinement + 1,
        ariaLabel: translate('ariaNext'),
      });
    }
    if (showLast) {
      items.push({
        key: 'last',
        modifier: 'item--lastPage',
        disabled: currentRefinement === lastPage || lastPage <= 1,
        label: translate('last'),
        value: lastPage,
        ariaLabel: translate('ariaLast'),
      });
    }

    return (
      <div
        className={classNames(cx('', !canRefine && '-noRefinement'), className)}
      >
        <ListComponent
          {...otherProps}
          cx={cx}
          items={items}
          onSelect={refine}
          createURL={createURL}
          canRefine={canRefine}
        />
      </div>
    );
  }
}

export default translatable({
  previous: '‹',
  next: '›',
  first: '«',
  last: '»',
  page: (currentRefinement) => currentRefinement.toString(),
  ariaPrevious: 'Previous page',
  ariaNext: 'Next page',
  ariaFirst: 'First page',
  ariaLast: 'Last page',
  ariaPage: (currentRefinement) => `Page ${currentRefinement.toString()}`,
})(Pagination);
