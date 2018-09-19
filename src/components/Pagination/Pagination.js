import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import defaultsDeep from 'lodash/defaultsDeep';
import cx from 'classnames';

import PaginationLink from './PaginationLink.js';
import { isSpecialClick } from '../../lib/utils.js';

class Pagination extends Component {
  constructor(props) {
    super(defaultsDeep(props, Pagination.defaultProps));
    this.handleClick = this.handleClick.bind(this);
  }

  pageLink({
    label,
    ariaLabel,
    pageNumber,
    additionalClassName = null,
    isDisabled = false,
    isSelected = false,
    createURL,
  }) {
    const cssClasses = {
      item: cx(this.props.cssClasses.item, additionalClassName),
      link: cx(this.props.cssClasses.link),
    };

    if (isDisabled) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.disabledItem);
    } else if (isSelected) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.selectedItem);
    }

    const url = createURL && !isDisabled ? createURL(pageNumber) : '#';

    return (
      <PaginationLink
        ariaLabel={ariaLabel}
        cssClasses={cssClasses}
        handleClick={this.handleClick}
        isDisabled={isDisabled}
        key={label + pageNumber + ariaLabel}
        label={label}
        pageNumber={pageNumber}
        url={url}
      />
    );
  }

  previousPageLink({ isFirstPage, currentPage, createURL }) {
    return this.pageLink({
      ariaLabel: 'Previous',
      additionalClassName: this.props.cssClasses.previousPageItem,
      isDisabled: this.props.nbHits === 0 || isFirstPage,
      label: this.props.labels.previous,
      pageNumber: currentPage - 1,
      createURL,
    });
  }

  nextPageLink({ isLastPage, currentPage, createURL }) {
    return this.pageLink({
      ariaLabel: 'Next',
      additionalClassName: this.props.cssClasses.nextPageItem,
      isDisabled: this.props.nbHits === 0 || isLastPage,
      label: this.props.labels.next,
      pageNumber: currentPage + 1,
      createURL,
    });
  }

  firstPageLink({ isFirstPage, createURL }) {
    return this.pageLink({
      ariaLabel: 'First',
      additionalClassName: this.props.cssClasses.firstPageItem,
      isDisabled: this.props.nbHits === 0 || isFirstPage,
      label: this.props.labels.first,
      pageNumber: 0,
      createURL,
    });
  }

  lastPageLink({ isLastPage, nbPages, createURL }) {
    return this.pageLink({
      ariaLabel: 'Last',
      additionalClassName: this.props.cssClasses.lastPageItem,
      isDisabled: this.props.nbHits === 0 || isLastPage,
      label: this.props.labels.last,
      pageNumber: nbPages - 1,
      createURL,
    });
  }

  pages({ currentPage, pages, createURL }) {
    return pages.map(pageNumber =>
      this.pageLink({
        ariaLabel: pageNumber + 1,
        additionalClassName: this.props.cssClasses.pageItem,
        isSelected: pageNumber === currentPage,
        label: pageNumber + 1,
        pageNumber,
        createURL,
      })
    );
  }

  handleClick(pageNumber, event) {
    if (isSpecialClick(event)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    event.preventDefault();
    this.props.setCurrentPage(pageNumber);
  }

  render() {
    return (
      <div
        className={cx(this.props.cssClasses.root, {
          [this.props.cssClasses.noRefinementRoot]: this.props.isFirstPage,
        })}
      >
        <ul className={cx(this.props.cssClasses.list)}>
          {this.props.showFirst && this.firstPageLink(this.props)}
          {this.props.showPrevious && this.previousPageLink(this.props)}
          {this.pages(this.props)}
          {this.props.showNext && this.nextPageLink(this.props)}
          {this.props.showLast && this.lastPageLink(this.props)}
        </ul>
      </div>
    );
  }
}

Pagination.propTypes = {
  createURL: PropTypes.func,
  cssClasses: PropTypes.shape({
    root: PropTypes.string,
    noRefinementRoot: PropTypes.string,
    list: PropTypes.string,
    item: PropTypes.string,
    firstPageItem: PropTypes.string,
    lastPageItem: PropTypes.string,
    previousPageItem: PropTypes.string,
    nextPageItem: PropTypes.string,
    pageItem: PropTypes.string,
    selectedItem: PropTypes.string,
    disabledItem: PropTypes.string,
    link: PropTypes.string,
  }),
  currentPage: PropTypes.number,
  labels: PropTypes.shape({
    first: PropTypes.string,
    last: PropTypes.string,
    next: PropTypes.string,
    previous: PropTypes.string,
  }),
  nbHits: PropTypes.number,
  nbPages: PropTypes.number,
  pages: PropTypes.arrayOf(PropTypes.number),
  isFirstPage: PropTypes.bool.isRequired,
  isLastPage: PropTypes.bool.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  showFirst: PropTypes.bool,
  showLast: PropTypes.bool,
  showPrevious: PropTypes.bool,
  showNext: PropTypes.bool,
};

Pagination.defaultProps = {
  nbHits: 0,
  currentPage: 0,
  nbPages: 0,
};

export default Pagination;
