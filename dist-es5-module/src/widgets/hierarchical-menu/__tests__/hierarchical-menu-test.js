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

var _hierarchicalMenu = require('../hierarchical-menu');

var _hierarchicalMenu2 = _interopRequireDefault(_hierarchicalMenu);

var _RefinementList = require('../../../components/RefinementList/RefinementList');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);


describe('hierarchicalMenu()', function () {
  var autoHideContainer = void 0;
  var container = void 0;
  var attributes = void 0;
  var headerFooter = void 0;
  var options = void 0;
  var widget = void 0;
  var ReactDOM = void 0;

  beforeEach(function () {
    container = document.createElement('div');
    attributes = ['hello', 'world'];
    options = {};
    ReactDOM = { render: _sinon2.default.spy() };
    _hierarchicalMenu2.default.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = _sinon2.default.stub().returnsArg(0);
    _hierarchicalMenu2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = _sinon2.default.stub().returnsArg(0);
    _hierarchicalMenu2.default.__Rewire__('headerFooterHOC', headerFooter);
  });

  context('instantiated with wrong parameters', function () {
    it('should fail if no attributes', function () {
      options = { container: container, attributes: undefined };
      (0, _expect2.default)(function () {
        return (0, _hierarchicalMenu2.default)(options);
      }).toThrow(/^Usage:/);
    });

    it('should fail if attributes empty', function () {
      options = { container: container, attributes: [] };
      (0, _expect2.default)(function () {
        return (0, _hierarchicalMenu2.default)(options);
      }).toThrow(/^Usage:/);
    });

    it('should fail if no container', function () {
      options = { container: undefined, attributes: attributes };
      (0, _expect2.default)(function () {
        return (0, _hierarchicalMenu2.default)(options);
      }).toThrow(/^Usage:/);
    });
  });

  context('autoHideContainer', function () {
    beforeEach(function () {
      options = { container: container, attributes: attributes };
    });

    it('should be called if autoHideContainer set to true', function () {
      (0, _hierarchicalMenu2.default)(_extends({}, options, { autoHideContainer: true }));
      (0, _expect2.default)(autoHideContainer.calledOnce).toBe(true);
    });

    it('should not be called if autoHideContainer set to false', function () {
      (0, _hierarchicalMenu2.default)({ container: container, attributes: attributes, autoHideContainer: false });
      (0, _expect2.default)(autoHideContainer.called).toBe(false);
    });
  });

  it('uses headerFooter', function () {
    options = { container: container, attributes: attributes };
    (0, _hierarchicalMenu2.default)(options);
    (0, _expect2.default)(headerFooter.calledOnce).toBe(true);
  });

  context('getConfiguration', function () {
    beforeEach(function () {
      options = { container: container, attributes: attributes };
    });

    it('has defaults', function () {
      (0, _expect2.default)((0, _hierarchicalMenu2.default)(options).getConfiguration({})).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: true
        }],
        maxValuesPerFacet: 10
      });
    });

    it('understand the separator option', function () {
      (0, _expect2.default)((0, _hierarchicalMenu2.default)(_extends({ separator: ' ? ' }, options)).getConfiguration({})).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' ? ',
          showParentLevel: true
        }],
        maxValuesPerFacet: 10
      });
    });

    it('understand the showParentLevel option', function () {
      (0, _expect2.default)((0, _hierarchicalMenu2.default)(_extends({ showParentLevel: false }, options)).getConfiguration({})).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: null,
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: false
        }],
        maxValuesPerFacet: 10
      });
    });

    it('understand the rootPath option', function () {
      (0, _expect2.default)((0, _hierarchicalMenu2.default)(_extends({ rootPath: 'Beer' }, options)).getConfiguration({})).toEqual({
        hierarchicalFacets: [{
          name: 'hello',
          rootPath: 'Beer',
          attributes: ['hello', 'world'],
          separator: ' > ',
          showParentLevel: true
        }],
        maxValuesPerFacet: 10
      });
    });

    context('limit option', function () {
      it('configures maxValuesPerFacet', function () {
        return (0, _expect2.default)((0, _hierarchicalMenu2.default)(_extends({ limit: 20 }, options)).getConfiguration({}).maxValuesPerFacet).toBe(20);
      });

      it('uses provided maxValuesPerFacet when higher', function () {
        return (0, _expect2.default)((0, _hierarchicalMenu2.default)(_extends({ limit: 20 }, options)).getConfiguration({ maxValuesPerFacet: 30 }).maxValuesPerFacet).toBe(30);
      });

      it('ignores provided maxValuesPerFacet when lower', function () {
        return (0, _expect2.default)((0, _hierarchicalMenu2.default)(_extends({ limit: 10 }, options)).getConfiguration({ maxValuesPerFacet: 3 }).maxValuesPerFacet).toBe(10);
      });
    });
  });

  context('render', function () {
    var results = void 0;
    var data = void 0;
    var cssClasses = void 0;
    var defaultTemplates = {
      header: 'header',
      item: 'item',
      footer: 'footer'
    };
    var templateProps = void 0;
    var helper = void 0;
    var state = void 0;
    var createURL = void 0;

    beforeEach(function () {
      _hierarchicalMenu2.default.__Rewire__('defaultTemplates', defaultTemplates);
      templateProps = {
        transformData: undefined,
        templatesConfig: undefined,
        templates: defaultTemplates,
        useCustomCompileOptions: { header: false, item: false, footer: false }
      };
      cssClasses = {
        active: 'ais-hierarchical-menu--item__active',
        body: 'ais-hierarchical-menu--body',
        count: 'ais-hierarchical-menu--count',
        depth: 'ais-hierarchical-menu--list__lvl',
        footer: 'ais-hierarchical-menu--footer',
        header: 'ais-hierarchical-menu--header',
        item: 'ais-hierarchical-menu--item',
        link: 'ais-hierarchical-menu--link',
        list: 'ais-hierarchical-menu--list',
        root: 'ais-hierarchical-menu'
      };
      data = { data: [{ name: 'foo' }, { name: 'bar' }] };
      results = { getFacetValues: _sinon2.default.spy(function () {
          return data;
        }) };
      helper = {
        toggleRefinement: _sinon2.default.stub().returnsThis(),
        search: _sinon2.default.spy()
      };
      state = {
        toggleRefinement: _sinon2.default.spy()
      };
      options = { container: container, attributes: attributes };
      createURL = function createURL() {
        return '#';
      };
    });

    it('understand provided cssClasses', function () {
      var userCssClasses = {
        root: ['root', 'cx'],
        header: 'header',
        body: 'body',
        footer: 'footer',
        list: 'list',
        item: 'item',
        active: 'active',
        link: 'link',
        count: 'count'
      };

      widget = (0, _hierarchicalMenu2.default)(_extends({}, options, { cssClasses: userCssClasses }));
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      var actual = ReactDOM.render.firstCall.args[0].props.cssClasses;
      (0, _expect2.default)(actual).toEqual({
        root: 'ais-hierarchical-menu root cx',
        header: 'ais-hierarchical-menu--header header',
        body: 'ais-hierarchical-menu--body body',
        footer: 'ais-hierarchical-menu--footer footer',
        list: 'ais-hierarchical-menu--list list',
        depth: 'ais-hierarchical-menu--list__lvl',
        item: 'ais-hierarchical-menu--item item',
        active: 'ais-hierarchical-menu--item__active active',
        link: 'ais-hierarchical-menu--link link',
        count: 'ais-hierarchical-menu--count count'
      });
    });

    it('calls ReactDOM.render', function () {
      widget = (0, _hierarchicalMenu2.default)(options);
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      (0, _expect2.default)(ReactDOM.render.calledOnce).toBe(true);
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0]).toEqualJSX(_react2.default.createElement(_RefinementList2.default, {
        attributeNameKey: 'path',
        collapsible: false,
        createURL: function createURL() {},
        cssClasses: cssClasses,
        facetValues: [{ name: 'foo' }, { name: 'bar' }],
        shouldAutoHideContainer: false,
        templateProps: templateProps,
        toggleRefinement: function toggleRefinement() {}
      }));
    });

    it('asks for results.getFacetValues', function () {
      widget = (0, _hierarchicalMenu2.default)(options);
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      (0, _expect2.default)(results.getFacetValues.calledOnce).toBe(true);
      (0, _expect2.default)(results.getFacetValues.getCall(0).args).toEqual(['hello', {
        sortBy: ['name:asc']
      }]);
    });

    it('has a sortBy option', function () {
      widget = (0, _hierarchicalMenu2.default)(_extends({}, options, { sortBy: ['count:asc'] }));
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      (0, _expect2.default)(results.getFacetValues.calledOnce).toBe(true);
      (0, _expect2.default)(results.getFacetValues.getCall(0).args).toEqual(['hello', {
        sortBy: ['count:asc']
      }]);
    });

    it('has a templates option', function () {
      widget = (0, _hierarchicalMenu2.default)(_extends({}, options, { templates: {
          header: 'header2',
          item: 'item2',
          footer: 'footer2'
        } }));
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0].props.templateProps.templates).toEqual({
        header: 'header2',
        item: 'item2',
        footer: 'footer2'
      });
    });

    it('sets shouldAutoHideContainer to true when no results', function () {
      data = {};
      widget = (0, _hierarchicalMenu2.default)(options);
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer).toBe(true);
    });

    it('sets facetValues to empty array when no results', function () {
      data = {};
      widget = (0, _hierarchicalMenu2.default)(options);
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      (0, _expect2.default)(ReactDOM.render.firstCall.args[0].props.facetValues).toEqual([]);
    });

    it('has a toggleRefinement method', function () {
      widget = (0, _hierarchicalMenu2.default)(options);
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      var elementToggleRefinement = ReactDOM.render.firstCall.args[0].props.toggleRefinement;
      elementToggleRefinement('mom');
      (0, _expect2.default)(helper.toggleRefinement.calledOnce).toBe(true);
      (0, _expect2.default)(helper.toggleRefinement.getCall(0).args).toEqual(['hello', 'mom']);
      (0, _expect2.default)(helper.search.calledOnce).toBe(true);
      (0, _expect2.default)(helper.toggleRefinement.calledBefore(helper.search)).toBe(true);
    });

    it('has a limit option', function () {
      var secondLevel = [{ name: 'six' }, { name: 'seven' }, { name: 'eight' }, { name: 'nine' }];

      var firstLevel = [{ name: 'one' }, { name: 'two', data: secondLevel }, { name: 'three' }, { name: 'four' }, { name: 'five' }];

      data = { data: firstLevel };
      var expectedFacetValues = [{ name: 'one' }, { name: 'two', data: [{ name: 'six' }, { name: 'seven' }, { name: 'eight' }] }, { name: 'three' }];
      widget = (0, _hierarchicalMenu2.default)(_extends({}, options, { limit: 3 }));
      widget.init({ helper: helper, createURL: createURL });
      widget.render({ results: results, state: state });
      var actualFacetValues = ReactDOM.render.firstCall.args[0].props.facetValues;
      (0, _expect2.default)(actualFacetValues).toEqual(expectedFacetValues);
    });

    afterEach(function () {
      _hierarchicalMenu2.default.__ResetDependency__('defaultTemplates');
    });
  });

  afterEach(function () {
    _hierarchicalMenu2.default.__ResetDependency__('ReactDOM');
    _hierarchicalMenu2.default.__ResetDependency__('autoHideContainerHOC');
    _hierarchicalMenu2.default.__ResetDependency__('headerFooterHOC');
  });
});