'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _Pagination = require('../Pagination');

var _Pagination2 = _interopRequireDefault(_Pagination);

var _PaginationLink = require('../PaginationLink');

var _PaginationLink2 = _interopRequireDefault(_PaginationLink);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('Pagination', function () {
  var renderer = void 0;

  beforeEach(function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    renderer = createRenderer();
  });

  it('should render five elements', function () {
    var out = render();

    (0, _expect2.default)(out.props.children.length).toEqual(5);
  });

  it('should not display the first/last link by default', function () {
    var out = render();

    (0, _expect2.default)(out.props.children[0]).toEqual(null);
    (0, _expect2.default)(out.props.children[4]).toEqual(null);
  });

  it('should display the first/last link', function () {
    var out = render({ showFirstLast: true });

    (0, _expect2.default)(out.props.children[0]).toNotEqual(null);
    (0, _expect2.default)(out.props.children[4]).toNotEqual(null);
  });

  it('should display the right number of pages', function () {
    var padding = 4;
    var out = render({ padding: padding });

    (0, _expect2.default)(out.props.children[2].length).toEqual(padding + 1 + padding);
  });

  it('should flag the current page as active', function () {
    var out = render({ currentPage: 0 });

    (0, _expect2.default)(out.props.children[2][0].props.cssClasses.item).toBe('item page active');
    (0, _expect2.default)(out.props.children[2][1].props.cssClasses.item).toBe('item page');
  });

  it('should disable the first page if already on it', function () {
    var out = render({ currentPage: 0, showFirstLast: true });

    (0, _expect2.default)(out.props.children[0].props.cssClasses.item).toBe('item first disabled');
  });

  it('should build the associated URL', function () {
    var createURL = _sinon2.default.stub().returns('/page');
    var out = new _Pagination2.default({ cssClasses: {} }).pageLink({
      label: 'test',
      pageNumber: 8,
      createURL: createURL
    });

    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(_PaginationLink2.default, {
      ariaLabel: undefined,
      cssClasses: { item: '', link: '' },
      handleClick: function handleClick() {},
      isDisabled: false,
      key: 'test8',
      label: 'test',
      pageNumber: 8,
      url: '/page'
    }));
    (0, _expect2.default)(createURL.calledOnce).toBe(true, 'createURL should be called once');
  });

  it('should not build the URL of disabled page', function () {
    var createURL = _sinon2.default.spy();
    var out = new _Pagination2.default({ cssClasses: {} }).pageLink({
      label: 'test',
      isDisabled: true,
      pageNumber: 8,
      createURL: createURL
    });

    (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement(_PaginationLink2.default, {
      ariaLabel: undefined,
      cssClasses: { item: '', link: '' },
      handleClick: function handleClick() {},
      isDisabled: true,
      key: 'test8',
      label: 'test',
      pageNumber: 8,
      url: '#'
    }));
    (0, _expect2.default)(createURL.called).toBe(false, 'createURL should not be called');
  });

  it('should disable last page if already on it', function () {
    var out = render({ currentPage: 19, showFirstLast: true });

    (0, _expect2.default)(out.props.children[4].props.cssClasses.item).toBe('item last disabled');
  });

  it('should handle special clicks', function () {
    var props = {
      setCurrentPage: _sinon2.default.spy()
    };
    var preventDefault = _sinon2.default.spy();
    var component = new _Pagination2.default(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach(function (e) {
      var event = { preventDefault: preventDefault };
      event[e] = true;
      component.handleClick(42, event);
      (0, _expect2.default)(props.setCurrentPage.called).toBe(false, 'setCurrentPage never called');
      (0, _expect2.default)(preventDefault.called).toBe(false, 'preventDefault never called');
    });
    component.handleClick(42, { preventDefault: preventDefault });
    (0, _expect2.default)(props.setCurrentPage.calledOnce).toBe(true, 'setCurrentPage called once');
    (0, _expect2.default)(preventDefault.calledOnce).toBe(true, 'preventDefault called once');
  });

  function render() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var props = _extends({
      cssClasses: {
        root: 'root',
        item: 'item',
        page: 'page',
        previous: 'previous',
        next: 'next',
        first: 'first',
        last: 'last',
        active: 'active',
        disabled: 'disabled'
      },
      labels: { first: '', last: '', next: '', previous: '' },
      currentPage: 0,
      nbHits: 200,
      nbPages: 20,
      padding: 3,
      setCurrentPage: function setCurrentPage() {}
    }, extraProps);

    renderer.render(_react2.default.createElement(_Pagination2.default, props));
    return renderer.getRenderOutput();
  }
});