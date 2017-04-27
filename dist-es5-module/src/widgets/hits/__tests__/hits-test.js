'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _hits = require('../hits');

var _hits2 = _interopRequireDefault(_hits);

var _Hits = require('../../../components/Hits');

var _Hits2 = _interopRequireDefault(_Hits);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('hits call', function () {
  it('throws an exception when no container', function () {
    (0, _expect2.default)(_hits2.default).toThrow(/^Must provide a container/);
  });
});

describe('hits()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var templateProps = void 0;
  var widget = void 0;
  var results = void 0;
  var props = void 0;
  var defaultTemplates = {
    hit: 'hit',
    empty: 'empty'
  };

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    _hits2.default.__Rewire__('ReactDOM', ReactDOM);
    _hits2.default.__Rewire__('defaultTemplates', defaultTemplates);

    container = document.createElement('div');
    templateProps = {
      transformData: undefined,
      templatesConfig: undefined,
      templates: defaultTemplates,
      useCustomCompileOptions: { hit: false, empty: false }
    };
    widget = (0, _hits2.default)({ container: container, cssClasses: { root: ['root', 'cx'] } });
    widget.init({});
    results = { hits: [{ first: 'hit', second: 'hit' }] };
  });

  it('configures hitsPerPage', function () {
    (0, _expect2.default)(widget.getConfiguration()).toEqual({ hitsPerPage: 20 });
  });

  it('calls twice ReactDOM.render(<Hits props />, container)', function () {
    props = getProps();
    widget.render({ results: results });
    widget.render({ results: results });

    (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_Hits2.default, props));
    (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
    (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_Hits2.default, props));
    (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('does not accept both item and allItems templates', function () {
    (0, _expect2.default)(_hits2.default.bind({ container: container, templates: { item: '', allItems: '' } })).toThrow();
  });

  afterEach(function () {
    _hits2.default.__ResetDependency__('ReactDOM');
    _hits2.default.__ResetDependency__('defaultTemplates');
  });

  function getProps() {
    return {
      hits: results.hits,
      results: results,
      templateProps: templateProps,
      cssClasses: {
        root: 'ais-hits root cx',
        item: 'ais-hits--item',
        empty: 'ais-hits__empty'
      }
    };
  }
});