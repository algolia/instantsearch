'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _priceRanges = require('../price-ranges.js');

var _priceRanges2 = _interopRequireDefault(_priceRanges);

var _generateRanges = require('../generate-ranges.js');

var _generateRanges2 = _interopRequireDefault(_generateRanges);

var _PriceRanges = require('../../../components/PriceRanges/PriceRanges.js');

var _PriceRanges2 = _interopRequireDefault(_PriceRanges);

var _defaultTemplates = require('../defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);


describe('priceRanges call', function () {
  it('throws an exception when no container', function () {
    var attributeName = '';
    (0, _expect2.default)(_priceRanges2.default.bind(null, { attributeName: attributeName })).toThrow(/^Usage:/);
  });

  it('throws an exception when no attributeName', function () {
    var container = document.createElement('div');
    (0, _expect2.default)(_priceRanges2.default.bind(null, { container: container })).toThrow(/^Usage:/);
  });
});

describe('priceRanges()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var results = void 0;
  var helper = void 0;
  var state = void 0;
  var autoHideContainer = void 0;
  var headerFooter = void 0;
  var createURL = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    autoHideContainer = _sinon2.default.stub().returns(_PriceRanges2.default);
    headerFooter = _sinon2.default.stub().returns(_PriceRanges2.default);

    _priceRanges2.default.__Rewire__('ReactDOM', ReactDOM);
    _priceRanges2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    _priceRanges2.default.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');
    widget = (0, _priceRanges2.default)({ container: container, attributeName: 'aNumAttr', cssClasses: { root: ['root', 'cx'] } });
    results = {
      hits: [1],
      nbHits: 1,
      getFacetStats: _sinon2.default.stub().returns({
        min: 1.99,
        max: 4999.98,
        avg: 243.349,
        sum: 2433490.0
      })
    };
  });

  it('adds the attribute as a facet', function () {
    (0, _expect2.default)(widget.getConfiguration()).toEqual({ facets: ['aNumAttr'] });
  });

  context('without refinements', function () {
    var props = void 0;

    beforeEach(function () {
      helper = {
        getRefinements: _sinon2.default.stub().returns([]),
        clearRefinements: _sinon2.default.spy(),
        addNumericRefinement: _sinon2.default.spy(),
        search: _sinon2.default.spy()
      };

      state = {
        clearRefinements: _sinon2.default.stub().returnsThis(),
        addNumericRefinement: _sinon2.default.stub().returnsThis()
      };

      createURL = _sinon2.default.stub().returns('#createURL');

      props = {
        cssClasses: {
          active: 'ais-price-ranges--item__active',
          body: 'ais-price-ranges--body',
          button: 'ais-price-ranges--button',
          currency: 'ais-price-ranges--currency',
          footer: 'ais-price-ranges--footer',
          form: 'ais-price-ranges--form',
          header: 'ais-price-ranges--header',
          input: 'ais-price-ranges--input',
          item: 'ais-price-ranges--item',
          label: 'ais-price-ranges--label',
          list: 'ais-price-ranges--list',
          link: 'ais-price-ranges--link',
          root: 'ais-price-ranges root cx',
          separator: 'ais-price-ranges--separator'
        },
        collapsible: false,
        shouldAutoHideContainer: false,
        facetValues: (0, _generateRanges2.default)(results.getFacetStats()).map(function (facetValue) {
          facetValue.url = '#createURL';
          return facetValue;
        }),
        currency: '$',
        labels: {
          separator: 'to',
          button: 'Go'
        },
        refine: function refine() {},

        templateProps: {
          templates: _defaultTemplates2.default,
          templatesConfig: undefined,
          transformData: undefined,
          useCustomCompileOptions: { header: false, footer: false, item: false }
        }
      };
      widget.init({ helper: helper });
    });

    it('calls twice ReactDOM.render(<PriceRanges props />, container)', function () {
      widget.render({ results: results, helper: helper, state: state, createURL: createURL });
      widget.render({ results: results, helper: helper, state: state, createURL: createURL });

      (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_PriceRanges2.default, props));
      (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
      (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_PriceRanges2.default, props));
      (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });

    it('calls the decorators', function () {
      widget.render({ results: results, helper: helper, state: state, createURL: createURL });
      (0, _expect2.default)(headerFooter.calledOnce).toBe(true);
      (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true);
    });

    it('calls getRefinements to check if there are some refinements', function () {
      widget.render({ results: results, helper: helper, state: state, createURL: createURL });
      (0, _expect2.default)(helper.getRefinements.calledOnce).toBe(true, 'getRefinements called once');
    });

    it('refines on the lower bound', function () {
      widget._refine(10, undefined);
      (0, _expect2.default)(helper.clearRefinements.calledOnce).toBe(true, 'helper.clearRefinements called once');
      (0, _expect2.default)(helper.addNumericRefinement.calledOnce).toBe(true, 'helper.addNumericRefinement called once');
      (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });

    it('refines on the upper bound', function () {
      widget._refine(undefined, 10);
      (0, _expect2.default)(helper.clearRefinements.calledOnce).toBe(true, 'helper.clearRefinements called once');
      (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });

    it('refines on the 2 bounds', function () {
      widget._refine(10, 20);
      (0, _expect2.default)(helper.clearRefinements.calledOnce).toBe(true, 'helper.clearRefinements called once');
      (0, _expect2.default)(helper.addNumericRefinement.calledTwice).toBe(true, 'helper.addNumericRefinement called twice');
      (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'helper.search called once');
    });
  });

  afterEach(function () {
    _priceRanges2.default.__ResetDependency__('ReactDOM');
    _priceRanges2.default.__ResetDependency__('autoHideContainerHOC');
    _priceRanges2.default.__ResetDependency__('headerFooterHOC');
  });
});