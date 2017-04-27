'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _defaultsDeep = require('lodash/defaultsDeep');

var _defaultsDeep2 = _interopRequireDefault(_defaultsDeep);

var _utils = require('../../lib/utils.js');

var _Paginator = require('./Paginator.js');

var _Paginator2 = _interopRequireDefault(_Paginator);

var _PaginationLink = require('./PaginationLink.js');

var _PaginationLink2 = _interopRequireDefault(_PaginationLink);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Pagination = function (_React$Component) {
  _inherits(Pagination, _React$Component);

  function Pagination(props) {
    _classCallCheck(this, Pagination);

    var _this = _possibleConstructorReturn(this, (Pagination.__proto__ || Object.getPrototypeOf(Pagination)).call(this, (0, _defaultsDeep2.default)(props, Pagination.defaultProps)));

    _this.handleClick = _this.handleClick.bind(_this);
    return _this;
  }

  _createClass(Pagination, [{
    key: 'pageLink',
    value: function pageLink(_ref) {
      var label = _ref.label;
      var ariaLabel = _ref.ariaLabel;
      var pageNumber = _ref.pageNumber;
      var _ref$additionalClassN = _ref.additionalClassName;
      var additionalClassName = _ref$additionalClassN === undefined ? null : _ref$additionalClassN;
      var _ref$isDisabled = _ref.isDisabled;
      var isDisabled = _ref$isDisabled === undefined ? false : _ref$isDisabled;
      var _ref$isActive = _ref.isActive;
      var isActive = _ref$isActive === undefined ? false : _ref$isActive;
      var createURL = _ref.createURL;

      var cssClasses = {
        item: (0, _classnames2.default)(this.props.cssClasses.item, additionalClassName),
        link: (0, _classnames2.default)(this.props.cssClasses.link)
      };
      if (isDisabled) {
        cssClasses.item = (0, _classnames2.default)(cssClasses.item, this.props.cssClasses.disabled);
      } else if (isActive) {
        cssClasses.item = (0, _classnames2.default)(cssClasses.item, this.props.cssClasses.active);
      }

      var url = createURL && !isDisabled ? createURL(pageNumber) : '#';

      return _react2.default.createElement(_PaginationLink2.default, {
        ariaLabel: ariaLabel,
        cssClasses: cssClasses,
        handleClick: this.handleClick,
        isDisabled: isDisabled,
        key: label + pageNumber,
        label: label,
        pageNumber: pageNumber,
        url: url
      });
    }
  }, {
    key: 'previousPageLink',
    value: function previousPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'Previous',
        additionalClassName: this.props.cssClasses.previous,
        isDisabled: pager.isFirstPage(),
        label: this.props.labels.previous,
        pageNumber: pager.currentPage - 1,
        createURL: createURL
      });
    }
  }, {
    key: 'nextPageLink',
    value: function nextPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'Next',
        additionalClassName: this.props.cssClasses.next,
        isDisabled: pager.isLastPage(),
        label: this.props.labels.next,
        pageNumber: pager.currentPage + 1,
        createURL: createURL
      });
    }
  }, {
    key: 'firstPageLink',
    value: function firstPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'First',
        additionalClassName: this.props.cssClasses.first,
        isDisabled: pager.isFirstPage(),
        label: this.props.labels.first,
        pageNumber: 0,
        createURL: createURL
      });
    }
  }, {
    key: 'lastPageLink',
    value: function lastPageLink(pager, createURL) {
      return this.pageLink({
        ariaLabel: 'Last',
        additionalClassName: this.props.cssClasses.last,
        isDisabled: pager.isLastPage(),
        label: this.props.labels.last,
        pageNumber: pager.total - 1,
        createURL: createURL
      });
    }
  }, {
    key: 'pages',
    value: function pages(pager, createURL) {
      var _this2 = this;

      var pages = [];

      (0, _forEach2.default)(pager.pages(), function (pageNumber) {
        var isActive = pageNumber === pager.currentPage;

        pages.push(_this2.pageLink({
          ariaLabel: pageNumber + 1,
          additionalClassName: _this2.props.cssClasses.page,
          isActive: isActive,
          label: pageNumber + 1,
          pageNumber: pageNumber,
          createURL: createURL
        }));
      });

      return pages;
    }
  }, {
    key: 'handleClick',
    value: function handleClick(pageNumber, event) {
      if ((0, _utils.isSpecialClick)(event)) {
        // do not alter the default browser behavior
        // if one special key is down
        return;
      }
      event.preventDefault();
      this.props.setCurrentPage(pageNumber);
    }
  }, {
    key: 'render',
    value: function render() {
      var pager = new _Paginator2.default({
        currentPage: this.props.currentPage,
        total: this.props.nbPages,
        padding: this.props.padding
      });

      var createURL = this.props.createURL;

      return _react2.default.createElement(
        'ul',
        { className: this.props.cssClasses.root },
        this.props.showFirstLast ? this.firstPageLink(pager, createURL) : null,
        this.previousPageLink(pager, createURL),
        this.pages(pager, createURL),
        this.nextPageLink(pager, createURL),
        this.props.showFirstLast ? this.lastPageLink(pager, createURL) : null
      );
    }
  }]);

  return Pagination;
}(_react2.default.Component);

Pagination.propTypes = {
  createURL: _react2.default.PropTypes.func,
  cssClasses: _react2.default.PropTypes.shape({
    root: _react2.default.PropTypes.string,
    item: _react2.default.PropTypes.string,
    link: _react2.default.PropTypes.string,
    page: _react2.default.PropTypes.string,
    previous: _react2.default.PropTypes.string,
    next: _react2.default.PropTypes.string,
    first: _react2.default.PropTypes.string,
    last: _react2.default.PropTypes.string,
    active: _react2.default.PropTypes.string,
    disabled: _react2.default.PropTypes.string
  }),
  currentPage: _react2.default.PropTypes.number,
  labels: _react2.default.PropTypes.shape({
    first: _react2.default.PropTypes.string,
    last: _react2.default.PropTypes.string,
    next: _react2.default.PropTypes.string,
    previous: _react2.default.PropTypes.string
  }),
  nbHits: _react2.default.PropTypes.number,
  nbPages: _react2.default.PropTypes.number,
  padding: _react2.default.PropTypes.number,
  setCurrentPage: _react2.default.PropTypes.func.isRequired,
  showFirstLast: _react2.default.PropTypes.bool
};

Pagination.defaultProps = {
  nbHits: 0,
  currentPage: 0,
  nbPages: 0
};

exports.default = Pagination;