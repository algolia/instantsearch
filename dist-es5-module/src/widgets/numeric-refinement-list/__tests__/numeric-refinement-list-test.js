'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _numericRefinementList = require('../numeric-refinement-list.js');

var _numericRefinementList2 = _interopRequireDefault(_numericRefinementList);

var _RefinementList = require('../../../components/RefinementList/RefinementList.js');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default); /* eslint-env mocha */

describe('numericRefinementList call', function () {
  it('throws an exception when no container', function () {
    var attributeName = '';
    var options = [];
    (0, _expect2.default)(_numericRefinementList2.default.bind(null, { attributeName: attributeName, options: options })).toThrow(/^Usage/);
  });

  it('throws an exception when no attributeName', function () {
    var container = document.createElement('div');
    var options = [];
    (0, _expect2.default)(_numericRefinementList2.default.bind(null, { container: container, options: options })).toThrow(/^Usage/);
  });

  it('throws an exception when no options', function () {
    var container = document.createElement('div');
    var attributeName = '';
    (0, _expect2.default)(_numericRefinementList2.default.bind(null, { attributeName: attributeName, container: container })).toThrow(/^Usage/);
  });
});

describe('numericRefinementList()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var helper = void 0;

  var autoHideContainer = void 0;
  var headerFooter = void 0;
  var options = void 0;
  var results = void 0;
  var createURL = void 0;
  var state = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    _numericRefinementList2.default.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = _sinon2.default.stub().returns(_RefinementList2.default);
    _numericRefinementList2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = _sinon2.default.stub().returns(_RefinementList2.default);
    _numericRefinementList2.default.__Rewire__('headerFooterHOC', headerFooter);

    options = [{ name: 'All' }, { end: 4, name: 'less than 4' }, { start: 4, end: 4, name: '4' }, { start: 5, end: 10, name: 'between 5 and 10' }, { start: 10, name: 'more than 10' }];

    container = document.createElement('div');
    widget = (0, _numericRefinementList2.default)({
      container: container,
      attributeName: 'price',
      options: options,
      cssClasses: { root: ['root', 'cx'] }
    });
    helper = {
      state: {
        getNumericRefinements: _sinon2.default.stub().returns([])
      },
      addNumericRefinement: _sinon2.default.spy(),
      search: _sinon2.default.spy(),
      setState: _sinon2.default.stub().returnsThis()
    };
    state = {
      getNumericRefinements: _sinon2.default.stub().returns([]),
      clearRefinements: _sinon2.default.stub().returnsThis(),
      addNumericRefinement: _sinon2.default.stub().returnsThis()
    };
    results = {
      hits: []
    };

    helper.state.clearRefinements = _sinon2.default.stub().returns(helper.state);
    helper.state.addNumericRefinement = _sinon2.default.stub().returns(helper.state);
    createURL = function createURL() {
      return '#';
    };
    widget.init({ helper: helper });
  });

  it('calls twice ReactDOM.render(<RefinementList props />, container)', function () {
    widget.render({ state: state, results: results, createURL: createURL });
    widget.render({ state: state, results: results, createURL: createURL });

    var props = {
      cssClasses: {
        active: 'ais-refinement-list--item__active',
        body: 'ais-refinement-list--body',
        footer: 'ais-refinement-list--footer',
        header: 'ais-refinement-list--header',
        item: 'ais-refinement-list--item',
        label: 'ais-refinement-list--label',
        list: 'ais-refinement-list--list',
        radio: 'ais-refinement-list--radio',
        root: 'ais-refinement-list root cx'
      },
      collapsible: false,
      createURL: function createURL() {},

      facetValues: [{ attributeName: 'price', isRefined: true, name: 'All' }, { attributeName: 'price', end: 4, isRefined: false, name: 'less than 4' }, { attributeName: 'price', end: 4, isRefined: false, name: '4', start: 4 }, { attributeName: 'price', end: 10, isRefined: false, name: 'between 5 and 10', start: 5 }, { attributeName: 'price', isRefined: false, name: 'more than 10', start: 10 }],
      toggleRefinement: function toggleRefinement() {},
      shouldAutoHideContainer: false,
      templateProps: {
        templates: {
          footer: '',
          header: '',
          // eslint-disable-next-line max-len
          item: '<label class="{{cssClasses.label}}">\n <input type="radio" class="{{cssClasses.checkbox}}" name="{{attributeName}}" {{#isRefined}}checked{{/isRefined}} />{{name}}\n</label>'
        },
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

  it('doesn\'t call the refinement functions if not refined', function () {
    widget.render({ state: state, results: results, createURL: createURL });
    (0, _expect2.default)(helper.state.clearRefinements.called).toBe(false, 'clearRefinements called one');
    (0, _expect2.default)(helper.state.addNumericRefinement.called).toBe(false, 'addNumericRefinement never called');
    (0, _expect2.default)(helper.search.called).toBe(false, 'search never called');
  });

  it('calls the refinement functions if refined with "4"', function () {
    widget._toggleRefinement('4');
    (0, _expect2.default)(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.state.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    (0, _expect2.default)(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '=', 4]);
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls the refinement functions if refined with "between 5 and 10"', function () {
    widget._toggleRefinement('between 5 and 10');
    (0, _expect2.default)(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.state.addNumericRefinement.calledTwice).toBe(true, 'addNumericRefinement called twice');
    (0, _expect2.default)(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '>=', 5]);
    (0, _expect2.default)(helper.state.addNumericRefinement.getCall(1).args).toEqual(['price', '<=', 10]);
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls two times the refinement functions if refined with "less than 4"', function () {
    widget._toggleRefinement('less than 4');
    (0, _expect2.default)(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.state.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    (0, _expect2.default)(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '<=', 4]);
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('calls two times the refinement functions if refined with "more than 10"', function () {
    widget._toggleRefinement('more than 10');
    (0, _expect2.default)(helper.state.clearRefinements.calledOnce).toBe(true, 'clearRefinements called once');
    (0, _expect2.default)(helper.state.addNumericRefinement.calledOnce).toBe(true, 'addNumericRefinement called once');
    (0, _expect2.default)(helper.state.addNumericRefinement.getCall(0).args).toEqual(['price', '>=', 10]);
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('does not alter the initial options when rendering', function () {
    // Note: https://github.com/algolia/instantsearch.js/issues/1010
    // Make sure we work on a copy of the initial facetValues when rendering,
    // not directly editing it

    // Given
    var initialOptions = [{ start: 0, end: 5, name: '1-5' }];
    var initialOptionsClone = (0, _cloneDeep2.default)(initialOptions);
    var testWidget = (0, _numericRefinementList2.default)({
      container: container,
      attributeName: 'price',
      options: initialOptions
    });

    // When
    testWidget.render({ state: state, results: results, createURL: createURL });

    // Then
    (0, _expect2.default)(initialOptions).toEqual(initialOptionsClone);
  });

  afterEach(function () {
    _numericRefinementList2.default.__ResetDependency__('ReactDOM');
    _numericRefinementList2.default.__ResetDependency__('autoHideContainerHOC');
    _numericRefinementList2.default.__ResetDependency__('headerFooterHOC');
  });
});