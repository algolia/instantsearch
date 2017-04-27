'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _currentToggle = require('../currentToggle.js');

var _currentToggle2 = _interopRequireDefault(_currentToggle);

var _defaultTemplates = require('../../defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _Template = require('../../../../components/Template');

var _Template2 = _interopRequireDefault(_Template);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _createHelpers = require('../../../../lib/createHelpers.js');

var _createHelpers2 = _interopRequireDefault(_createHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);


describe('currentToggle()', function () {
  var helpers = (0, _createHelpers2.default)('en-US');
  var renderer = (0, _reactAddonsTestUtils.createRenderer)();

  context('good usage', function () {
    var ReactDOM = void 0;
    var containerNode = void 0;
    var widget = void 0;
    var attributeName = void 0;
    var label = void 0;
    var userValues = void 0;
    var RefinementList = void 0;
    var collapsible = void 0;
    var cssClasses = void 0;

    beforeEach(function () {
      ReactDOM = { render: _sinon2.default.spy() };

      _currentToggle2.default.__Rewire__('ReactDOM', ReactDOM);

      containerNode = document.createElement('div');
      label = 'Hello, ';
      attributeName = 'world!';
      cssClasses = {};
      collapsible = false;
      userValues = { on: true, off: undefined };
      RefinementList = function RefinementList() {
        return _react2.default.createElement('div', null);
      };
      widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label });
    });

    it('configures disjunctiveFacets', function () {
      (0, _expect2.default)(widget.getConfiguration()).toEqual({ disjunctiveFacets: ['world!'] });
    });

    context('render', function () {
      var templateProps = void 0;
      var results = void 0;
      var helper = void 0;
      var state = void 0;
      var props = void 0;
      var createURL = void 0;

      beforeEach(function () {
        templateProps = {
          templatesConfig: undefined,
          templates: _defaultTemplates2.default,
          useCustomCompileOptions: { header: false, item: false, footer: false },
          transformData: undefined
        };
        helper = {
          state: {
            isDisjunctiveFacetRefined: _sinon2.default.stub().returns(false)
          },
          removeDisjunctiveFacetRefinement: _sinon2.default.spy(),
          addDisjunctiveFacetRefinement: _sinon2.default.spy(),
          search: _sinon2.default.spy()
        };
        state = {
          removeDisjunctiveFacetRefinement: _sinon2.default.spy(),
          addDisjunctiveFacetRefinement: _sinon2.default.spy(),
          isDisjunctiveFacetRefined: _sinon2.default.stub().returns(false)
        };
        props = {
          cssClasses: {},
          collapsible: false,
          templateProps: templateProps,
          createURL: function createURL() {},
          toggleRefinement: function toggleRefinement() {}
        };
        createURL = function createURL() {
          return '#';
        };
        widget.init({ state: state });
      });

      it('calls twice ReactDOM.render', function () {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: _sinon2.default.stub().returns([{ name: 'true', count: 2 }, { name: 'false', count: 1 }])
        };
        widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, userValues: userValues });
        widget.getConfiguration();
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });
        (0, _expect2.default)(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
        (0, _expect2.default)(ReactDOM.render.firstCall.args[1]).toEqual(containerNode);
        (0, _expect2.default)(ReactDOM.render.secondCall.args[1]).toEqual(containerNode);
      });

      it('formats counts', function () {
        templateProps.templatesConfig = { helpers: helpers };
        renderer.render(_react2.default.createElement(_Template2.default, _extends({ data: { count: 1000 } }, templateProps, { templateKey: 'item' })));
        var out = renderer.getRenderOutput();
        // eslint-disable-next-line max-len
        (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: '<label class="">\n <input type="checkbox" class="" value="" />\n <span class="">1,000</span>\n</label>' } }));
      });

      it('understands cssClasses', function () {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: _sinon2.default.stub().returns([{ name: 'true', count: 2, isRefined: false }, { name: 'false', count: 1, isRefined: false }])
        };
        props.cssClasses.root = 'test';
        props = _extends({
          facetValues: [{
            count: 2,
            isRefined: false,
            name: label,
            offFacetValue: { count: 1, name: 'Hello, ', isRefined: false },
            onFacetValue: { count: 2, name: 'Hello, ', isRefined: false }
          }],
          shouldAutoHideContainer: false
        }, props);
        cssClasses = { root: 'test' };
        widget = (0, _currentToggle2.default)({
          containerNode: containerNode,
          attributeName: attributeName,
          label: label,
          cssClasses: cssClasses,
          userValues: userValues,
          RefinementList: RefinementList,
          collapsible: collapsible
        });
        widget.getConfiguration();
        widget.init({ state: state, helper: helper });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });
        (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(RefinementList, props));
      });

      it('with facet values', function () {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: _sinon2.default.stub().returns([{ name: 'true', count: 2, isRefined: false }, { name: 'false', count: 1, isRefined: false }])
        };
        widget = (0, _currentToggle2.default)({
          containerNode: containerNode,
          attributeName: attributeName,
          label: label,
          cssClasses: cssClasses,
          userValues: userValues,
          RefinementList: RefinementList,
          collapsible: collapsible
        });
        widget.getConfiguration();
        widget.init({ state: state, helper: helper });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });

        props = _extends({
          facetValues: [{
            count: 2,
            isRefined: false,
            name: label,
            offFacetValue: { count: 1, name: 'Hello, ', isRefined: false },
            onFacetValue: { count: 2, name: 'Hello, ', isRefined: false }
          }],
          shouldAutoHideContainer: false
        }, props);

        (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(RefinementList, props));
        (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(RefinementList, props));
      });

      it('without facet values', function () {
        results = {
          hits: [],
          nbHits: 0,
          getFacetValues: _sinon2.default.stub().returns([])
        };
        widget = (0, _currentToggle2.default)({
          containerNode: containerNode,
          attributeName: attributeName,
          label: label,
          cssClasses: cssClasses,
          userValues: userValues,
          RefinementList: RefinementList,
          collapsible: collapsible
        });
        widget.getConfiguration();
        widget.init({ state: state, helper: helper });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });

        props = _extends({
          facetValues: [{
            name: label,
            isRefined: false,
            count: null,
            onFacetValue: { name: label, isRefined: false, count: null },
            offFacetValue: { name: label, isRefined: false, count: 0 }
          }],
          shouldAutoHideContainer: true
        }, props);

        (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(RefinementList, props));
        (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(RefinementList, props));
      });

      it('when refined', function () {
        helper = {
          state: {
            isDisjunctiveFacetRefined: _sinon2.default.stub().returns(true)
          }
        };
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: _sinon2.default.stub().returns([{ name: 'true', count: 2, isRefined: true }, { name: 'false', count: 1, isRefined: false }])
        };
        widget = (0, _currentToggle2.default)({
          containerNode: containerNode,
          attributeName: attributeName,
          label: label,
          cssClasses: cssClasses,
          userValues: userValues,
          RefinementList: RefinementList,
          collapsible: collapsible
        });
        widget.getConfiguration();
        widget.init({ state: state, helper: helper });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });

        props = _extends({
          facetValues: [{
            count: 1,
            isRefined: true,
            name: label,
            onFacetValue: { name: label, isRefined: true, count: 2 },
            offFacetValue: { name: label, isRefined: false, count: 1 }
          }],
          shouldAutoHideContainer: false
        }, props);

        (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(RefinementList, props));
        (0, _expect2.default)(ReactDOM.render.secondCall.args[0]).toEqualJSX(_react2.default.createElement(RefinementList, props));
      });

      it('using props.toggleRefinement', function () {
        results = {
          hits: [{ Hello: ', world!' }],
          nbHits: 1,
          getFacetValues: _sinon2.default.stub().returns([{ name: 'true', count: 2 }, { name: 'false', count: 1 }])
        };
        widget = (0, _currentToggle2.default)({
          containerNode: containerNode,
          attributeName: attributeName,
          label: label,
          cssClasses: cssClasses,
          userValues: userValues,
          RefinementList: RefinementList,
          collapsible: collapsible
        });
        widget.getConfiguration();
        widget.init({ state: state, helper: helper });
        widget.render({ results: results, helper: helper, state: state, createURL: createURL });
        var toggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;
        (0, _expect2.default)(toggleRefinement).toBeA('function');
        toggleRefinement();
        (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledOnce).toBe(true);
        (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledWithExactly(attributeName, true));
        helper.hasRefinements = _sinon2.default.stub().returns(true);
      });
    });

    context('toggleRefinement', function () {
      var helper = void 0;

      function toggleOn() {
        widget.toggleRefinement(helper, 'facetValueToRefine', false);
      }
      function toggleOff() {
        widget.toggleRefinement(helper, 'facetValueToRefine', true);
      }

      beforeEach(function () {
        helper = {
          removeDisjunctiveFacetRefinement: _sinon2.default.spy(),
          addDisjunctiveFacetRefinement: _sinon2.default.spy(),
          search: _sinon2.default.spy()
        };
      });

      context('default values', function () {
        it('toggle on should add filter to true', function () {
          // Given
          widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, userValues: userValues });
          widget.getConfiguration();

          // When
          toggleOn();

          // Then
          (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, true)).toBe(true);
          (0, _expect2.default)(helper.removeDisjunctiveFacetRefinement.called).toBe(false);
        });
        it('toggle off should remove all filters', function () {
          // Given
          widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, userValues: userValues });
          widget.getConfiguration();

          // When
          toggleOff();

          // Then
          (0, _expect2.default)(helper.removeDisjunctiveFacetRefinement.calledWith(attributeName, true)).toBe(true);
          (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.called).toBe(false);
        });
      });
      context('specific values', function () {
        it('toggle on should change the refined value', function () {
          // Given
          userValues = { on: 'on', off: 'off' };
          widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, userValues: userValues, hasAnOffValue: true });
          widget.getConfiguration();

          // When
          toggleOn();

          // Then
          (0, _expect2.default)(helper.removeDisjunctiveFacetRefinement.calledWith(attributeName, 'off')).toBe(true);
          (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, 'on')).toBe(true);
        });
        it('toggle off should change the refined value', function () {
          // Given
          userValues = { on: 'on', off: 'off' };
          widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, userValues: userValues, hasAnOffValue: true });
          widget.getConfiguration();

          // When
          toggleOff();

          // Then
          (0, _expect2.default)(helper.removeDisjunctiveFacetRefinement.calledWith(attributeName, 'on')).toBe(true);
          (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, 'off')).toBe(true);
        });
      });
    });

    context('custom off value', function () {
      it('should add a refinement for custom off value on init', function () {
        // Given
        userValues = { on: 'on', off: 'off' };
        widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, hasAnOffValue: true, userValues: userValues });
        widget.getConfiguration();
        var state = {
          isDisjunctiveFacetRefined: _sinon2.default.stub().returns(false)
        };
        var helper = {
          addDisjunctiveFacetRefinement: _sinon2.default.spy()
        };

        // When
        widget.init({ state: state, helper: helper });

        // Then
        (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.calledWith(attributeName, 'off')).toBe(true);
      });
      it('should not add a refinement for custom off value on init if already checked', function () {
        // Given
        userValues = { on: 'on', off: 'off' };
        widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, userValues: userValues, hasAnOffValue: true });
        widget.getConfiguration();
        var state = {
          isDisjunctiveFacetRefined: _sinon2.default.stub().returns(true)
        };
        var helper = {
          addDisjunctiveFacetRefinement: _sinon2.default.spy()
        };

        // When
        widget.init({ state: state, helper: helper });

        // Then
        (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.called).toBe(false);
      });
      it('should not add a refinement for no custom off value on init', function () {
        // Given
        widget = (0, _currentToggle2.default)({ containerNode: containerNode, attributeName: attributeName, label: label, hasAnOffValue: false, userValues: userValues });
        widget.getConfiguration();
        var state = {};
        var helper = {
          addDisjunctiveFacetRefinement: _sinon2.default.spy()
        };

        // When
        widget.init({ state: state, helper: helper });

        // Then
        (0, _expect2.default)(helper.addDisjunctiveFacetRefinement.called).toBe(false);
      });
    });

    afterEach(function () {
      _currentToggle2.default.__ResetDependency__('ReactDOM');
    });
  });
});