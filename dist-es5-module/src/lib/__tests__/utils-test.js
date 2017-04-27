'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('utils.getContainerNode', function () {
  it('should be able to get a node from a node', function () {
    var d = document.body;
    (0, _expect2.default)(utils.getContainerNode(d)).toEqual(d);
  });

  it('should be able to retrieve an element from a css selector', function () {
    var d = document.createElement('div');
    d.className = 'test';
    document.body.appendChild(d);

    (0, _expect2.default)(utils.getContainerNode('.test')).toEqual(d);
  });

  it('should throw for other types of object', function () {
    (0, _expect2.default)(utils.getContainerNode.bind(utils, undefined)).toThrow(Error);
    (0, _expect2.default)(utils.getContainerNode.bind(utils, null)).toThrow(Error);
    (0, _expect2.default)(utils.getContainerNode.bind(utils, {})).toThrow(Error);
    (0, _expect2.default)(utils.getContainerNode.bind(utils, 42)).toThrow(Error);
    (0, _expect2.default)(utils.getContainerNode.bind(utils, [])).toThrow(Error);
  });

  it('should throw when not a correct selector', function () {
    (0, _expect2.default)(utils.getContainerNode.bind(utils, '.not-in-dom')).toThrow(Error);
  });
});

describe('utils.isDomElement', function () {
  it('should return true for dom element', function () {
    (0, _expect2.default)(utils.isDomElement(document.body)).toBe(true);
  });

  it('should return false for dom element', function () {
    (0, _expect2.default)(utils.isDomElement()).toBe(false);
    (0, _expect2.default)(utils.isDomElement(undefined)).toBe(false);
    (0, _expect2.default)(utils.isDomElement(null)).toBe(false);
    (0, _expect2.default)(utils.isDomElement([])).toBe(false);
    (0, _expect2.default)(utils.isDomElement({})).toBe(false);
    (0, _expect2.default)(utils.isDomElement('')).toBe(false);
    (0, _expect2.default)(utils.isDomElement(42)).toBe(false);
  });
});

describe('utils.bemHelper', function () {
  it('should return a function', function () {
    (0, _expect2.default)(utils.bemHelper('block')).toBeA('function');
  });

  context('returned function', function () {
    var returnedFunction = utils.bemHelper('block');

    it('should create a block class when invoked without parameters', function () {
      var className = returnedFunction();
      (0, _expect2.default)(className).toBe('block');
    });

    it('should create a block with element class when invoked with one parameter', function () {
      var className = returnedFunction('element');
      (0, _expect2.default)(className).toBe('block--element');
    });

    it('should create a block with element and modifier class when invoked with 2 parameters', function () {
      var className = returnedFunction('element', 'modifier');
      (0, _expect2.default)(className).toBe('block--element__modifier');
    });

    it('should create a block with a modifier class when invoked with null for element', function () {
      var className = returnedFunction(null, 'modifier');
      (0, _expect2.default)(className).toBe('block__modifier');
    });
  });
});

