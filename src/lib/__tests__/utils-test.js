import expect from 'expect';
import algoliasearchHelper from 'algoliasearch-helper';
import * as utils from '../utils';
import isEmpty from 'lodash/isEmpty';

describe('utils.getContainerNode', () => {
  it('should be able to get a node from a node', () => {
    const d = document.body;
    expect(utils.getContainerNode(d)).toEqual(d);
  });

  it('should be able to retrieve an element from a css selector', () => {
    const d = document.createElement('div');
    d.className = 'test';
    document.body.appendChild(d);

    expect(utils.getContainerNode('.test')).toEqual(d);
  });

  it('should throw for other types of object', () => {
    expect(utils.getContainerNode.bind(utils, undefined)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, null)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, {})).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, 42)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, [])).toThrow(Error);
  });

  it('should throw when not a correct selector', () => {
    expect(utils.getContainerNode.bind(utils, '.not-in-dom')).toThrow(Error);
  });
});

describe('utils.isDomElement', () => {
  it('should return true for dom element', () => {
    expect(utils.isDomElement(document.body)).toBe(true);
  });

  it('should return false for dom element', () => {
    expect(utils.isDomElement()).toBe(false);
    expect(utils.isDomElement(undefined)).toBe(false);
    expect(utils.isDomElement(null)).toBe(false);
    expect(utils.isDomElement([])).toBe(false);
    expect(utils.isDomElement({})).toBe(false);
    expect(utils.isDomElement('')).toBe(false);
    expect(utils.isDomElement(42)).toBe(false);
  });
});

describe('utils.bemHelper', () => {
  it('should return a function', () => {
    expect(utils.bemHelper('block')).toBeA('function');
  });

  describe('returned function', () => {
    const returnedFunction = utils.bemHelper('block');

    it('should create a block class when invoked without parameters', () => {
      const className = returnedFunction();
      expect(className).toBe('block');
    });

    it('should create a block with element class when invoked with one parameter', () => {
      const className = returnedFunction('element');
      expect(className).toBe('block--element');
    });

    it('should create a block with element and modifier class when invoked with 2 parameters', () => {
      const className = returnedFunction('element', 'modifier');
      expect(className).toBe('block--element__modifier');
    });

    it('should create a block with a modifier class when invoked with null for element', () => {
      const className = returnedFunction(null, 'modifier');
      expect(className).toBe('block__modifier');
    });
  });
});

