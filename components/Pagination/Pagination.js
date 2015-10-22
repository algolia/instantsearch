var React = require('react');
var forEach = require('lodash/collection/forEach');
var defaultsDeep = require('lodash/object/defaultsDeep');
var {isSpecialClick} = require('../../lib/utils.js');

var Paginator = require('./Paginator');
var PaginationLink = require('./PaginationLink');

var bem = require('../../lib/utils').bemHelper('ais-pagination');
var cx = require('classnames');

class Pagination extends React.Component {
  constructor(props) {
    super(defaultsDeep(props, Pagination.defaultProps));
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

  pageLink({label, ariaLabel, pageNumber, className = null, isDisabled = false, isActive = false, createURL}) {
    var handleClick = this.handleClick.bind(this, pageNumber);

    className = cx(bem('item'), className);
    if (isDisabled) {
      className = cx(bem('item', 'disabled'), this.props.cssClasses.disabled, className);
    }
    if (isActive) {
      className = cx(bem('item-page', 'active'), this.props.cssClasses.active, className);
    }

    var url = createURL && !isDisabled ? createURL(pageNumber) : '#';

    return (
      <PaginationLink
        ariaLabel={ariaLabel}
        className={className}
        handleClick={handleClick}
        key={label}
        label={label}
        url={url}
      />
    );
  }

  previousPageLink(pager, createURL) {
    var className = cx(bem('item-previous'), this.props.cssClasses.previous);
    return this.pageLink({
      ariaLabel: 'Previous',
      className: className,
      isDisabled: pager.isFirstPage(),
      label: this.props.labels.previous,
      pageNumber: pager.currentPage - 1,
      createURL
    });
  }

  nextPageLink(pager, createURL) {
    var className = cx(bem('item-next'), this.props.cssClasses.next);
    return this.pageLink({
      ariaLabel: 'Next',
      className: className,
      isDisabled: pager.isLastPage(),
      label: this.props.labels.next,
      pageNumber: pager.currentPage + 1,
      createURL
    });
  }

  firstPageLink(pager, createURL) {
    var className = cx(bem('item-first'), this.props.cssClasses.first);
    return this.pageLink({
      ariaLabel: 'First',
      className: className,
      isDisabled: pager.isFirstPage(),
      label: this.props.labels.first,
      pageNumber: 0,
      createURL
    });
  }

  lastPageLink(pager, createURL) {
    var className = cx(bem('item-last'), this.props.cssClasses.last);
    return this.pageLink({
      ariaLabel: 'Last',
      className: className,
      isDisabled: pager.isLastPage(),
      label: this.props.labels.last,
      pageNumber: pager.total - 1,
      createURL
    });
  }

  pages(pager, createURL) {
    var pages = [];
    var className = cx(bem('item-page'), this.props.cssClasses.item);

    forEach(pager.pages(), (pageNumber) => {
      var isActive = (pageNumber === pager.currentPage);

      pages.push(this.pageLink({
        ariaLabel: pageNumber + 1,
        className: className,
        isActive: isActive,
        label: pageNumber + 1,
        pageNumber: pageNumber,
        createURL
      }));
    });

    return pages;
  }

  render() {
    var pager = new Paginator({
      currentPage: this.props.currentPage,
      total: this.props.nbPages,
      padding: this.props.padding
    });

    var cssClassesList = cx(bem(null), this.props.cssClasses.root);
    var createURL = this.props.createURL;

    return (
      <ul className={cssClassesList}>
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
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    item: React.PropTypes.string,
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

module.exports = Pagination;
