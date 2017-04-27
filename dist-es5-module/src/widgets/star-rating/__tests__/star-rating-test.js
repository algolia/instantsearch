'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _defaultTemplates = require('../defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _defaultLabels = require('../defaultLabels.js');

var _defaultLabels2 = _interopRequireDefault(_defaultLabels);

var _starRating = require('../star-rating.js');

var _starRating2 = _interopRequireDefault(_starRating);

var _RefinementList = require('../../../components/RefinementList/RefinementList.js');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('starRating()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var helper = void 0;
  var state = void 0;
  var createURL = void 0;

  var autoHideContainer = void 0;
  var headerFooter = void 0;
  var results = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    _starRating2.default.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = _sinon2.default.stub().returns(_RefinementList2.default);
    _starRating2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = _sinon2.default.stub().returns(_RefinementList2.default);
    _starRating2.default.__Rewire__('headerFooterHOC', headerFooter);

    container = document.createElement('div');
    widget = (0, _starRating2.default)({ container: container, attributeName: 'anAttrName', cssClasses: { body: ['body', 'cx'] } });
    helper = {
      clearRefinements: _sinon2.default.spy(),
      addDisjunctiveFacetRefinement: _sinon2.default.spy(),
      getRefinements: _sinon2.default.stub().returns([]),
      search: _sinon2.default.spy(),
      setState: _sinon2.default.spy()
    };
    state = {
      toggleRefinement: _sinon2.default.spy()
    };
    results = {
      getFacetValues: _sinon2.default.stub().returns([]),
      hits: []
    };
    createURL = function createURL() {
      return '#';
    };
    widget.init({ helper: helper });
  });

  it('configures the underlying disjunctive facet', function () {
    (0, _expect2.default)(widget.getConfiguration()).toEqual({ disjunctiveFacets: ['anAttrName'] });
  });

  it('calls twice ReactDOM.render(<RefinementList props />, container)', function () {
    widget.render({ state: state, helper: helper, results: results, createURL: createURL });
    widget.render({ state: state, helper: helper, results: results, createURL: createURL });

    var props = {
      cssClasses: {
        active: 'ais-star-rating--item__active',
        body: 'ais-star-rating--body body cx',
        footer: 'ais-star-rating--footer',
        header: 'ais-star-rating--header',
        item: 'ais-star-rating--item',
        count: 'ais-star-rating--count',
        link: 'ais-star-rating--link',
        disabledLink: 'ais-star-rating--link__disabled',
        list: 'ais-star-rating--list',
        star: 'ais-star-rating--star',
        emptyStar: 'ais-star-rating--star__empty',
        root: 'ais-star-rating'
      },
      collapsible: false,
      createURL: function createURL() {},
      facetValues: [{ isRefined: false, stars: [true, true, true, true, false], count: 0, name: '4', labels: _defaultLabels2.default }, { isRefined: false, stars: [true, true, true, false, false], count: 0, name: '3', labels: _defaultLabels2.default }, { isRefined: false, stars: [true, true, false, false, false], count: 0, name: '2', labels: _defaultLabels2.default }, { isRefined: false, stars: [true, false, false, false, false], count: 0, name: '1', labels: _defaultLabels2.default }],
      toggleRefinement: function toggleRefinement() {},
      shouldAutoHideContainer: false,
      templateProps: {
        templates: _defaultTemplates2.default,
        templatesConfig: undefined,
        transformData: undefined,
        useCustomCompileOptions: {
          footer: false,
          header: false,
          item: false
        }
      }
    };

    (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true, 'autoHideContainer called once');
    (0, _expect2.default)(headerFooter.calledOnce).toBe(true, 'headerFooter called once');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_RefinementList2.default, props));
    (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
    (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_RefinementList2.default, props));
    (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('hide the count==0 when there is a refinement', function () {
    helper.getRefinements = _sinon2.default.stub().returns([{ value: '1' }]);
    results.getFacetValues = _sinon2.default.stub().returns([{ name: '1', count: 42 }]);
    widget.render({ state: state, helper: helper, results: results, createURL: createURL });
    (0, _expect2.default)(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0].props.facetValues).toEqual([{
      count: 42,
      isRefined: true,
      name: '1',
      stars: [true, false, false, false, false],
      labels: _defaultLabels2.default
    }]);
  });

  it('doesn\'t call the refinement functions if not refined', function () {
    helper.getRefinements = _sinon2.default.stub().returns([]);
    widget.render({ state: state, helper: helper, results: results, createURL: createURL });
    (0, _expect2.default)(helper.clearRefinements.called).toBe(false, 'clearRefinements never called');
    (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.called).toBe(false, 'addDisjunctiveFacetRefinement never called');
    (0, _expect2.default)(helper.search.called).toBe(false, 'search never called');
  });

  it('refines the search', function () {
    helper.getRefinements = _sinon2.default.stub().returns([]);
    widget._toggleRefinement('3');
    (0, _expect2.default)(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledThrice).toBe(true, 'addDisjunctiveFacetRefinement called thrice');
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('toggles the refinements', function () {
    helper.getRefinements = _sinon2.default.stub().returns([{ value: '2' }]);
    widget._toggleRefinement('2');
    (0, _expect2.default)(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.called).toBe(false, 'addDisjunctiveFacetRefinement never called');
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('toggles the refinements with another facet', function () {
    helper.getRefinements = _sinon2.default.stub().returns([{ value: '2' }]);
    widget._toggleRefinement('4');
    (0, _expect2.default)(helper.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledTwice).toBe(true, 'addDisjunctiveFacetRefinement called twice');
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  afterEach(function () {
    _starRating2.default.__ResetDependency__('ReactDOM');
    _starRating2.default.__ResetDependency__('autoHideContainerHOC');
    _starRating2.default.__ResetDependency__('headerFooterHOC');
  });
});