describe('utils.prepareTemplateProps', function () {
  var defaultTemplates = {
    foo: 'toto',
    bar: 'tata'
  };
  var templatesConfig = [];
  var transformData = function transformData() {}; // eslint-disable-line func-style

  it('should return the default templates and set useCustomCompileOptions to false when using the defaults', function () {
    var defaultsPrepared = utils.prepareTemplateProps({
      transformData: transformData,
      defaultTemplates: defaultTemplates,
      undefined: undefined,
      templatesConfig: templatesConfig
    });

    (0, _expect2.default)(defaultsPrepared.transformData).toBe(transformData);
    (0, _expect2.default)(defaultsPrepared.useCustomCompileOptions).toEqual({ foo: false, bar: false });
    (0, _expect2.default)(defaultsPrepared.templates).toEqual(defaultTemplates);
    (0, _expect2.default)(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should return the missing default templates and set useCustomCompileOptions for the custom template', function () {
    var templates = { foo: 'baz' };
    var defaultsPrepared = utils.prepareTemplateProps({
      transformData: transformData,
      defaultTemplates: defaultTemplates,
      templates: templates,
      templatesConfig: templatesConfig
    });

    (0, _expect2.default)(defaultsPrepared.transformData).toBe(transformData);
    (0, _expect2.default)(defaultsPrepared.useCustomCompileOptions).toEqual({ foo: true, bar: false });
    (0, _expect2.default)(defaultsPrepared.templates).toEqual(_extends({}, defaultTemplates, templates));
    (0, _expect2.default)(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should add also the templates that are not in the defaults', function () {
    var templates = {
      foo: 'something else',
      baz: 'Of course!'
    };

    var preparedProps = utils.prepareTemplateProps({
      transformData: transformData,
      defaultTemplates: defaultTemplates,
      templates: templates,
      templatesConfig: templatesConfig
    });

    (0, _expect2.default)(preparedProps.transformData).toBe(transformData);
    (0, _expect2.default)(preparedProps.useCustomCompileOptions).toEqual({ foo: true, bar: false, baz: true });
    (0, _expect2.default)(preparedProps.templates).toEqual(_extends({}, defaultTemplates, templates));
    (0, _expect2.default)(preparedProps.templatesConfig).toBe(templatesConfig);
  });
});

describe('utils.getRefinements', function () {
  var helper = void 0;
  var results = void 0;

  beforeEach(function () {
    helper = (0, _algoliasearchHelper2.default)({}, 'my_index', {
      facets: ['facet1', 'facet2', 'numericFacet1'],
      disjunctiveFacets: ['disjunctiveFacet1', 'disjunctiveFacet2', 'numericDisjunctiveFacet'],
      hierarchicalFacets: [{
        name: 'hierarchicalFacet1',
        attributes: ['hierarchicalFacet1.lvl0', 'hierarchicalFacet1.lvl1'],
        separator: ' > '
      }, {
        name: 'hierarchicalFacet2',
        attributes: ['hierarchicalFacet2.lvl0', 'hierarchicalFacet2.lvl1'],
        separator: ' > '
      }]
    });
    results = {};
  });

  it('should retrieve one tag', function () {
    helper.addTag('tag1');
    var expected = [{ type: 'tag', attributeName: '_tags', name: 'tag1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple tags', function () {
    helper.addTag('tag1').addTag('tag2');
    var expected = [{ type: 'tag', attributeName: '_tags', name: 'tag1' }, { type: 'tag', attributeName: '_tags', name: 'tag2' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve one facetRefinement', function () {
    helper.toggleRefinement('facet1', 'facet1val1');
    var expected = [{ type: 'facet', attributeName: 'facet1', name: 'facet1val1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple facetsRefinements on one facet', function () {
    helper.toggleRefinement('facet1', 'facet1val1').toggleRefinement('facet1', 'facet1val2');
    var expected = [{ type: 'facet', attributeName: 'facet1', name: 'facet1val1' }, { type: 'facet', attributeName: 'facet1', name: 'facet1val2' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple facetsRefinements on multiple facets', function () {
    helper.toggleRefinement('facet1', 'facet1val1').toggleRefinement('facet1', 'facet1val2').toggleRefinement('facet2', 'facet2val1');
    var expected = [{ type: 'facet', attributeName: 'facet1', name: 'facet1val1' }, { type: 'facet', attributeName: 'facet1', name: 'facet1val2' }, { type: 'facet', attributeName: 'facet2', name: 'facet2val1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
  });

  it('should have a count for a facetRefinement if available', function () {
    helper.toggleRefinement('facet1', 'facet1val1');
    results = {
      facets: [{
        name: 'facet1',
        data: {
          facet1val1: 4
        }
      }]
    };
    var expected = [{ type: 'facet', attributeName: 'facet1', name: 'facet1val1', count: 4 }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should have exhaustive for a facetRefinement if available', function () {
    helper.toggleRefinement('facet1', 'facet1val1');
    results = {
      facets: [{
        name: 'facet1',
        exhaustive: true
      }]
    };
    var expected = [{ type: 'facet', attributeName: 'facet1', name: 'facet1val1', exhaustive: true }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve one facetExclude', function () {
    helper.toggleExclude('facet1', 'facet1exclude1');
    var expected = [{ type: 'exclude', attributeName: 'facet1', name: 'facet1exclude1', exclude: true }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple facetsExcludes on one facet', function () {
    helper.toggleExclude('facet1', 'facet1exclude1').toggleExclude('facet1', 'facet1exclude2');
    var expected = [{ type: 'exclude', attributeName: 'facet1', name: 'facet1exclude1', exclude: true }, { type: 'exclude', attributeName: 'facet1', name: 'facet1exclude2', exclude: true }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple facetsExcludes on multiple facets', function () {
    helper.toggleExclude('facet1', 'facet1exclude1').toggleExclude('facet1', 'facet1exclude2').toggleExclude('facet2', 'facet2exclude1');
    var expected = [{ type: 'exclude', attributeName: 'facet1', name: 'facet1exclude1', exclude: true }, { type: 'exclude', attributeName: 'facet1', name: 'facet1exclude2', exclude: true }, { type: 'exclude', attributeName: 'facet2', name: 'facet2exclude1', exclude: true }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
  });

  it('should retrieve one disjunctiveFacetRefinement', function () {
    helper.addDisjunctiveFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    var expected = [{ type: 'disjunctive', attributeName: 'disjunctiveFacet1', name: 'disjunctiveFacet1val1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on one facet', function () {
    helper.addDisjunctiveFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1').addDisjunctiveFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val2');
    var expected = [{ type: 'disjunctive', attributeName: 'disjunctiveFacet1', name: 'disjunctiveFacet1val1' }, { type: 'disjunctive', attributeName: 'disjunctiveFacet1', name: 'disjunctiveFacet1val2' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on multiple facets', function () {
    helper.toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1').toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val2').toggleRefinement('disjunctiveFacet2', 'disjunctiveFacet2val1');
    var expected = [{ type: 'disjunctive', attributeName: 'disjunctiveFacet1', name: 'disjunctiveFacet1val1' }, { type: 'disjunctive', attributeName: 'disjunctiveFacet1', name: 'disjunctiveFacet1val2' }, { type: 'disjunctive', attributeName: 'disjunctiveFacet2', name: 'disjunctiveFacet2val1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
  });

  it('should have a count for a disjunctiveFacetRefinement if available', function () {
    helper.toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [{
        name: 'disjunctiveFacet1',
        data: {
          disjunctiveFacet1val1: 4
        }
      }]
    };
    var expected = [{ type: 'disjunctive', attributeName: 'disjunctiveFacet1', name: 'disjunctiveFacet1val1', count: 4 }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should have exhaustive for a disjunctiveFacetRefinement if available', function () {
    helper.toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [{
        name: 'disjunctiveFacet1',
        exhaustive: true
      }]
    };
    var expected = [{ type: 'disjunctive', attributeName: 'disjunctiveFacet1', name: 'disjunctiveFacet1val1', exhaustive: true }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve one hierarchicalFacetRefinement', function () {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1');
    var expected = [{ type: 'hierarchical', attributeName: 'hierarchicalFacet1', name: 'hierarchicalFacet1lvl0val1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple facets', function () {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1').toggleRefinement('hierarchicalFacet2', 'hierarchicalFacet2lvl0val1');
    var expected = [{ type: 'hierarchical', attributeName: 'hierarchicalFacet1', name: 'hierarchicalFacet1lvl0val1' }, { type: 'hierarchical', attributeName: 'hierarchicalFacet2', name: 'hierarchicalFacet2lvl0val1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple facets and multiple levels', function () {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1').toggleRefinement('hierarchicalFacet2', 'hierarchicalFacet2lvl0val1 > lvl1val1');
    var expected = [{ type: 'hierarchical', attributeName: 'hierarchicalFacet1', name: 'hierarchicalFacet1lvl0val1' }, { type: 'hierarchical', attributeName: 'hierarchicalFacet2', name: 'lvl1val1' }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should have a count for a hierarchicalFacetRefinement if available', function () {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1val1');
    results = {
      hierarchicalFacets: [{
        name: 'hierarchicalFacet1',
        data: {
          hierarchicalFacet1val1: { name: 'hierarchicalFacet1val1', count: 4 }
        }
      }]
    };
    var expected = [{ type: 'hierarchical', attributeName: 'hierarchicalFacet1', name: 'hierarchicalFacet1val1', count: 4 }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should have exhaustive for a hierarchicalFacetRefinement if available', function () {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1val1');
    results = {
      hierarchicalFacets: [{
        name: 'hierarchicalFacet1',
        data: [{ name: 'hierarchicalFacet1val1', exhaustive: true }]
      }]
    };
    var expected = [{ type: 'hierarchical', attributeName: 'hierarchicalFacet1', name: 'hierarchicalFacet1val1', exhaustive: true }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve a numericRefinement on one facet', function () {
    helper.addNumericRefinement('numericFacet1', '>', '1');
    var expected = [{ type: 'numeric', attributeName: 'numericFacet1', operator: '>', name: '1', numericValue: 1 }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve a numericRefinement on one disjunctive facet', function () {
    helper.addNumericRefinement('numericDisjunctiveFacet1', '>', '1');
    var expected = [{ type: 'numeric', attributeName: 'numericDisjunctiveFacet1', operator: '>', name: '1', numericValue: 1 }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple numericRefinements with same operator', function () {
    helper.addNumericRefinement('numericFacet1', '>', '1').addNumericRefinement('numericFacet1', '>', '2');
    var expected = [{ type: 'numeric', attributeName: 'numericFacet1', operator: '>', name: '1', numericValue: 1 }, { type: 'numeric', attributeName: 'numericFacet1', operator: '>', name: '2', numericValue: 2 }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple conjunctive and numericRefinements', function () {
    helper.addNumericRefinement('numericFacet1', '>', '1').addNumericRefinement('numericFacet1', '>', '2').addNumericRefinement('numericFacet1', '<=', '3').addNumericRefinement('numericDisjunctiveFacet1', '>', '1').addNumericRefinement('numericDisjunctiveFacet1', '>', '2');
    var expected = [{ type: 'numeric', attributeName: 'numericFacet1', operator: '>', name: '1', numericValue: 1 }, { type: 'numeric', attributeName: 'numericFacet1', operator: '>', name: '2', numericValue: 2 }, { type: 'numeric', attributeName: 'numericFacet1', operator: '<=', name: '3', numericValue: 3 }, { type: 'numeric', attributeName: 'numericDisjunctiveFacet1', operator: '>', name: '1', numericValue: 1 }, { type: 'numeric', attributeName: 'numericDisjunctiveFacet1', operator: '>', name: '2', numericValue: 2 }];
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[3]);
    (0, _expect2.default)(utils.getRefinements(results, helper.state)).toInclude(expected[4]);
  });
});

describe('utils.clearRefinementsFromState', function () {
  var helper = void 0;
  var state = void 0;

  beforeEach(function () {
    helper = (0, _algoliasearchHelper2.default)({}, 'my_index', {
      facets: ['facet1', 'facet2', 'numericFacet1', 'facetExclude1'],
      disjunctiveFacets: ['disjunctiveFacet1', 'numericDisjunctiveFacet'],
      hierarchicalFacets: [{
        name: 'hierarchicalFacet1',
        attributes: ['hierarchicalFacet1.lvl0', 'hierarchicalFacet1.lvl1'],
        separator: ' > '
      }]
    });
    helper.toggleRefinement('facet1', 'facet1val1').toggleRefinement('facet1', 'facet1val2').toggleRefinement('facet2', 'facet2val1').toggleRefinement('facet2', 'facet2val2').toggleRefinement('disjunctiveFacet1', 'facet1val1').toggleRefinement('disjunctiveFacet1', 'facet1val2').toggleExclude('facetExclude1', 'facetExclude1val1').toggleExclude('facetExclude1', 'facetExclude1val2').addNumericRefinement('numericFacet1', '>', '1').addNumericRefinement('numericFacet1', '>', '2').addNumericRefinement('numericDisjunctiveFacet1', '>', '1').addNumericRefinement('numericDisjunctiveFacet1', '>', '2').toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1').addTag('tag1').addTag('tag2');
    state = helper.state;
  });

  context('without arguments', function () {
    it('should clear everything', function () {
      var newState = utils.clearRefinementsFromState(state);
      (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(true, 'state shouldn\'t have facetsRefinements');
      (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(true, 'state shouldn\'t have facetsExcludes');
      (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(true, 'state shouldn\'t have disjunctiveFacetsRefinements');
      (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(true, 'state shouldn\'t have hierarchicalFacetsRefinements');
      (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(true, 'state shouldn\'t have numericRefinements');
      (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(true, 'state shouldn\'t have tagRefinements');
    });
  });

  it('should clear one facet', function () {
    var newState = utils.clearRefinementsFromState(state, ['facet1']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear facets', function () {
    var newState = utils.clearRefinementsFromState(state, ['facet1', 'facet2']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(true, 'state shouldn\'t have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear excludes', function () {
    var newState = utils.clearRefinementsFromState(state, ['facetExclude1']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(true, 'state shouldn\'t have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear disjunctive facets', function () {
    var newState = utils.clearRefinementsFromState(state, ['disjunctiveFacet1']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(true, 'state shouldn\'t have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear hierarchical facets', function () {
    var newState = utils.clearRefinementsFromState(state, ['hierarchicalFacet1']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(true, 'state shouldn\'t have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear one numeric facet', function () {
    var newState = utils.clearRefinementsFromState(state, ['numericFacet1']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear one numeric facet', function () {
    var newState = utils.clearRefinementsFromState(state, ['numericDisjunctiveFacet1']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear numeric facets', function () {
    var newState = utils.clearRefinementsFromState(state, ['numericFacet1', 'numericDisjunctiveFacet1']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(true, 'state shouldn\'t have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(false, 'state should have tagRefinements');
  });

  it('should clear tags', function () {
    var newState = utils.clearRefinementsFromState(state, ['_tags']);
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsRefinements)).toBe(false, 'state should have facetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.facetsExcludes)).toBe(false, 'state should have facetsExcludes');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.disjunctiveFacetsRefinements)).toBe(false, 'state should have disjunctiveFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.hierarchicalFacetsRefinements)).toBe(false, 'state should have hierarchicalFacetsRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.numericRefinements)).toBe(false, 'state should have numericRefinements');
    (0, _expect2.default)((0, _isEmpty2.default)(newState.tagRefinements)).toBe(true, 'state shouldn\'t have tagRefinements');
  });
});