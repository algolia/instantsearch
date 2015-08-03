'use strict';

var React = require('react');
var forEach = require('lodash/collection/forEach');
var defaultsDeep = require('lodash/object/defaultsDeep');

var Paginator = require('./Paginator');
var PaginationLink = require('./PaginationLink');

var bem = require('../BemHelper')('as-pagination');
var cx = require('classnames');

class Pagination extends React.Component {
  constructor(props) {
    super(defaultsDeep(props, Pagination.defaultProps));
  }

  render() {
    if (this.props.nbHits === 0) {
      return null;
    }

    var pager = new Paginator({
      currentPage: this.props.currentPage,
      total: this.props.nbPages,
      padding: this.props.padding
    });

    var classNames = cx(bem('ul'), this.props.cssClass);

    return (
      <ul className={classNames}>
        {this.props.showFirstLast ? this.firstPageLink(pager) : null}
        {this.previousPageLink(pager)}
        {this.pages(pager)}
        {this.nextPageLink(pager)}
        {this.props.showFirstLast ? this.lastPageLink(pager) : null}
      </ul>
    );
  }

  previousPageLink(pager) {
    if (pager.isFirstPage()) return null;

    return (
      <PaginationLink
        href="#"
        label={this.props.labels.prev} ariaLabel="Previous"
        setCurrentPage={this.props.setCurrentPage}
        page={pager.currentPage - 1} />
    );
  }

  nextPageLink(pager) {
    if (pager.isLastPage()) return null;

    return (
      <PaginationLink
        href="#"
        label={this.props.labels.next} ariaLabel="Next"
        setCurrentPage={this.props.setCurrentPage}
        page={pager.currentPage + 1} />
    );
  }

  firstPageLink(pager) {
    if (pager.isFirstPage()) return null;

    return (
      <PaginationLink
        href="#"
        label={this.props.labels.first}
        ariaLabel="First"
        setCurrentPage={this.props.setCurrentPage}
        page={0} />
    );
  }

  lastPageLink(pager) {
    if (pager.isLastPage()) return null;

    return (
      <PaginationLink
        href="#"
        label={this.props.labels.last}
        ariaLabel="Last"
        setCurrentPage={this.props.setCurrentPage}
        page={pager.total - 1} />
    );
  }

  pages(pager) {
    var elements = [];

    forEach(pager.pages(), function(pageNumber) {
      var className = pageNumber === pager.currentPage ? 'active' : '';

      elements.push(
        <PaginationLink
          href="#"
          label={pageNumber + 1}
          ariaLabel={pageNumber + 1}
          setCurrentPage={this.props.setCurrentPage}
          page={pageNumber}
          key={pageNumber}
          className={className} />
      );
    }, this);

    return elements;
  }
}

Pagination.propTypes = {
  nbHits: React.PropTypes.number,
  currentPage: React.PropTypes.number,
  nbPages: React.PropTypes.number,
  labels: React.PropTypes.shape({
    prev: React.PropTypes.string,
    next: React.PropTypes.string,
    first: React.PropTypes.string,
    last: React.PropTypes.string
  }),
  showFirstLast: React.PropTypes.bool,
  padding: React.PropTypes.number,
  setCurrentPage: React.PropTypes.func.isRequired,
  cssClass: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array
  ])
};

Pagination.defaultProps = {
  nbHits: 0,
  currentPage: 0,
  nbPages: 0,
  labels: {
    prev: '‹', // &lsaquo;
    next: '›', // &rsaquo;
    first: '«', // &laquo;
    last: '»' // &raquo;
  },
  showFirstLast: true,
  padding: 3
};

module.exports = Pagination;
