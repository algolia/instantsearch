'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _rangeSlider = require('../range-slider.js');

var _rangeSlider2 = _interopRequireDefault(_rangeSlider);

var _Slider = require('../../../components/Slider/Slider.js');

var _Slider2 = _interopRequireDefault(_Slider);

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('rangeSlider call', function () {
  it('throws an exception when no container', function () {
    var attributeName = '';
    (0, _expect2.default)(_rangeSlider2.default.bind(null, { attributeName: attributeName })).toThrow(/^Usage:/);
  });

  it('throws an exception when no attributeName', function () {
    var container = document.createElement('div');
    (0, _expect2.default)(_rangeSlider2.default.bind(null, { container: container })).toThrow(/^Usage:/);
  });
});

describe('rangeSlider()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var results = void 0;
  var helper = void 0;

  var autoHideContainer = void 0;
  var headerFooter = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    _rangeSlider2.default.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = _sinon2.default.stub().returns(_Slider2.default);
    _rangeSlider2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = _sinon2.default.stub().returns(_Slider2.default);
    _rangeSlider2.default.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');

    helper = new _algoliasearchHelper2.default({
      search: function search() {}
    }, 'indexName', { disjunctiveFacets: ['aNumAttr'] });
    _sinon2.default.spy(helper, 'addNumericRefinement');
    _sinon2.default.spy(helper, 'clearRefinements');
    _sinon2.default.spy(helper, 'search');
  });

  context('min option', function () {
    it('refines when no previous configuration', function () {
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', min: 100 });
      (0, _expect2.default)(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: { aNumAttr: { '>=': [100] } }
      });
    });

    it('does not refine when previous configuration', function () {
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', min: 100 });
      (0, _expect2.default)(widget.getConfiguration({ numericRefinements: { aNumAttr: {} } })).toEqual({
        disjunctiveFacets: ['aNumAttr']
      });
    });

    it('works along with max option', function () {
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', min: 100, max: 200 });
      (0, _expect2.default)(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: { aNumAttr: { '>=': [100], '<=': [200] } }
      });
    });

    context('render', function () {
      var defaultProps = {
        cssClasses: {
          root: 'ais-range-slider',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
        onChange: function onChange() {},
        pips: true,
        range: { max: 200, min: 100 },
        shouldAutoHideContainer: false,
        start: [100, 200],
        step: 1,
        templateProps: {
          templates: { footer: '', header: '' },
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: { footer: false, header: false }
        },
        format: { to: function to() {}, from: function from() {} },
        tooltips: true
      };

      it('sets the right ranges', function () {
        results = {};
        widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', min: 100, max: 200 });
        helper.setState(widget.getConfiguration());
        widget.init({ helper: helper });
        widget.render({ results: results, helper: helper });
        var props = defaultProps;

        (0, _expect2.default)(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
        (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
        (0, _expect2.default)(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
        (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Slider2.default, props));
      });

      it('will use the results max when only min passed', function () {
        results = {
          disjunctiveFacets: [{
            name: 'aNumAttr',
            stats: {
              min: 1.99,
              max: 4999.98
            }
          }]
        };
        widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', min: 100 });
        helper.setState(widget.getConfiguration());
        widget.init({ helper: helper });
        widget.render({ results: results, helper: helper });
        var props = _extends({}, defaultProps, {
          range: { min: 100, max: 5000 },
          start: [100, Infinity]
        });

        (0, _expect2.default)(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
        (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
        (0, _expect2.default)(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
        (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Slider2.default, props));
      });
    });
  });

  context('max option', function () {
    it('refines when no previous configuration', function () {
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', max: 100 });
      (0, _expect2.default)(widget.getConfiguration()).toEqual({
        disjunctiveFacets: ['aNumAttr'],
        numericRefinements: { aNumAttr: { '<=': [100] } }
      });
    });

    it('does not refine when previous configuration', function () {
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', max: 100 });
      (0, _expect2.default)(widget.getConfiguration({ numericRefinements: { aNumAttr: {} } })).toEqual({
        disjunctiveFacets: ['aNumAttr']
      });
    });

    context('render', function () {
      var defaultProps = {
        cssClasses: {
          root: 'ais-range-slider',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
        onChange: function onChange() {},
        pips: true,
        range: { max: 200, min: 100 },
        shouldAutoHideContainer: false,
        start: [100, 200],
        step: 1,
        templateProps: {
          templates: { footer: '', header: '' },
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: { footer: false, header: false }
        },
        format: { to: function to() {}, from: function from() {} },
        tooltips: true
      };

      it('will use the results min when only max passed', function () {
        results = {
          disjunctiveFacets: [{
            name: 'aNumAttr',
            stats: {
              min: 1.99,
              max: 4999.98
            }
          }]
        };
        widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', max: 100 });
        helper.setState(widget.getConfiguration());
        widget.init({ helper: helper });
        widget.render({ results: results, helper: helper });
        var props = _extends({}, defaultProps, {
          range: { min: 1, max: 100 },
          start: [-Infinity, 100]
        });

        (0, _expect2.default)(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
        (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
        (0, _expect2.default)(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
        (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Slider2.default, props));
      });
    });
  });

  context('without result', function () {
    beforeEach(function () {
      results = {};
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', cssClasses: { root: ['root', 'cx'] } });
      widget.init({ helper: helper });
    });

    it('calls ReactDOM.render(<Slider props />, container)', function () {
      widget.render({ results: results, helper: helper });

      var props = {
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
        onChange: function onChange() {},
        pips: true,
        range: { max: 0, min: 0 },
        shouldAutoHideContainer: true,
        start: [-Infinity, Infinity],
        step: 1,
        templateProps: {
          templates: { footer: '', header: '' },
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: { footer: false, header: false }
        },
        format: { to: function to() {}, from: function from() {} },
        tooltips: true
      };

      (0, _expect2.default)(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
      (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
      (0, _expect2.default)(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Slider2.default, props));
    });
  });

  context('when rangestats min === stats max', function () {
    beforeEach(function () {
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', cssClasses: { root: ['root', 'cx'] } });
      widget.init({ helper: helper });
      results = {
        disjunctiveFacets: [{
          name: 'aNumAttr',
          stats: {
            min: 65,
            max: 65
          }
        }]
      };
    });

    it('should shouldAutoHideContainer', function () {
      widget.render({ results: results, helper: helper });

      var props = {
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
        onChange: function onChange() {},
        pips: true,
        range: { max: 65, min: 65 },
        shouldAutoHideContainer: true,
        start: [-Infinity, Infinity],
        step: 1,
        templateProps: {
          templates: { footer: '', header: '' },
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: { footer: false, header: false }
        },
        format: { to: function to() {}, from: function from() {} },
        tooltips: true
      };

      (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Slider2.default, props));
    });
  });

  context('with results', function () {
    beforeEach(function () {
      widget = (0, _rangeSlider2.default)({ container: container, attributeName: 'aNumAttr', cssClasses: { root: ['root', 'cx'] } });
      widget.init({ helper: helper });
      results = {
        disjunctiveFacets: [{
          name: 'aNumAttr',
          stats: {
            min: 1.99,
            max: 4999.98
          }
        }]
      };
    });

    it('configures the disjunctiveFacets', function () {
      (0, _expect2.default)(widget.getConfiguration()).toEqual({ disjunctiveFacets: ['aNumAttr'] });
    });

    it('calls twice ReactDOM.render(<Slider props />, container)', function () {
      widget.render({ results: results, helper: helper });
      widget.render({ results: results, helper: helper });

      var props = {
        cssClasses: {
          root: 'ais-range-slider root cx',
          header: 'ais-range-slider--header',
          body: 'ais-range-slider--body',
          footer: 'ais-range-slider--footer'
        },
        collapsible: false,
        onChange: function onChange() {},
        pips: true,
        range: { max: 5000, min: 1 },
        shouldAutoHideContainer: false,
        start: [-Infinity, Infinity],
        step: 1,
        templateProps: {
          templates: { footer: '', header: '' },
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: { footer: false, header: false }
        },
        format: { to: function to() {}, from: function from() {} },
        tooltips: true
      };

      (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
      (0, _expect2.default)(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Slider2.default, props));
      (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
      (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_Slider2.default, props));
      (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });

    it('doesn\'t call the refinement functions if not refined', function () {
      var state0 = helper.state;
      widget.render({ results: results, helper: helper });
      var state1 = helper.state;
      (0, _expect2.default)(state1).toEqual(state0);
      (0, _expect2.default)(helper.search.called).toBe(false, 'search never called');
    });

    it('calls the refinement functions if refined with min+1', function () {
      var stats = results.disjunctiveFacets[0].stats;
      var targetValue = stats.min + 1;

      var state0 = helper.state;
      widget._refine(helper, stats, [targetValue, stats.max]);
      var state1 = helper.state;

      (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
      (0, _expect2.default)(state1).toEqual(state0.addNumericRefinement('aNumAttr', '>=', targetValue));
    });

    it('calls the refinement functions if refined with max-1', function () {
      var stats = results.disjunctiveFacets[0].stats;
      var targetValue = stats.max - 1;

      var state0 = helper.state;
      widget._refine(helper, stats, [stats.min, targetValue]);
      var state1 = helper.state;

      (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
      (0, _expect2.default)(state1).toEqual(state0.addNumericRefinement('aNumAttr', '<=', targetValue));
    });

    it('calls the refinement functions if refined with min+1 and max-1', function () {
      var stats = results.disjunctiveFacets[0].stats;
      var targetValue = [stats.min + 1, stats.max - 1];

      var state0 = helper.state;
      widget._refine(helper, stats, targetValue);
      var state1 = helper.state;

      var expectedState = state0.addNumericRefinement('aNumAttr', '>=', targetValue[0]).addNumericRefinement('aNumAttr', '<=', targetValue[1]);

      (0, _expect2.default)(state1).toEqual(expectedState);
      (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
    });
  });

  afterEach(function () {
    _rangeSlider2.default.__ResetDependency__('ReactDOM');
    _rangeSlider2.default.__ResetDependency__('autoHideContainerHOC');
    _rangeSlider2.default.__ResetDependency__('headerFooterHOC');
  });
});