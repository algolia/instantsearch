import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import defaultsDeep from 'lodash/defaultsDeep';
import { isSpecialClick } from '../../lib/utils.js';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';

import PaginationLink from './PaginationLink.js';

import cx from 'classnames';

export class RawPagination extends Component {
  constructor(props) {
    super(defaultsDeep(props, RawPagination.defaultProps));
    this.handleClick = this.handleClick.bind(this);
  }

  pageLink({
    label,
    ariaLabel,
    pageNumber,
    additionalClassName = null,
    isDisabled = false,
    isActive = false,
    createURL,
  }) {
    const cssClasses = {
      item: cx(this.props.cssClasses.item, additionalClassName),
      link: cx(this.props.cssClasses.link),
    };
    if (isDisabled) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.disabled);
    } else if (isActive) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.active);
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
      additionalClassName: this.props.cssClasses.previous,
      isDisabled: this.props.nbHits === 0 || isFirstPage,
      label: this.props.labels.previous,
      pageNumber: currentPage - 1,
      createURL,
    });
  }

  nextPageLink({ isLastPage, currentPage, createURL }) {
    return this.pageLink({
      ariaLabel: 'Next',
      additionalClassName: this.props.cssClasses.next,
      isDisabled: this.props.nbHits === 0 || isLastPage,
      label: this.props.labels.next,
      pageNumber: currentPage + 1,
      createURL,
    });
  }

  firstPageLink({ isFirstPage, createURL }) {
    return this.pageLink({
      ariaLabel: 'First',
      additionalClassName: this.props.cssClasses.first,
      isDisabled: this.props.nbHits === 0 || isFirstPage,
      label: this.props.labels.first,
      pageNumber: 0,
      createURL,
    });
  }

  lastPageLink({ isLastPage, nbPages, createURL }) {
    return this.pageLink({
      ariaLabel: 'Last',
      additionalClassName: this.props.cssClasses.last,
      isDisabled: this.props.nbHits === 0 || isLastPage,
      label: this.props.labels.last,
      pageNumber: nbPages - 1,
      createURL,
    });
  }

  pages({ currentPage, pages, createURL }) {
    return pages.map(pageNumber => ({
      ariaLabel: pageNumber + 1,
      additionalClassName: this.props.cssClasses.page,
      isActive: pageNumber === currentPage,
      label: pageNumber + 1,
      pageNumber,
      createURL,
    }));
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
      <ul className={this.props.cssClasses.root}>
        {this.props.showFirstLast && this.firstPageLink(this.props)}
        {this.previousPageLink(this.props)}
        {this.pages(this.props)}
        {this.nextPageLink(this.props)}
        {this.props.showFirstLast && this.lastPageLink(this.props)}
      </ul>
    );
  }
}

RawPagination.propTypes = {
  createURL: PropTypes.func,
  cssClasses: PropTypes.shape({
    root: PropTypes.string,
    item: PropTypes.string,
    link: PropTypes.string,
    page: PropTypes.string,
    previous: PropTypes.string,
    next: PropTypes.string,
    first: PropTypes.string,
    last: PropTypes.string,
    active: PropTypes.string,
    disabled: PropTypes.string,
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
  showFirstLast: PropTypes.bool,
};

RawPagination.defaultProps = {
  nbHits: 0,
  currentPage: 0,
  nbPages: 0,
};

export default autoHideContainerHOC(RawPagination);
