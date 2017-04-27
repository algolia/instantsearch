'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _sortBySelector = require('../sort-by-selector');

var _sortBySelector2 = _interopRequireDefault(_sortBySelector);

var _Selector = require('../../../components/Selector');

var _Selector2 = _interopRequireDefault(_Selector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('sortBySelector call', function () {
  it('throws an exception when no options', function () {
    var container = document.createElement('div');
    (0, _expect2.default)(_sortBySelector2.default.bind(null, { container: container })).toThrow(/^Usage/);
  });

  it('throws an exception when no indices', function () {
    var indices = [];
    (0, _expect2.default)(_sortBySelector2.default.bind(null, { indices: indices })).toThrow(/^Usage/);
  });
});

describe('sortBySelector()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var indices = void 0;
  var cssClasses = void 0;
  var widget = void 0;
  var props = void 0;
  var helper = void 0;
  var results = void 0;
  var autoHideContainer = void 0;

  beforeEach(function () {
    autoHideContainer = _sinon2.default.stub().returns(_Selector2.default);
    ReactDOM = { render: _sinon2.default.spy() };

    _sortBySelector2.default.__Rewire__('ReactDOM', ReactDOM);
    _sortBySelector2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);

    container = document.createElement('div');
    indices = [{ name: 'index-a', label: 'Index A' }, { name: 'index-b', label: 'Index B' }];
    cssClasses = {
      root: ['custom-root', 'cx'],
      item: 'custom-item'
    };
    widget = (0, _sortBySelector2.default)({ container: container, indices: indices, cssClasses: cssClasses });
    helper = {
      getIndex: _sinon2.default.stub().returns('index-a'),
      setIndex: _sinon2.default.stub().returnsThis(),
      search: _sinon2.default.spy()
    };

    results = {
      hits: [],
      nbHits: 0
    };
    widget.init({ helper: helper });
  });

  it('doesn\'t configure anything', function () {
    (0, _expect2.default)(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', function () {
    widget.render({ helper: helper, results: results });
    widget.render({ helper: helper, results: results });
    props = {
      cssClasses: {
        root: 'ais-sort-by-selector custom-root cx',
        item: 'ais-sort-by-selector--item custom-item'
      },
      currentValue: 'index-a',
      shouldAutoHideContainer: true,
      options: [{ value: 'index-a', label: 'Index A' }, { value: 'index-b', label: 'Index B' }],
      setValue: function setValue() {}
    };
    (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Selector2.default, props));
    (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
    (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_Selector2.default, props));
    (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('sets the underlying index', function () {
    widget.setIndex('index-b');
    (0, _expect2.default)(helper.setIndex.calledOnce).toBe(true, 'setIndex called once');
    (0, _expect2.default)(helper.search.calledOnce).toBe(true, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', function () {
    indices.length = 0;
    indices.push({ label: 'Label without a name' });
    (0, _expect2.default)(function () {
      widget.init({ helper: helper });
    }).toThrow(/Index index-a not present/);
  });

  it('must include the current index at initialization time', function () {
    helper.getIndex = _sinon2.default.stub().returns('non-existing-index');
    (0, _expect2.default)(function () {
      widget.init({ helper: helper });
    }).toThrow(/Index non-existing-index not present/);
  });

  afterEach(function () {
    _sortBySelector2.default.__ResetDependency__('ReactDOM');
    _sortBySelector2.default.__ResetDependency__('autoHideContainerHOC');
  });
});