describe('utils.prepareTemplateProps', () => {
  const defaultTemplates = {
    foo: 'toto',
    bar: 'tata',
  };
  const templatesConfig = [];
  const transformData = () => {}; // eslint-disable-line func-style

  it('should return the default templates and set useCustomCompileOptions to false when using the defaults', () => {
    const defaultsPrepared = utils.prepareTemplateProps({
      transformData,
      defaultTemplates,
      undefined,
      templatesConfig,
    });

    expect(defaultsPrepared.transformData).toBe(transformData);
    expect(defaultsPrepared.useCustomCompileOptions).toEqual({
      foo: false,
      bar: false,
    });
    expect(defaultsPrepared.templates).toEqual(defaultTemplates);
    expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should return the missing default templates and set useCustomCompileOptions for the custom template', () => {
    const templates = { foo: 'baz' };
    const defaultsPrepared = utils.prepareTemplateProps({
      transformData,
      defaultTemplates,
      templates,
      templatesConfig,
    });

    expect(defaultsPrepared.transformData).toBe(transformData);
    expect(defaultsPrepared.useCustomCompileOptions).toEqual({
      foo: true,
      bar: false,
    });
    expect(defaultsPrepared.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
    expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should add also the templates that are not in the defaults', () => {
    const templates = {
      foo: 'something else',
      baz: 'Of course!',
    };

    const preparedProps = utils.prepareTemplateProps({
      transformData,
      defaultTemplates,
      templates,
      templatesConfig,
    });

    expect(preparedProps.transformData).toBe(transformData);
    expect(preparedProps.useCustomCompileOptions).toEqual({
      foo: true,
      bar: false,
      baz: true,
    });
    expect(preparedProps.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
    expect(preparedProps.templatesConfig).toBe(templatesConfig);
  });
});

describe('utils.getRefinements', () => {
  let helper;
  let results;

  beforeEach(() => {
    helper = algoliasearchHelper({ addAlgoliaAgent: () => {} }, 'my_index', {
      facets: ['facet1', 'facet2', 'numericFacet1'],
      disjunctiveFacets: [
        'disjunctiveFacet1',
        'disjunctiveFacet2',
        'numericDisjunctiveFacet',
      ],
      hierarchicalFacets: [
        {
          name: 'hierarchicalFacet1',
          attributes: ['hierarchicalFacet1.lvl0', 'hierarchicalFacet1.lvl1'],
          separator: ' > ',
        },
        {
          name: 'hierarchicalFacet2',
          attributes: ['hierarchicalFacet2.lvl0', 'hierarchicalFacet2.lvl1'],
          separator: ' > ',
        },
      ],
    });
    results = {};
  });

  it('should retrieve one tag', () => {
    helper.addTag('tag1');
    const expected = [{ type: 'tag', attributeName: '_tags', name: 'tag1' }];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple tags', () => {
    helper.addTag('tag1').addTag('tag2');
    const expected = [
      { type: 'tag', attributeName: '_tags', name: 'tag1' },
      { type: 'tag', attributeName: '_tags', name: 'tag2' },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve one facetRefinement', () => {
    helper.toggleRefinement('facet1', 'facet1val1');
    const expected = [
      { type: 'facet', attributeName: 'facet1', name: 'facet1val1' },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple facetsRefinements on one facet', () => {
    helper
      .toggleRefinement('facet1', 'facet1val1')
      .toggleRefinement('facet1', 'facet1val2');
    const expected = [
      { type: 'facet', attributeName: 'facet1', name: 'facet1val1' },
      { type: 'facet', attributeName: 'facet1', name: 'facet1val2' },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple facetsRefinements on multiple facets', () => {
    helper
      .toggleRefinement('facet1', 'facet1val1')
      .toggleRefinement('facet1', 'facet1val2')
      .toggleRefinement('facet2', 'facet2val1');
    const expected = [
      { type: 'facet', attributeName: 'facet1', name: 'facet1val1' },
      { type: 'facet', attributeName: 'facet1', name: 'facet1val2' },
      { type: 'facet', attributeName: 'facet2', name: 'facet2val1' },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
  });

  it('should have a count for a facetRefinement if available', () => {
    helper.toggleRefinement('facet1', 'facet1val1');
    results = {
      facets: [
        {
          name: 'facet1',
          data: {
            facet1val1: 4,
          },
        },
      ],
    };
    const expected = [
      { type: 'facet', attributeName: 'facet1', name: 'facet1val1', count: 4 },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should have exhaustive for a facetRefinement if available', () => {
    helper.toggleRefinement('facet1', 'facet1val1');
    results = {
      facets: [
        {
          name: 'facet1',
          exhaustive: true,
        },
      ],
    };
    const expected = [
      {
        type: 'facet',
        attributeName: 'facet1',
        name: 'facet1val1',
        exhaustive: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve one facetExclude', () => {
    helper.toggleExclude('facet1', 'facet1exclude1');
    const expected = [
      {
        type: 'exclude',
        attributeName: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple facetsExcludes on one facet', () => {
    helper
      .toggleExclude('facet1', 'facet1exclude1')
      .toggleExclude('facet1', 'facet1exclude2');
    const expected = [
      {
        type: 'exclude',
        attributeName: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
      {
        type: 'exclude',
        attributeName: 'facet1',
        name: 'facet1exclude2',
        exclude: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple facetsExcludes on multiple facets', () => {
    helper
      .toggleExclude('facet1', 'facet1exclude1')
      .toggleExclude('facet1', 'facet1exclude2')
      .toggleExclude('facet2', 'facet2exclude1');
    const expected = [
      {
        type: 'exclude',
        attributeName: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
      {
        type: 'exclude',
        attributeName: 'facet1',
        name: 'facet1exclude2',
        exclude: true,
      },
      {
        type: 'exclude',
        attributeName: 'facet2',
        name: 'facet2exclude1',
        exclude: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
  });

  it('should retrieve one disjunctiveFacetRefinement', () => {
    helper.addDisjunctiveFacetRefinement(
      'disjunctiveFacet1',
      'disjunctiveFacet1val1'
    );
    const expected = [
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on one facet', () => {
    helper
      .addDisjunctiveFacetRefinement(
        'disjunctiveFacet1',
        'disjunctiveFacet1val1'
      )
      .addDisjunctiveFacetRefinement(
        'disjunctiveFacet1',
        'disjunctiveFacet1val2'
      );
    const expected = [
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on multiple facets', () => {
    helper
      .toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1')
      .toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val2')
      .toggleRefinement('disjunctiveFacet2', 'disjunctiveFacet2val1');
    const expected = [
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
      },
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet2',
        name: 'disjunctiveFacet2val1',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
  });

  it('should have a count for a disjunctiveFacetRefinement if available', () => {
    helper.toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [
        {
          name: 'disjunctiveFacet1',
          data: {
            disjunctiveFacet1val1: 4,
          },
        },
      ],
    };
    const expected = [
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        count: 4,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should have exhaustive for a disjunctiveFacetRefinement if available', () => {
    helper.toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [
        {
          name: 'disjunctiveFacet1',
          exhaustive: true,
        },
      ],
    };
    const expected = [
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        exhaustive: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve one hierarchicalFacetRefinement', () => {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1');
    const expected = [
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple facets', () => {
    helper
      .toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1')
      .toggleRefinement('hierarchicalFacet2', 'hierarchicalFacet2lvl0val1');
    const expected = [
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
      },
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet2',
        name: 'hierarchicalFacet2lvl0val1',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple facets and multiple levels', () => {
    helper
      .toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1')
      .toggleRefinement(
        'hierarchicalFacet2',
        'hierarchicalFacet2lvl0val1 > lvl1val1'
      );
    const expected = [
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
      },
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet2',
        name: 'lvl1val1',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should have a count for a hierarchicalFacetRefinement if available', () => {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1val1');
    results = {
      hierarchicalFacets: [
        {
          name: 'hierarchicalFacet1',
          data: {
            hierarchicalFacet1val1: {
              name: 'hierarchicalFacet1val1',
              count: 4,
            },
          },
        },
      ],
    };
    const expected = [
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1val1',
        count: 4,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should have exhaustive for a hierarchicalFacetRefinement if available', () => {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1val1');
    results = {
      hierarchicalFacets: [
        {
          name: 'hierarchicalFacet1',
          data: [{ name: 'hierarchicalFacet1val1', exhaustive: true }],
        },
      ],
    };
    const expected = [
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1val1',
        exhaustive: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve a numericRefinement on one facet', () => {
    helper.addNumericRefinement('numericFacet1', '>', '1');
    const expected = [
      {
        type: 'numeric',
        attributeName: 'numericFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve a numericRefinement on one disjunctive facet', () => {
    helper.addNumericRefinement('numericDisjunctiveFacet1', '>', '1');
    const expected = [
      {
        type: 'numeric',
        attributeName: 'numericDisjunctiveFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
  });

  it('should retrieve multiple numericRefinements with same operator', () => {
    helper
      .addNumericRefinement('numericFacet1', '>', '1')
      .addNumericRefinement('numericFacet1', '>', '2');
    const expected = [
      {
        type: 'numeric',
        attributeName: 'numericFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
      {
        type: 'numeric',
        attributeName: 'numericFacet1',
        operator: '>',
        name: '2',
        numericValue: 2,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
  });

  it('should retrieve multiple conjunctive and numericRefinements', () => {
    helper
      .addNumericRefinement('numericFacet1', '>', '1')
      .addNumericRefinement('numericFacet1', '>', '2')
      .addNumericRefinement('numericFacet1', '<=', '3')
      .addNumericRefinement('numericDisjunctiveFacet1', '>', '1')
      .addNumericRefinement('numericDisjunctiveFacet1', '>', '2');
    const expected = [
      {
        type: 'numeric',
        attributeName: 'numericFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
      {
        type: 'numeric',
        attributeName: 'numericFacet1',
        operator: '>',
        name: '2',
        numericValue: 2,
      },
      {
        type: 'numeric',
        attributeName: 'numericFacet1',
        operator: '<=',
        name: '3',
        numericValue: 3,
      },
      {
        type: 'numeric',
        attributeName: 'numericDisjunctiveFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
      {
        type: 'numeric',
        attributeName: 'numericDisjunctiveFacet1',
        operator: '>',
        name: '2',
        numericValue: 2,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[0]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[1]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[2]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[3]);
    expect(utils.getRefinements(results, helper.state)).toInclude(expected[4]);
  });
});

describe('utils.clearRefinementsFromState', () => {
  let helper;
  let state;

  beforeEach(() => {
    helper = algoliasearchHelper({ addAlgoliaAgent: () => {} }, 'my_index', {
      facets: ['facet1', 'facet2', 'numericFacet1', 'facetExclude1'],
      disjunctiveFacets: ['disjunctiveFacet1', 'numericDisjunctiveFacet'],
      hierarchicalFacets: [
        {
          name: 'hierarchicalFacet1',
          attributes: ['hierarchicalFacet1.lvl0', 'hierarchicalFacet1.lvl1'],
          separator: ' > ',
        },
      ],
    });
    helper
      .toggleRefinement('facet1', 'facet1val1')
      .toggleRefinement('facet1', 'facet1val2')
      .toggleRefinement('facet2', 'facet2val1')
      .toggleRefinement('facet2', 'facet2val2')
      .toggleRefinement('disjunctiveFacet1', 'facet1val1')
      .toggleRefinement('disjunctiveFacet1', 'facet1val2')
      .toggleExclude('facetExclude1', 'facetExclude1val1')
      .toggleExclude('facetExclude1', 'facetExclude1val2')
      .addNumericRefinement('numericFacet1', '>', '1')
      .addNumericRefinement('numericFacet1', '>', '2')
      .addNumericRefinement('numericDisjunctiveFacet1', '>', '1')
      .addNumericRefinement('numericDisjunctiveFacet1', '>', '2')
      .toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1')
      .addTag('tag1')
      .addTag('tag2');
    state = helper.state;
  });

  describe('without arguments', () => {
    it('should clear everything', () => {
      const newState = utils.clearRefinementsFromState(state);
      expect(isEmpty(newState.facetsRefinements)).toBe(
        true,
        "state shouldn't have facetsRefinements"
      );
      expect(isEmpty(newState.facetsExcludes)).toBe(
        true,
        "state shouldn't have facetsExcludes"
      );
      expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
        true,
        "state shouldn't have disjunctiveFacetsRefinements"
      );
      expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
        true,
        "state shouldn't have hierarchicalFacetsRefinements"
      );
      expect(isEmpty(newState.numericRefinements)).toBe(
        true,
        "state shouldn't have numericRefinements"
      );
      expect(isEmpty(newState.tagRefinements)).toBe(
        true,
        "state shouldn't have tagRefinements"
      );
    });
  });

  it('should clear one facet', () => {
    const newState = utils.clearRefinementsFromState(state, ['facet1']);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear facets', () => {
    const newState = utils.clearRefinementsFromState(state, [
      'facet1',
      'facet2',
    ]);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      true,
      "state shouldn't have facetsRefinements"
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear excludes', () => {
    const newState = utils.clearRefinementsFromState(state, ['facetExclude1']);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      true,
      "state shouldn't have facetsExcludes"
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear disjunctive facets', () => {
    const newState = utils.clearRefinementsFromState(state, [
      'disjunctiveFacet1',
    ]);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      true,
      "state shouldn't have disjunctiveFacetsRefinements"
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear hierarchical facets', () => {
    const newState = utils.clearRefinementsFromState(state, [
      'hierarchicalFacet1',
    ]);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      true,
      "state shouldn't have hierarchicalFacetsRefinements"
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear one numeric facet', () => {
    const newState = utils.clearRefinementsFromState(state, ['numericFacet1']);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear one numeric disjunctive facet', () => {
    const newState = utils.clearRefinementsFromState(state, [
      'numericDisjunctiveFacet1',
    ]);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear numeric facets', () => {
    const newState = utils.clearRefinementsFromState(state, [
      'numericFacet1',
      'numericDisjunctiveFacet1',
    ]);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      true,
      "state shouldn't have numericRefinements"
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      false,
      'state should have tagRefinements'
    );
  });

  it('should clear tags', () => {
    const newState = utils.clearRefinementsFromState(state, ['_tags']);
    expect(isEmpty(newState.facetsRefinements)).toBe(
      false,
      'state should have facetsRefinements'
    );
    expect(isEmpty(newState.facetsExcludes)).toBe(
      false,
      'state should have facetsExcludes'
    );
    expect(isEmpty(newState.disjunctiveFacetsRefinements)).toBe(
      false,
      'state should have disjunctiveFacetsRefinements'
    );
    expect(isEmpty(newState.hierarchicalFacetsRefinements)).toBe(
      false,
      'state should have hierarchicalFacetsRefinements'
    );
    expect(isEmpty(newState.numericRefinements)).toBe(
      false,
      'state should have numericRefinements'
    );
    expect(isEmpty(newState.tagRefinements)).toBe(
      true,
      "state shouldn't have tagRefinements"
    );
  });
});
