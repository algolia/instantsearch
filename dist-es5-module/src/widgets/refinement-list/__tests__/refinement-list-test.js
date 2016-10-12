'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

var _refinementList = require('../refinement-list.js');

var _refinementList2 = _interopRequireDefault(_refinementList);

var _Template = require('../../../components/Template.js');

var _Template2 = _interopRequireDefault(_Template);

var _createHelpers = require('../../../lib/createHelpers.js');

var _createHelpers2 = _interopRequireDefault(_createHelpers);

var _defaultTemplates = require('../defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('refinementList()', function () {
  var autoHideContainer = void 0;
  var container = void 0;
  var headerFooter = void 0;
  var options = void 0;
  var widget = void 0;
  var ReactDOM = void 0;
  var renderer = (0, _reactAddonsTestUtils.createRenderer)();
  var helpers = (0, _createHelpers2.default)('en-US');

  beforeEach(function () {
    container = document.createElement('div');

    ReactDOM = { render: _sinon2.default.spy() };
    _refinementList2.default.__Rewire__('ReactDOM', ReactDOM);
    autoHideContainer = _sinon2.default.stub().returnsArg(0);
    _refinementList2.default.__Rewire__('autoHideContainerHOC', autoHideContainer);
    headerFooter = _sinon2.default.stub().returnsArg(0);
    _refinementList2.default.__Rewire__('headerFooterHOC', headerFooter);
  });

  context('instantiated with wrong parameters', function () {
    it('should fail if no attributeName', function () {
      // Given
      options = { container: container, attributeName: undefined };

      // Then
      (0, _expect2.default)(function () {
        // When
        (0, _refinementList2.default)(options);
      }).toThrow(/^Usage:/);
    });
    it('should fail if no container', function () {
      // Given
      options = { container: undefined, attributeName: 'foo' };

      // Then
      (0, _expect2.default)(function () {
        // When
        (0, _refinementList2.default)(options);
      }).toThrow(/^Usage:/);
    });
  });

  context('autoHideContainer', function () {
    beforeEach(function () {
      options = { container: container, attributeName: 'attributeName' };
    });
    it('should be called if autoHideContainer set to true', function () {
      // Given
      options.autoHideContainer = true;

      // When
      (0, _refinementList2.default)(options);

      // Then
      (0, _expect2.default)(autoHideContainer.called).toBe(true);
    });
    it('should not be called if autoHideContainer set to false', function () {
      // Given
      options.autoHideContainer = false;

      // When
      (0, _refinementList2.default)(options);

      // Then
      (0, _expect2.default)(autoHideContainer.called).toBe(false);
    });
  });

  context('operator', function () {
    beforeEach(function () {
      options = { container: container, attributeName: 'attributeName' };
    });
    it('should accept [and, or, AND, OR]', function () {
      (0, _expect2.default)(function () {
        (0, _refinementList2.default)(_extends({}, options, { operator: 'or' }));
      }).toNotThrow();

      (0, _expect2.default)(function () {
        (0, _refinementList2.default)(_extends({}, options, { operator: 'OR' }));
      }).toNotThrow();

      (0, _expect2.default)(function () {
        (0, _refinementList2.default)(_extends({}, options, { operator: 'and' }));
      }).toNotThrow();

      (0, _expect2.default)(function () {
        (0, _refinementList2.default)(_extends({}, options, { operator: 'AND' }));
      }).toNotThrow();
    });
    it('should throw an error on any other value', function () {
      (0, _expect2.default)(function () {
        (0, _refinementList2.default)(_extends({}, options, { operator: 'foo' }));
      }).toThrow(/^Usage:/);
    });
  });

  context('getConfiguration', function () {
    var configuration = void 0;
    beforeEach(function () {
      options = { container: container, attributeName: 'attributeName' };
    });
    it('should add a facet for AND operator', function () {
      // Given
      options.operator = 'AND';
      widget = (0, _refinementList2.default)(options);
      configuration = {};

      // When
      var actual = widget.getConfiguration(configuration);

      // Then
      (0, _expect2.default)(actual.facets).toInclude('attributeName');
    });
    it('should add disjunctiveFacet for OR operator', function () {
      // Given
      options.operator = 'OR';
      widget = (0, _refinementList2.default)(options);
      configuration = {};

      // When
      var actual = widget.getConfiguration(configuration);

      // Then
      (0, _expect2.default)(actual.disjunctiveFacets).toInclude('attributeName');
    });
    it('should set the maxValuePerFacet to the specified limit if higher', function () {
      // Given
      options.limit = 1000;
      widget = (0, _refinementList2.default)(options);
      configuration = { maxValuesPerFacet: 100 };

      // When
      var actual = widget.getConfiguration(configuration);

      // Then
      (0, _expect2.default)(actual.maxValuesPerFacet).toBe(1000);
    });
    it('should keep the maxValuePerFacet if higher than the one specified', function () {
      // Given
      options.limit = 100;
      widget = (0, _refinementList2.default)(options);
      configuration = { maxValuesPerFacet: 1000 };

      // When
      var actual = widget.getConfiguration(configuration);

      // Then
      (0, _expect2.default)(actual.maxValuesPerFacet).toBe(1000);
    });
  });

  context('render', function () {
    var results = void 0;
    var helper = void 0;
    var state = void 0;
    var templatesConfig = void 0;
    var createURL = void 0;

    function renderWidget(userOptions) {
      widget = (0, _refinementList2.default)(_extends({}, options, userOptions));
      widget.init({ helper: helper, createURL: createURL });
      return widget.render({ results: results, helper: helper, templatesConfig: templatesConfig, state: state });
    }

    beforeEach(function () {
      options = { container: container, attributeName: 'attributeName' };
      results = { getFacetValues: _sinon2.default.stub().returns([{ name: 'foo' }, { name: 'bar' }]) };
      state = { toggleRefinement: _sinon2.default.spy() };
      createURL = function createURL() {
        return '#';
      };
    });

    it('formats counts', function () {
      var props = {
        templatesConfig: { helpers: helpers },
        templates: _defaultTemplates2.default
      };
      renderer.render(_react2.default.createElement(_Template2.default, _extends({ data: { count: 1000 } }, props, { templateKey: 'item' })));
      var out = renderer.getRenderOutput();
      // eslint-disable-next-line max-len
      (0, _expect2.default)(out).toEqualJSX(_react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: '<label class="">\n <input type="checkbox" class="" value="" />\n <span class="">1,000</span>\n</label>' } }));
    });

    context('cssClasses', function () {
      it('should call the component with the correct classes', function () {
        // Given
        var cssClasses = {
          root: ['root', 'cx'],
          header: 'header',
          body: 'body',
          footer: 'footer',
          list: 'list',
          item: 'item',
          active: 'active',
          label: 'label',
          checkbox: 'checkbox',
          count: 'count'
        };

        // When
        renderWidget({ cssClasses: cssClasses });
        var actual = ReactDOM.render.firstCall.args[0].props.cssClasses;

        // Then
        (0, _expect2.default)(actual.root).toBe('ais-refinement-list root cx');
        (0, _expect2.default)(actual.header).toBe('ais-refinement-list--header header');
        (0, _expect2.default)(actual.body).toBe('ais-refinement-list--body body');
        (0, _expect2.default)(actual.footer).toBe('ais-refinement-list--footer footer');
        (0, _expect2.default)(actual.list).toBe('ais-refinement-list--list list');
        (0, _expect2.default)(actual.item).toBe('ais-refinement-list--item item');
        (0, _expect2.default)(actual.active).toBe('ais-refinement-list--item__active active');
        (0, _expect2.default)(actual.label).toBe('ais-refinement-list--label label');
        (0, _expect2.default)(actual.checkbox).toBe('ais-refinement-list--checkbox checkbox');
        (0, _expect2.default)(actual.count).toBe('ais-refinement-list--count count');
      });
    });

    context('autoHideContainer', function () {
      it('should set shouldAutoHideContainer to false if there are facetValues', function () {
        // Given
        results.getFacetValues = _sinon2.default.stub().returns([{ name: 'foo' }, { name: 'bar' }]);

        // When
        renderWidget();
        var actual = ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer;

        // Then
        (0, _expect2.default)(actual).toBe(false);
      });
      it('should set shouldAutoHideContainer to true if no facet values', function () {
        // Given
        results.getFacetValues = _sinon2.default.stub().returns([]);

        // When
        renderWidget();
        var actual = ReactDOM.render.firstCall.args[0].props.shouldAutoHideContainer;

        // Then
        (0, _expect2.default)(actual).toBe(true);
      });
    });

    describe('header', function () {
      it('should pass the refined count to the header data', function () {
        // Given
        var facetValues = [{
          name: 'foo',
          isRefined: true
        }, {
          name: 'bar',
          isRefined: true
        }, {
          name: 'baz',
          isRefined: false
        }];
        results.getFacetValues = _sinon2.default.stub().returns(facetValues);

        // When
        renderWidget();
        var props = ReactDOM.render.firstCall.args[0].props;

        // Then
        (0, _expect2.default)(props.headerFooterData.header.refinedFacetsCount).toEqual(2);
      });

      it('should dynamically update the header template on subsequent renders', function () {
        // Given
        var widgetOptions = { container: container, attributeName: 'type' };
        var initOptions = { helper: helper, createURL: createURL };
        var facetValues = [{
          name: 'foo',
          isRefined: true
        }, {
          name: 'bar',
          isRefined: false
        }];
        results.getFacetValues = _sinon2.default.stub().returns(facetValues);
        var renderOptions = { results: results, helper: helper, templatesConfig: templatesConfig, state: state };

        // When
        widget = (0, _refinementList2.default)(widgetOptions);
        widget.init(initOptions);
        widget.render(renderOptions);

        // Then
        var props = ReactDOM.render.firstCall.args[0].props;
        (0, _expect2.default)(props.headerFooterData.header.refinedFacetsCount).toEqual(1);

        // When... second render call
        facetValues[1].isRefined = true;
        widget.render(renderOptions);

        // Then
        props = ReactDOM.render.secondCall.args[0].props;
        (0, _expect2.default)(props.headerFooterData.header.refinedFacetsCount).toEqual(2);
      });
    });
  });

  context('toggleRefinement', function () {
    var helper = void 0;
    beforeEach(function () {
      options = { container: container, attributeName: 'attributeName' };
      helper = {
        toggleRefinement: _sinon2.default.stub().returnsThis(),
        search: _sinon2.default.spy()
      };
    });

    it('should do a refinement on the selected facet', function () {
      // Given
      widget = (0, _refinementList2.default)(options);
      widget.init({ helper: helper });

      // When
      widget.toggleRefinement(helper, 'attributeName', 'facetValue');

      // Then
      (0, _expect2.default)(helper.toggleRefinement.calledWith('attributeName', 'facetValue'));
    });
    it('should start a search on refinement', function () {
      // Given
      widget = (0, _refinementList2.default)(options);
      widget.init({ helper: helper });

      // When
      widget.toggleRefinement(helper, 'attributeName', 'facetValue');

      // Then
      (0, _expect2.default)(helper.search.called);
    });
  });

  context('show more', function () {
    it('should return a configuration with the highest limit value (default value)', function () {
      var opts = { container: container, attributeName: 'attributeName', limit: 1, showMore: {} };
      var wdgt = (0, _refinementList2.default)(opts);
      var partialConfig = wdgt.getConfiguration({});
      (0, _expect2.default)(partialConfig.maxValuesPerFacet).toBe(100);
    });

    it('should return a configuration with the highest limit value (custom value)', function () {
      var opts = { container: container, attributeName: 'attributeName', limit: 1, showMore: { limit: 99 } };
      var wdgt = (0, _refinementList2.default)(opts);
      var partialConfig = wdgt.getConfiguration({});
      (0, _expect2.default)(partialConfig.maxValuesPerFacet).toBe(opts.showMore.limit);
    });

    it('should not accept a show more limit that is < limit', function () {
      var opts = { container: container, attributeName: 'attributeName', limit: 100, showMore: { limit: 1 } };
      (0, _expect2.default)(function () {
        return (0, _refinementList2.default)(opts);
      }).toThrow();
    });
  });
});