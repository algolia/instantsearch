import React from 'react';
import forEach from 'lodash/collection/forEach';
import defaultsDeep from 'lodash/object/defaultsDeep';
import {isSpecialClick} from '../../lib/utils.js';

import Paginator from './Paginator.js';
import PaginationLink from './PaginationLink.js';

import cx from 'classnames';

class Pagination extends React.Component {
  constructor(props) {
    super(defaultsDeep(props, Pagination.defaultProps));
    this.handleClick = this.handleClick.bind(this);
  }

  pageLink({label, ariaLabel, pageNumber, additionalClassName = null, isDisabled = false, isActive = false, createURL}) {
    let cssClasses = {
      item: cx(this.props.cssClasses.item, additionalClassName),
      link: cx(this.props.cssClasses.link)
    };
    if (isDisabled) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.disabled);
    } else if (isActive) {
      cssClasses.item = cx(cssClasses.item, this.props.cssClasses.active);
    }

    let url = createURL && !isDisabled ? createURL(pageNumber) : '#';

    return (
      <PaginationLink
        ariaLabel={ariaLabel}
        cssClasses={cssClasses}
        handleClick={this.handleClick}
        isDisabled={isDisabled}
        key={label + pageNumber}
        label={label}
        pageNumber={pageNumber}
        url={url}
      />
    );
  }

  previousPageLink(pager, createURL) {
    return this.pageLink({
      ariaLabel: 'Previous',
      additionalClassName: this.props.cssClasses.previous,
      isDisabled: pager.isFirstPage(),
      label: this.props.labels.previous,
      pageNumber: pager.currentPage - 1,
      createURL
    });
  }

  nextPageLink(pager, createURL) {
    return this.pageLink({
      ariaLabel: 'Next',
      additionalClassName: this.props.cssClasses.next,
      isDisabled: pager.isLastPage(),
      label: this.props.labels.next,
      pageNumber: pager.currentPage + 1,
      createURL
    });
  }

  firstPageLink(pager, createURL) {
    return this.pageLink({
      ariaLabel: 'First',
      additionalClassName: this.props.cssClasses.first,
      isDisabled: pager.isFirstPage(),
      label: this.props.labels.first,
      pageNumber: 0,
      createURL
    });
  }

  lastPageLink(pager, createURL) {
    return this.pageLink({
      ariaLabel: 'Last',
      additionalClassName: this.props.cssClasses.last,
      isDisabled: pager.isLastPage(),
      label: this.props.labels.last,
      pageNumber: pager.total - 1,
      createURL
    });
  }

  pages(pager, createURL) {
    let pages = [];

    forEach(pager.pages(), (pageNumber) => {
      let isActive = (pageNumber === pager.currentPage);

      pages.push(this.pageLink({
        ariaLabel: pageNumber + 1,
        additionalClassName: this.props.cssClasses.page,
        isActive: isActive,
        label: pageNumber + 1,
        pageNumber: pageNumber,
        createURL
      }));
    });

    return pages;
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
    let pager = new Paginator({
      currentPage: this.props.currentPage,
      total: this.props.nbPages,
      padding: this.props.padding
    });

    let createURL = this.props.createURL;

    return (
      <ul className={this.props.cssClasses.root}>
        {this.props.showFirstLast ? this.firstPageLink(pager, createURL) : null}
        {this.previousPageLink(pager, createURL)}
        {this.pages(pager, createURL)}
        {this.nextPageLink(pager, createURL)}
        {this.props.showFirstLast ? this.lastPageLink(pager, createURL) : null}
      </ul>
    );
  }
}

Pagination.propTypes = {
  createURL: React.PropTypes.func,
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    item: React.PropTypes.string,
    link: React.PropTypes.string,
    page: React.PropTypes.string,
    previous: React.PropTypes.string,
    next: React.PropTypes.string,
    first: React.PropTypes.string,
    last: React.PropTypes.string,
    active: React.PropTypes.string,
    disabled: React.PropTypes.string
  }),
  currentPage: React.PropTypes.number,
  labels: React.PropTypes.shape({
    first: React.PropTypes.string,
    last: React.PropTypes.string,
    next: React.PropTypes.string,
    previous: React.PropTypes.string
  }),
  nbHits: React.PropTypes.number,
  nbPages: React.PropTypes.number,
  padding: React.PropTypes.number,
  setCurrentPage: React.PropTypes.func.isRequired,
  showFirstLast: React.PropTypes.bool
};

Pagination.defaultProps = {
  nbHits: 0,
  currentPage: 0,
  nbPages: 0
};

export default Pagination;
