import React, {PropTypes, Component} from 'react';
import range from 'lodash/utility/range';
import themeable from 'react-themeable';

import createPagination from '../createPagination';

import {isSpecialClick} from './utils';
import PaginationLink from './PaginationLink';

function getPagesDisplayedCount(padding, total) {
  return Math.min(2 * padding + 1, total);
}

function calculatePaddingLeft(current, padding, total, totalDisplayedPages) {
  if (current <= padding) {
    return current;
  }

  if (current >= total - padding) {
    return totalDisplayedPages - (total - current);
  }

  return padding;
}

function getPages(page, total, padding) {
  const totalDisplayedPages = getPagesDisplayedCount(padding, total);
  if (totalDisplayedPages === total) return range(0, total);

  const paddingLeft = calculatePaddingLeft(
    page,
    padding,
    total,
    totalDisplayedPages
  );
  const paddingRight = totalDisplayedPages - paddingLeft;

  const first = page - paddingLeft;
  const last = page + paddingRight;

  return range(first, last);
}

class Pagination extends Component {
  static propTypes = {
    // Provided by `createPagination`
    nbPages: PropTypes.number,
    page: PropTypes.number,
    refine: PropTypes.func.isRequired,

    labels: PropTypes.object,
    ariaLabels: PropTypes.object,
    theme: PropTypes.object,
    createURL: PropTypes.func,
    showFirst: PropTypes.bool,
    showLast: PropTypes.bool,
    scrollTo: PropTypes.oneOf(PropTypes.string, PropTypes.instanceOf(Node)),
    padding: PropTypes.number,
  };

  static defaultProps = {
    theme: {
      root: 'Pagination',
      first: 'Pagination__first',
      last: 'Pagination__last',
      previous: 'Pagination__previous',
      next: 'Pagination__next',
      page: 'Pagination__page',
      item: 'Pagination__item',
      itemActive: 'Pagination__item--active',
      itemDisabled: 'Pagination__item--disabled',
      link: 'Pagination__link',
    },
    labels: {
      previous: () => '‹',
      next: () => '›',
      first: () => '«',
      last: () => '»',
      page: page => (page + 1).toString(),
    },
    ariaLabels: {
      previous: () => 'Previous page',
      next: () => 'Next page',
      first: () => 'First page',
      last: () => 'Last page',
      page: page => `Page ${(page + 1).toString()}`,
    },
    showFirst: true,
    showLast: false,
    padding: 3,
  };

  renderPageLink({
    type,
    pageNumber,
    isActive = false,
  }) {
    const {createURL, theme, nbPages, page, labels, ariaLabels} = this.props;
    const isDisabled =
      !isActive && page === pageNumber ||
      pageNumber < 0 ||
      pageNumber >= nbPages;
    // @TODO: Default createURL that works with URL sync
    const url = createURL && !isDisabled ? createURL(pageNumber) : '#';
    const key = type + pageNumber;

    return (
      <PaginationLink
        key={key}
        ariaLabel={ariaLabels[type](pageNumber)}
        label={labels[type](pageNumber)}
        onClick={this.onClick}
        isDisabled={isDisabled}
        isActive={isActive}
        pageNumber={pageNumber}
        url={url}
        theme={{
          item: theme.item,
          itemActive: theme.itemActive,
          itemDisabled: theme.itemDisabled,
          link: theme.link,
        }}
      />
    );
  }

  renderPreviousPageLink() {
    return this.renderPageLink({
      type: 'previous',
      pageNumber: this.props.page - 1,
    });
  }

  renderNextPageLink() {
    return this.renderPageLink({
      type: 'next',
      pageNumber: this.props.page + 1,
    });
  }

  renderFirstPageLink() {
    return this.renderPageLink({
      type: 'first',
      pageNumber: 0,
    });
  }

  renderLastPageLink() {
    return this.renderPageLink({
      type: 'last',
      pageNumber: this.props.nbPages - 1,
    });
  }

  renderPageLinks() {
    const {page, nbPages, padding} = this.props;
    return getPages(page, nbPages, padding).map(pageNumber =>
      this.renderPageLink({
        type: 'page',
        isActive: pageNumber === this.props.page,
        pageNumber,
      })
    );
  }

  onClick = (pageNumber, event) => {
    if (isSpecialClick(event)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    event.preventDefault();
    this.props.refine(pageNumber);
  }

  render() {
    const {
      nbPages,
      showFirst,
      showLast,
      theme,
    } = this.props;
    const th = themeable(theme);

    if (!nbPages) {
      return null;
    }

    return (
      <ul {...th('root', 'root')}>
        {showFirst && this.renderFirstPageLink()}
        {this.renderPreviousPageLink()}
        {this.renderPageLinks()}
        {this.renderNextPageLink()}
        {showLast && this.renderLastPageLink()}
      </ul>
    );
  }
}

export default createPagination(Pagination);
