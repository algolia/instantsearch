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

var _clearAll = require('../clear-all');

var _clearAll2 = _interopRequireDefault(_clearAll);

var _ClearAll = require('../../../components/ClearAll/ClearAll');

var _ClearAll2 = _interopRequireDefault(_ClearAll);

var _defaultTemplates = require('../defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('clearAll()', function () {
  var ReactDOM = void 0;
  var container = void 0;
  var widget = void 0;
  var props = void 0;
  var results = void 0;
  var helper = void 0;
  var autoHideContainerHOC = void 0;
  var headerFooterHOC = void 0;
  var createURL = void 0;

  beforeEach(function () {
    ReactDOM = { render: _sinon2.default.spy() };
    autoHideContainerHOC = _sinon2.default.stub().returns(_ClearAll2.default);
    headerFooterHOC = _sinon2.default.stub().returns(_ClearAll2.default);
    createURL = _sinon2.default.stub().returns('#all-cleared');

    _clearAll2.default.__Rewire__('ReactDOM', ReactDOM);
    _clearAll2.default.__Rewire__('autoHideContainerHOC', autoHideContainerHOC);
    _clearAll2.default.__Rewire__('headerFooterHOC', headerFooterHOC);

    container = document.createElement('div');
    widget = (0, _clearAll2.default)({ container: container, autoHideContainer: true, cssClasses: { root: ['root', 'cx'] } });

    results = {};
    helper = {
      state: {
        clearRefinements: _sinon2.default.stub().returnsThis(),
        clearTags: _sinon2.default.stub().returnsThis()
      },
      search: _sinon2.default.spy()
    };

    props = {
      clearAll: _sinon2.default.spy(),
      cssClasses: {
        root: 'ais-clear-all root cx',
        header: 'ais-clear-all--header',
        body: 'ais-clear-all--body',
        footer: 'ais-clear-all--footer',
        link: 'ais-clear-all--link'
      },
      collapsible: false,
      hasRefinements: false,
      shouldAutoHideContainer: true,
      templateProps: {
        templates: _defaultTemplates2.default,
        templatesConfig: undefined,
        transformData: undefined,
        useCustomCompileOptions: { header: false, footer: false, link: false }
      },
      url: '#all-cleared'
    };
    widget.init({ helper: helper });
  });

  it('configures nothing', function () {
    (0, _expect2.default)(widget.getConfiguration).toEqual(undefined);
  });

  it('calls the decorators', function () {
    widget.render({ results: results, helper: helper, state: helper.state, createURL: createURL });
    (0, _expect2.default)(headerFooterHOC.calledOnce).toBe(true);
    (0, _expect2.default)(autoHideContainerHOC.calledOnce).toBe(true);
  });

  context('without refinements', function () {
    beforeEach(function () {
      helper.state.facetsRefinements = {};
      props.hasRefinements = false;
      props.shouldAutoHideContainer = true;
    });

    it('calls twice ReactDOM.render(<ClearAll props />, container)', function () {
      widget.render({ results: results, helper: helper, state: helper.state, createURL: createURL });
      widget.render({ results: results, helper: helper, state: helper.state, createURL: createURL });

      (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_ClearAll2.default, getProps()));
      (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
      (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_ClearAll2.default, getProps()));
      (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });
  });

  context('with refinements', function () {
    beforeEach(function () {
      helper.state.facetsRefinements = ['something'];
      props.hasRefinements = true;
      props.shouldAutoHideContainer = false;
    });

    it('calls twice ReactDOM.render(<ClearAll props />, container)', function () {
      widget.render({ results: results, helper: helper, state: helper.state, createURL: createURL });
      widget.render({ results: results, helper: helper, state: helper.state, createURL: createURL });

      (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_ClearAll2.default, getProps()));
      (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(container);
      (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(_ClearAll2.default, getProps()));
      (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(container);
    });
  });

  afterEach(function () {
    _clearAll2.default.__ResetDependency__('ReactDOM');
    _clearAll2.default.__ResetDependency__('defaultTemplates');
  });

  function getProps() {
    var extraProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _extends({}, props, extraProps);
  }
});