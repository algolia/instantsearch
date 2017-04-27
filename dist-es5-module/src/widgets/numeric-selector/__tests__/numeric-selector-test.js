'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _numericSelector = require('../numeric-selector');

var _numericSelector2 = _interopRequireDefault(_numericSelector);

var _Selector = require('../../../components/Selector');

var _Selector2 = _interopRequireDefault(_Selector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('numericSelector()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var options = void 0;
  var cssClasses = void 0;
  var widget = void 0;
  var expectedProps = void 0;
  var helper = void 0;
  var results = void 0;
  var autoHideContainer = void 0;

  beforeEach(function () {
    autoHideContainer = _sinon2.default.stub().returns(_Selector2.default);
    ReactDOM = { render: _sinon2.default.spy() };

    _numericSelector2.default.__Rewire__('ReactDOM', ReactDOM);
    _numericSelector2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);

    container = document.createElement('div');
    options = [{ value: 1, label: 'first' }, { value: 2, label: 'second' }];
    cssClasses = {
      root: ['custom-root', 'cx'],
      item: 'custom-item'
    };
    widget = (0, _numericSelector2.default)({ container: container, options: options, attributeName: 'aNumAttr', cssClasses: cssClasses });
    expectedProps = {
      cssClasses: {
        root: 'ais-numeric-selector custom-root cx',
        item: 'ais-numeric-selector--item custom-item'
      },
      currentValue: 1,
      shouldAutoHideContainer: true,
      options: [{ value: 1, label: 'first' }, { value: 2, label: 'second' }],
      setValue: function setValue() {}
    };
    helper = {
      addNumericRefinement: _sinon2.default.spy(),
      clearRefinements: _sinon2.default.spy(),
      search: _sinon2.default.spy()
    };
    results = {
      hits: [],
      nbHits: 0
    };
    widget.init({ helper: helper });
    helper.addNumericRefinement.reset();
  });

  it('configures the right numericRefinement', function () {
    (0, _expect2.default)(widget.getConfiguration({}, {})).toEqual({
      numericRefinements: {
        aNumAttr: {
          '=': [1]
        }
      }
    });
  });

  it('configures the right numericRefinement when present in the url', function () {
    var urlState = {
      numericRefinements: {
        aNumAttr: {
          '=': [2]
        }
      }
    };
    (0, _expect2.default)(widget.getConfiguration({}, urlState)).toEqual({
      numericRefinements: {
        aNumAttr: {
          '=': [2]
        }
      }
    });
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', function () {
    widget.render({ helper: helper, results: results, state: helper.state });
    widget.render({ helper: helper, results: results, state: helper.state });

    (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Selector2.default, expectedProps));
    (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
    (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_Selector2.default, expectedProps));
    (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('computes refined values and pass them to <Selector props />', function () {
    helper.state = {
      numericRefinements: {
        aNumAttr: {
          '=': [20]
        }
      }
    };
    expectedProps.currentValue = 20;
    widget.render({ helper: helper, results: results, state: helper.state });
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Selector2.default, expectedProps));
  });

  it('sets the underlying numeric refinement', function () {
    widget._refine(2);
    (0, _expect2.default)(helper.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('cancels the underlying numeric refinement', function () {
    widget._refine(undefined);
    (0, _expect2.default)(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.addNumericRefinement.called).toBe(false, 'addNumericRefinement never called');
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  afterEach(function () {
    _numericSelector2.default.__ResetDependency__('ReactDOM');
    _numericSelector2.default.__ResetDependency__('autoHideContainerHOC');
  });
});