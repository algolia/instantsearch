'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _stats = require('../stats');

var _stats2 = _interopRequireDefault(_stats);

var _Stats = require('../../../components/Stats/Stats');

var _Stats2 = _interopRequireDefault(_Stats);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('stats call', function () {
  it('should throw when called without container', function () {
    (0, _expect2.default)(function () {
      return (0, _stats2.default)();
    }).toThrow(/^Usage:/);
  });
});

describe('stats()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var results = void 0;

  var autoHideContainer = void 0;
  var headerFooter = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    _stats2.default.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = _sinon2.default.stub().returns(_Stats2.default);
    _stats2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = _sinon2.default.stub().returns(_Stats2.default);
    _stats2.default.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');
    widget = (0, _stats2.default)({ container: container, cssClasses: { body: ['body', 'cx'] } });
    results = {
      hits: [{}, {}],
      nbHits: 20,
      page: 0,
      nbPages: 10,
      hitsPerPage: 2,
      processingTimeMS: 42,
      query: 'a query'
    };
  });

  it('configures nothing', function () {
    (0, _expect2.default)(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Stats props />, container)', function () {
    widget.render({ results: results });
    widget.render({ results: results });
    var props = {
      cssClasses: {
        body: 'ais-stats--body body cx',
        header: 'ais-stats--header',
        footer: 'ais-stats--footer',
        root: 'ais-stats',
        time: 'ais-stats--time'
      },
      collapsible: false,
      hitsPerPage: 2,
      nbHits: 20,
      nbPages: 10,
      page: 0,
      processingTimeMS: 42,
      query: 'a query',
      shouldAutoHideContainer: false,
      templateProps: ReactDOM.render.firstCall.args[0].props.templateProps
    };
    (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
    (0, _expect2.default)(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Stats2.default, props));
    (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
    (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_Stats2.default, props));
    (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  afterEach(function () {
    _stats2.default.__ResetDependency__('ReactDOM');
    _stats2.default.__ResetDependency__('autoHideContainerHOC');
    _stats2.default.__ResetDependency__('headerFooterHOC');
  });
});