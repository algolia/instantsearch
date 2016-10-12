'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _hitsPerPageSelector = require('../hits-per-page-selector');

var _hitsPerPageSelector2 = _interopRequireDefault(_hitsPerPageSelector);

var _Selector = require('../../../components/Selector');

var _Selector2 = _interopRequireDefault(_Selector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('hitsPerPageSelector call', function () {
  it('throws an exception when no options', function () {
    var container = document.createElement('div');
    (0, _expect2.default)(_hitsPerPageSelector2.default.bind(null, { container: container })).toThrow(/^Usage:/);
  });

  it('throws an exception when no container', function () {
    var options = { a: { value: 'value', label: 'My value' } };
    (0, _expect2.default)(_hitsPerPageSelector2.default.bind(null, { options: options })).toThrow(/^Usage:/);
  });
});

describe('hitsPerPageSelector()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var options = void 0;
  var cssClasses = void 0;
  var widget = void 0;
  var props = void 0;
  var helper = void 0;
  var results = void 0;
  var autoHideContainer = void 0;
  var consoleLog = void 0;
  var state = void 0;

  beforeEach(function () {
    autoHideContainer = _sinon2.default.stub().returns(_Selector2.default);
    ReactDOM = { render: _sinon2.default.spy() };

    _hitsPerPageSelector2.default.__Rewire__('ReactDOM', ReactDOM);
    _hitsPerPageSelector2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    consoleLog = _sinon2.default.stub(window.console, 'log');

    container = document.createElement('div');
    options = [{ value: 10, label: '10 results' }, { value: 20, label: '20 results' }];
    cssClasses = {
      root: ['custom-root', 'cx'],
      item: 'custom-item'
    };
    widget = (0, _hitsPerPageSelector2.default)({ container: container, options: options, cssClasses: cssClasses });
    helper = {
      state: {
        hitsPerPage: 20
      },
      setQueryParameter: _sinon2.default.stub().returnsThis(),
      search: _sinon2.default.spy()
    };
    state = {
      hitsPerPage: 10
    };
    results = {
      hits: [],
      nbHits: 0
    };
  });

  it('doesn\'t configure anything', function () {
    (0, _expect2.default)(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', function () {
    widget.init({ helper: helper, state: helper.state });
    widget.render({ results: results, state: state });
    widget.render({ results: results, state: state });
    props = {
      cssClasses: {
        root: 'ais-hits-per-page-selector custom-root cx',
        item: 'ais-hits-per-page-selector--item custom-item'
      },
      currentValue: 10,
      shouldAutoHideContainer: true,
      options: [{ value: 10, label: '10 results' }, { value: 20, label: '20 results' }],
      setValue: function setValue() {}
    };
    (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Selector2.default, props));
    (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
    (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_Selector2.default, props));
    (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('sets the underlying hitsPerPage', function () {
    widget.init({ helper: helper, state: helper.state });
    widget.setHitsPerPage(helper, helper.state, 10);
    (0, _expect2.default)(helper.setQueryParameter.calledOnce).toBe(true, 'setQueryParameter called once');
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', function () {
    options.length = 0;
    options.push({ label: 'Label without a value' });
    widget.init({ state: helper.state, helper: helper });
    (0, _expect2.default)(consoleLog.calledOnce).toBe(true, 'console.log called once');
    (0, _expect2.default)(consoleLog.firstCall.args[0]).toEqual('[Warning][hitsPerPageSelector] No option in `options`\nwith `value: hitsPerPage` (hitsPerPage: 20)');
  });

  it('must include the current hitsPerPage at initialization time', function () {
    helper.state.hitsPerPage = -1;
    widget.init({ state: helper.state, helper: helper });
    (0, _expect2.default)(consoleLog.calledOnce).toBe(true, 'console.log called once');
    (0, _expect2.default)(consoleLog.firstCall.args[0]).toEqual('[Warning][hitsPerPageSelector] No option in `options`\nwith `value: hitsPerPage` (hitsPerPage: -1)');
  });

  it('should not throw an error if state does not have a `hitsPerPage`', function () {
    delete helper.state.hitsPerPage;
    (0, _expect2.default)(function () {
      widget.init({ state: helper.state, helper: helper });
    }).toNotThrow(/No option in `options`/);
  });

  afterEach(function () {
    _hitsPerPageSelector2.default.__ResetDependency__('ReactDOM');
    _hitsPerPageSelector2.default.__ResetDependency__('autoHideContainerHOC');
    consoleLog.restore();
  });
});