'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _utils = require('../../lib/utils.js');

var _Template = require('../Template.js');

var _Template2 = _interopRequireDefault(_Template);

var _RefinementListItem = require('./RefinementListItem.js');

var _RefinementListItem2 = _interopRequireDefault(_RefinementListItem);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RefinementList = function (_React$Component) {
  _inherits(RefinementList, _React$Component);

  function RefinementList(props) {
    _classCallCheck(this, RefinementList);

    var _this = _possibleConstructorReturn(this, (RefinementList.__proto__ || Object.getPrototypeOf(RefinementList)).call(this, props));

    _this.state = {
      isShowMoreOpen: false
    };
    _this.handleItemClick = _this.handleItemClick.bind(_this);
    _this.handleClickShowMore = _this.handleClickShowMore.bind(_this);
    return _this;
  }

  _createClass(RefinementList, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      var isStateDifferent = nextState !== this.state;
      var isFacetValuesDifferent = !(0, _isEqual2.default)(this.props.facetValues, nextProps.facetValues);
      var shouldUpdate = isStateDifferent || isFacetValuesDifferent;
      return shouldUpdate;
    }
  }, {
    key: 'refine',
    value: function refine(facetValueToRefine, isRefined) {
      this.props.toggleRefinement(facetValueToRefine, isRefined);
    }
  }, {
    key: '_generateFacetItem',
    value: function _generateFacetItem(facetValue) {
      var subItems = void 0;
      var hasChildren = facetValue.data && facetValue.data.length > 0;
      if (hasChildren) {
        subItems = _react2.default.createElement(RefinementList, _extends({}, this.props, {
          depth: this.props.depth + 1,
          facetValues: facetValue.data
        }));
      }

      var url = this.props.createURL(facetValue[this.props.attributeNameKey]);
      var templateData = _extends({}, facetValue, { url: url, cssClasses: this.props.cssClasses });

      var cssClassItem = (0, _classnames2.default)(this.props.cssClasses.item, _defineProperty({}, this.props.cssClasses.active, facetValue.isRefined));

      var key = facetValue[this.props.attributeNameKey];
      if (facetValue.isRefined !== undefined) {
        key += '/' + facetValue.isRefined;
      }

      if (facetValue.count !== undefined) {
        key += '/' + facetValue.count;
      }

      return _react2.default.createElement(_RefinementListItem2.default, {
        facetValueToRefine: facetValue[this.props.attributeNameKey],
        handleClick: this.handleItemClick,
        isRefined: facetValue.isRefined,
        itemClassName: cssClassItem,
        key: key,
        subItems: subItems,
        templateData: templateData,
        templateKey: 'item',
        templateProps: this.props.templateProps
      });
    }

    // Click events on DOM tree like LABEL > INPUT will result in two click events
    // instead of one.
    // No matter the framework, see https://www.google.com/search?q=click+label+twice
    //
    // Thus making it hard to distinguish activation from deactivation because both click events
    // are very close. Debounce is a solution but hacky.
    //
    // So the code here checks if the click was done on or in a LABEL. If this LABEL
    // has a checkbox inside, we ignore the first click event because we will get another one.
    //
    // We also check if the click was done inside a link and then e.preventDefault() because we already
    // handle the url
    //
    // Finally, we always stop propagation of the event to avoid multiple levels RefinementLists to fail: click
    // on child would click on parent also

  }, {
    key: 'handleItemClick',
    value: function handleItemClick(_ref) {
      var facetValueToRefine = _ref.facetValueToRefine;
      var originalEvent = _ref.originalEvent;
      var isRefined = _ref.isRefined;

      if ((0, _utils.isSpecialClick)(originalEvent)) {
        // do not alter the default browser behavior
        // if one special key is down
        return;
      }

      if (originalEvent.target.tagName === 'INPUT') {
        this.refine(facetValueToRefine, isRefined);
        return;
      }

      var parent = originalEvent.target;

      while (parent !== originalEvent.currentTarget) {
        if (parent.tagName === 'LABEL' && (parent.querySelector('input[type="checkbox"]') || parent.querySelector('input[type="radio"]'))) {
          return;
        }

        if (parent.tagName === 'A' && parent.href) {
          originalEvent.preventDefault();
        }

        parent = parent.parentNode;
      }

      originalEvent.stopPropagation();

      this.refine(facetValueToRefine, isRefined);
    }
  }, {
    key: 'handleClickShowMore',
    value: function handleClickShowMore() {
      var isShowMoreOpen = !this.state.isShowMoreOpen;
      this.setState({ isShowMoreOpen: isShowMoreOpen });
    }
  }, {
    key: 'render',
    value: function render() {
      // Adding `-lvl0` classes
      var cssClassList = [this.props.cssClasses.list];
      if (this.props.cssClasses.depth) {
        cssClassList.push('' + this.props.cssClasses.depth + this.props.depth);
      }

      var limit = this.state.isShowMoreOpen ? this.props.limitMax : this.props.limitMin;
      var displayedFacetValues = this.props.facetValues.slice(0, limit);
      var displayShowMore = this.props.showMore === true &&
      // "Show more"
      this.props.facetValues.length > displayedFacetValues.length ||
      // "Show less", but hide it if the result set changed
      this.state.isShowMoreOpen && displayedFacetValues.length > this.props.limitMin;

      var showMoreBtn = displayShowMore ? _react2.default.createElement(_Template2.default, _extends({
        rootProps: { onClick: this.handleClickShowMore },
        templateKey: 'show-more-' + (this.state.isShowMoreOpen ? 'active' : 'inactive')
      }, this.props.templateProps)) : undefined;

      return _react2.default.createElement(
        'div',
        { className: (0, _classnames2.default)(cssClassList) },
        displayedFacetValues.map(this._generateFacetItem, this),
        showMoreBtn
      );
    }
  }]);

  return RefinementList;
}(_react2.default.Component);

RefinementList.propTypes = {
  Template: _react2.default.PropTypes.func,
  attributeNameKey: _react2.default.PropTypes.string,
  createURL: _react2.default.PropTypes.func,
  cssClasses: _react2.default.PropTypes.shape({
    active: _react2.default.PropTypes.string,
    depth: _react2.default.PropTypes.string,
    item: _react2.default.PropTypes.string,
    list: _react2.default.PropTypes.string
  }),
  depth: _react2.default.PropTypes.number,
  facetValues: _react2.default.PropTypes.array,
  limitMax: _react2.default.PropTypes.number,
  limitMin: _react2.default.PropTypes.number,
  showMore: _react2.default.PropTypes.bool,
  templateProps: _react2.default.PropTypes.object.isRequired,
  toggleRefinement: _react2.default.PropTypes.func.isRequired
};

RefinementList.defaultProps = {
  cssClasses: {},
  depth: 0,
  attributeNameKey: 'name'
};

exports.default = RefinementList;