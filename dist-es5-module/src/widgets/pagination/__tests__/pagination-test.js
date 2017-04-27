'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _pagination = require('../pagination');

var _pagination2 = _interopRequireDefault(_pagination);

var _Pagination = require('../../../components/Pagination/Pagination');

var _Pagination2 = _interopRequireDefault(_Pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);


describe('pagination call', function () {
  it('throws an exception when no container', function () {
    (0, _expect2.default)(_pagination2.default.bind(null)).toThrow(/^Usage/);
  });
});
describe('pagination()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var results = void 0;
  var helper = void 0;
  var cssClasses = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    _pagination2.default.__Rewire__('ReactDOM', ReactDOM);
    _pagination2.default.__Rewire__('autoHideContainerHOC', _sinon2.default.stub().returns(_Pagination2.default));

    container = document.createElement('div');
    cssClasses = {
      root: ['root', 'cx'],
      item: 'item',
      link: 'link',
      page: 'page',
      previous: 'previous',
      next: 'next',
      first: 'first',
      last: 'last',
      active: 'active',
      disabled: 'disabled'
    };
    widget = (0, _pagination2.default)({ container: container, scrollTo: false, cssClasses: cssClasses });
    results = { hits: [{ first: 'hit', second: 'hit' }], nbHits: 200, hitsPerPage: 10, nbPages: 20 };
    helper = {
      setCurrentPage: _sinon2.default.spy(),
      search: _sinon2.default.spy()
    };
    widget.init({ helper: helper });
  });

  it('configures nothing', function () {
    (0, _expect2.default)(widget.getConfiguration).toEqual(undefined);
  });

  it('sets the page', function () {
    widget.setCurrentPage(helper, 42);
    (0, _expect2.default)(helper.setCurrentPage.calledOnce).toBe(true);
    (0, _expect2.default)(helper.search.calledOnce).toBe(true);
  });

  it('calls twice ReactDOM.render(<Pagination props />, container)', function () {
    widget.render({ results: results, helper: helper });
    widget.render({ results: results, helper: helper });

    (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Pagination2.default, getProps()));
    (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
    (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_Pagination2.default, getProps()));
    (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  context('mocking getContainerNode', function () {
    var scrollIntoView = void 0;

    beforeEach(function () {
      scrollIntoView = _sinon2.default.spy();
      var getContainerNode = _sinon2.default.stub().returns({
        scrollIntoView: scrollIntoView
      });
      _pagination2.default.__Rewire__('getContainerNode', getContainerNode);
    });

    it('should not scroll', function () {
      widget = (0, _pagination2.default)({ container: container, scrollTo: false });
      widget.init({ helper: helper });
      widget.setCurrentPage(helper, 2);
      (0, _expect2.default)(scrollIntoView.calledOnce).toBe(false, 'scrollIntoView never called');
    });

    it('should scroll to body', function () {
      widget = (0, _pagination2.default)({ container: container });
      widget.init({ helper: helper });
      widget.setCurrentPage(helper, 2);
      (0, _expect2.default)(scrollIntoView.calledOnce).toBe(true, 'scrollIntoView called once');
    });

    afterEach(function () {
      _pagination2.default.__ResetDependency__('utils');
    });
  });

  afterEach(function () {
    _pagination2.default.__ResetDependency__('ReactDOM');
    _pagination2.default.__ResetDependency__('autoHideContainerHOC');
  });

  function getProps() {
    return {
      cssClasses: {
        root: 'ais-pagination root cx',
        item: 'ais-pagination--item item',
        link: 'ais-pagination--link link',
        page: 'ais-pagination--item__page page',
        previous: 'ais-pagination--item__previous previous',
        next: 'ais-pagination--item__next next',
        first: 'ais-pagination--item__first first',
        last: 'ais-pagination--item__last last',
        active: 'ais-pagination--item__active active',
        disabled: 'ais-pagination--item__disabled disabled'
      },
      currentPage: 0,
      shouldAutoHideContainer: false,
      labels: { first: '«', last: '»', next: '›', previous: '‹' },
      nbHits: results.nbHits,
      nbPages: results.nbPages,
      padding: 3,
      setCurrentPage: function setCurrentPage() {},
      showFirstLast: true,
      createURL: function createURL() {
        return '#';
      }
    };
  }
});

describe('pagination MaxPage', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var results = void 0;
  var cssClasses = void 0;
  var paginationOptions = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    _pagination2.default.__Rewire__('ReactDOM', ReactDOM);
    _pagination2.default.__Rewire__('autoHideContainerHOC', _sinon2.default.stub().returns(_Pagination2.default));

    container = document.createElement('div');
    cssClasses = {
      root: 'root',
      item: 'item',
      link: 'link',
      page: 'page',
      previous: 'previous',
      next: 'next',
      first: 'first',
      last: 'last',
      active: 'active',
      disabled: 'disabled'
    };
    results = { hits: [{ first: 'hit', second: 'hit' }], nbHits: 300, hitsPerPage: 10, nbPages: 30 };
    paginationOptions = { container: container, scrollTo: false, cssClasses: cssClasses };
  });

  it('does to have any default', function () {
    widget = (0, _pagination2.default)(paginationOptions);
    (0, _expect2.default)(widget.getMaxPage(results)).toEqual(30);
  });

  it('does reduce the number of page if lower than nbPages', function () {
    paginationOptions.maxPages = 20;
    widget = (0, _pagination2.default)(paginationOptions);
    (0, _expect2.default)(widget.getMaxPage(results)).toEqual(20);
  });

  it('does not reduce the number of page if greater than nbPages', function () {
    paginationOptions.maxPages = 40;
    widget = (0, _pagination2.default)(paginationOptions);
    (0, _expect2.default)(widget.getMaxPage(results)).toEqual(30);
  });
});