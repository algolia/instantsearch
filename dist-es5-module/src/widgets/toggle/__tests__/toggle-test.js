'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _toggle = require('../toggle');

var _toggle2 = _interopRequireDefault(_toggle);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /* eslint-env mocha */

_expect2.default.extend(_expectJsx2.default);

describe('toggle()', function () {
  context('bad usage', function () {
    it('throws when no container', function () {
      (0, _expect2.default)(function () {
        (0, _toggle2.default)();
      }).toThrow(/Container must be `string` or `HTMLElement`/);
    });

    it('throws when no attributeName', function () {
      (0, _expect2.default)(function () {
        (0, _toggle2.default)({ container: document.createElement('div') });
      }).toThrow(/Usage:/);
    });

    it('throws when no label', function () {
      (0, _expect2.default)(function () {
        (0, _toggle2.default)({ container: document.createElement('div'), attributeName: 'Hello' });
      }).toThrow(/Usage:/);
    });
  });

  context('good usage', function () {
    var autoHideContainer = void 0;
    var headerFooter = void 0;
    var container = void 0;
    var widget = void 0;
    var attributeName = void 0;
    var label = void 0;
    var currentToggleImplem = void 0;
    var currentToggle = void 0;
    var legacyToggleImplem = void 0;
    var legacyToggle = void 0;

    beforeEach(function () {
      autoHideContainer = _sinon2.default.stub();
      headerFooter = _sinon2.default.stub();

      currentToggleImplem = { getConfiguration: _sinon2.default.spy(), init: _sinon2.default.spy(), render: _sinon2.default.spy() };
      legacyToggleImplem = { getConfiguration: _sinon2.default.spy(), init: _sinon2.default.spy(), render: _sinon2.default.spy() };
      currentToggle = _sinon2.default.stub().returns(currentToggleImplem);
      legacyToggle = _sinon2.default.stub().returns(legacyToggleImplem);

      _toggle2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
      _toggle2.default.__Rewire__('currentToggle', currentToggle);
      _toggle2.default.__Rewire__('legacyToggle', legacyToggle);
      _toggle2.default.__Rewire__('headerFooterHOC', headerFooter);

      container = document.createElement('div');
      label = 'Hello, ';
      attributeName = 'world!';
      widget = (0, _toggle2.default)({ container: container, attributeName: attributeName, label: label });
    });

    it('uses currentToggle implementation by default', function () {
      widget.getConfiguration(1, 2);
      (0, _expect2.default)(currentToggle.calledOnce).toBe(true);
      (0, _expect2.default)(currentToggleImplem.getConfiguration.calledWithExactly(1, 2)).toBe(true);
      widget.init(1);
      widget.render(2);
      (0, _expect2.default)(currentToggleImplem.init.calledWithExactly(1)).toBe(true);
      (0, _expect2.default)(currentToggleImplem.render.calledWithExactly(2)).toBe(true);
    });

    it('uses legacyToggle implementation when corresponding facetsRefinements set previously', function () {
      var currentSearchParameters = { facetsRefinements: _defineProperty({}, attributeName, ['yes']) };
      widget.getConfiguration(currentSearchParameters, 2);
      (0, _expect2.default)(legacyToggle.calledOnce).toBe(true);
      (0, _expect2.default)(legacyToggleImplem.getConfiguration.calledWithExactly(currentSearchParameters, 2)).toBe(true);
      widget.init(1);
      (0, _expect2.default)(legacyToggleImplem.init.calledWithExactly(1)).toBe(true);
      widget.render(2);
      (0, _expect2.default)(legacyToggleImplem.render.calledWithExactly(2)).toBe(true);
    });

    it('uses legacyToggle implementation when corresponding facetsRefinements set in the url', function () {
      var searchParametersFromUrl = { facetsRefinements: _defineProperty({}, attributeName, ['yes']) };
      widget.getConfiguration(1, searchParametersFromUrl);
      (0, _expect2.default)(legacyToggle.calledOnce).toBe(true);
      (0, _expect2.default)(legacyToggleImplem.getConfiguration.calledWithExactly(1, searchParametersFromUrl)).toBe(true);
      widget.init(1);
      (0, _expect2.default)(legacyToggleImplem.init.calledWithExactly(1)).toBe(true);
      widget.render(2);
      (0, _expect2.default)(legacyToggleImplem.render.calledWithExactly(2)).toBe(true);
    });

    it('uses autoHideContainer() and headerFooter()', function () {
      (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true);
      (0, _expect2.default)(headerFooter.calledOnce).toBe(true);
      (0, _expect2.default)(headerFooter.calledBefore(autoHideContainer)).toBe(true);
    });

    afterEach(function () {
      _toggle2.default.__ResetDependency__('autoHideContainerHOC');
      _toggle2.default.__ResetDependency__('headerFooterHOC');
      _toggle2.default.__ResetDependency__('currentToggle');
      _toggle2.default.__ResetDependency__('legacyToggle');
    });
  });
});