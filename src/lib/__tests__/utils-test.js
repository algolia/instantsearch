import algoliasearchHelper from 'algoliasearch-helper';
import * as utils from '../utils';

describe('capitalize', () => {
  it('should capitalize the first character only', () => {
    expect(utils.capitalize('hello')).toBe('Hello');
  });
});

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
    expect(utils.bemHelper('block')).toEqual(expect.any(Function));
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

  it('should return the default templates and set useCustomCompileOptions to false when using the defaults', () => {
    const defaultsPrepared = utils.prepareTemplateProps({
      defaultTemplates,
      undefined,
      templatesConfig,
    });

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
      defaultTemplates,
      templates,
      templatesConfig,
    });

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
      defaultTemplates,
      templates,
      templatesConfig,
    });

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

describe('utils.renderTemplate', () => {
  it('expect to process templates as string', () => {
    const templateKey = 'test';
    const templates = { test: 'it works with {{type}}' };
    const data = { type: 'strings' };

    const actual = utils.renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with strings';

    expect(actual).toBe(expectation);
  });

  it('expect to process templates as function', () => {
    const templateKey = 'test';
    const templates = { test: data => `it works with ${data.type}` };
    const data = { type: 'functions' };

    const actual = utils.renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with functions';

    expect(actual).toBe(expectation);
  });

  it('expect to use custom compiler options', () => {
    const templateKey = 'test';
    const templates = { test: 'it works with <%options%>' };
    const data = { options: 'custom delimiter' };
    const compileOptions = { delimiters: '<% %>' };

    const actual = utils.renderTemplate({
      templateKey,
      templates,
      data,
      compileOptions,
    });

    const expectation = 'it works with custom delimiter';

    expect(actual).toBe(expectation);
  });

  it('expect to compress templates', () => {
    expect(
      utils.renderTemplate({
        templateKey: 'message',
        templates: {
          message: ` <h1> hello</h1>
        <p>message</p> `,
        },
      })
    ).toMatchInlineSnapshot(`"<h1> hello</h1> <p>message</p>"`);
  });

  it('expect to throw when the template is not a function or a string', () => {
    const actual0 = () =>
      utils.renderTemplate({
        templateKey: 'test',
        templates: {},
      });

    const actual1 = () =>
      utils.renderTemplate({
        templateKey: 'test',
        templates: { test: null },
      });

    const actual2 = () =>
      utils.renderTemplate({
        templateKey: 'test',
        templates: { test: 10 },
      });

    const expectation0 = `Template must be 'string' or 'function', was 'undefined' (key: test)`;
    const expectation1 = `Template must be 'string' or 'function', was 'object' (key: test)`;
    const expectation2 = `Template must be 'string' or 'function', was 'number' (key: test)`;

    expect(() => actual0()).toThrow(expectation0);
    expect(() => actual1()).toThrow(expectation1);
    expect(() => actual2()).toThrow(expectation2);
  });

  describe('with helpers', () => {
    it('expect to call the relevant function', () => {
      const templateKey = 'test';
      const templates = {
        test: '{{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}',
      };

      const data = {
        feature: 'helpers',
      };

      const helpers = {
        emphasis: (text, render) => `<em>${render(text)}</em>`,
      };

      const actual = utils.renderTemplate({
        templateKey,
        templates,
        data,
        helpers,
      });

      const expectation = '<em>helpers</em>';

      expect(actual).toBe(expectation);
    });

    it('expect to set the context (`this`) to the template `data`', done => {
      const templateKey = 'test';
      const templates = {
        test: '{{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}',
      };

      const data = {
        feature: 'helpers',
      };

      const helpers = {
        emphasis() {
          // context will be different when using arrow function (lexical scope used)
          expect(this).toBe(data);
          done();
        },
      };

      const actual = utils.renderTemplate({
        templateKey,
        templates,
        data,
        helpers,
      });

      const expectation = '';

      expect(actual).toBe(expectation);
    });
  });
});

describe('utils.getRefinements', () => {
  let helper;
  let results;

  beforeEach(() => {
    helper = algoliasearchHelper({}, 'my_index', {
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should retrieve multiple tags', () => {
    helper.addTag('tag1').addTag('tag2');
    const expected = [
      { type: 'tag', attributeName: '_tags', name: 'tag1' },
      { type: 'tag', attributeName: '_tags', name: 'tag2' },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should retrieve one facetRefinement', () => {
    helper.toggleRefinement('facet1', 'facet1val1');
    const expected = [
      { type: 'facet', attributeName: 'facet1', name: 'facet1val1' },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should retrieve one query refinement when `clearsQuery` is true', () => {
    helper.setQuery('a query');
    const expected = [
      {
        type: 'query',
        attributeName: 'query',
        name: 'a query',
        query: 'a query',
      },
    ];
    const clearsQuery = true;
    expect(
      utils.getRefinements(results, helper.state, clearsQuery)
    ).toContainEqual(expected[0]);
  });

  it('should not retrieve any query refinements if `clearsQuery` if false', () => {
    helper.setQuery('a query');
    const expected = [];
    const clearsQuery = false;
    expect(utils.getRefinements(results, helper.state, clearsQuery)).toEqual(
      expected
    );
  });

  it('should retrieve multiple facetsRefinements on one facet', () => {
    helper
      .toggleRefinement('facet1', 'facet1val1')
      .toggleRefinement('facet1', 'facet1val2');
    const expected = [
      { type: 'facet', attributeName: 'facet1', name: 'facet1val1' },
      { type: 'facet', attributeName: 'facet1', name: 'facet1val2' },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[2]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[2]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[2]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
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
        name: 'hierarchicalFacet2lvl0val1 > lvl1val1',
      },
    ];

    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
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
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[2]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[3]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[4]
    );
  });
});

describe('utils.deprecate', () => {
  const sum = (...args) => args.reduce((acc, _) => acc + _, 0);

  it('expect to call initial function and print message', () => {
    const warn = jest.spyOn(global.console, 'warn');
    const fn = utils.deprecate(sum, 'message');

    const expectation = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation);
    expect(warn).toHaveBeenCalledWith('[InstantSearch.js]: message');

    warn.mockReset();
    warn.mockRestore();
  });

  it('expect to call initial function twice and print message once', () => {
    const warn = jest.spyOn(global.console, 'warn');
    const fn = utils.deprecate(sum, 'message');

    const expectation0 = fn(1, 2, 3);
    const expectation1 = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation0);
    expect(actual).toBe(expectation1);
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockReset();
    warn.mockRestore();
  });
});

describe('utils.warning', () => {
  let warn;

  beforeEach(() => {
    warn = jest.spyOn(global.console, 'warn');
  });

  afterEach(() => {
    warn.mockReset();
    warn.mockRestore();
    utils.warning.cache = {};
  });

  it('prints a warning message with a false condition', () => {
    utils.warning(false, 'message');

    expect(warn).toHaveBeenCalledWith('[InstantSearch.js]: message');
  });

  it('does not print a warning message with a true condition', () => {
    utils.warning(true, 'message');

    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('prints the same warning message only once', () => {
    utils.warning(false, 'message');
    expect(warn).toHaveBeenCalledTimes(1);

    utils.warning(false, 'message');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('utils.aroundLatLngToPosition', () => {
  it.each([
    ['10,12', { lat: 10, lng: 12 }],
    ['10,    12', { lat: 10, lng: 12 }],
    ['10.15,12', { lat: 10.15, lng: 12 }],
    ['10,12.15', { lat: 10, lng: 12.15 }],
  ])('expect to return a Position from a string: %j', (input, expectation) => {
    expect(utils.aroundLatLngToPosition(input)).toEqual(expectation);
  });

  it.each([['10a,12'], ['10.    12']])(
    'expect to throw an error with: %j',
    input => {
      expect(() => utils.aroundLatLngToPosition(input)).toThrowError(
        `Invalid value for "aroundLatLng" parameter: "${input}"`
      );
    }
  );
});

describe('utils.insideBoundingBoxToBoundingBox', () => {
  it.each([
    [
      '10,12,12,14',
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      '10,   12    ,12      ,    14',
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      '10.15,12.15,12.15,14.15',
      {
        northEast: { lat: 10.15, lng: 12.15 },
        southWest: { lat: 12.15, lng: 14.15 },
      },
    ],
  ])(
    'expect to return a BoundingBox from a string: %j',
    (input, expectation) => {
      expect(utils.insideBoundingBoxToBoundingBox(input)).toEqual(expectation);
    }
  );

  it.each([
    [
      [[10, 12, 12, 14]],
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      [[10.15, 12.15, 12.15, 14.15]],
      {
        northEast: { lat: 10.15, lng: 12.15 },
        southWest: { lat: 12.15, lng: 14.15 },
      },
    ],
  ])(
    'expect to return a BoundingBox from an array: %j',
    (input, expectation) => {
      expect(utils.insideBoundingBoxToBoundingBox(input)).toEqual(expectation);
    }
  );

  it.each([[''], ['10'], ['10,12'], ['10,12,12'], ['10.  15,12,12']])(
    'expect to throw an error with: %j',
    input => {
      expect(() => utils.insideBoundingBoxToBoundingBox(input)).toThrowError(
        `Invalid value for "insideBoundingBox" parameter: "${input}"`
      );
    }
  );

  it.each([[[]], [[[]]]])('expect to throw an error with: %j', input => {
    expect(() => utils.insideBoundingBoxToBoundingBox(input)).toThrowError(
      `Invalid value for "insideBoundingBox" parameter: [${input}]`
    );
  });
});

describe('utils.clearRefinements', () => {
  const initHelperWithRefinements = () => {
    const helper = algoliasearchHelper({}, 'index', {
      facets: ['conjFacet'],
      disjunctiveFacets: ['disjFacet'],
    });

    helper.toggleRefinement('conjFacet', 'value');
    helper.toggleRefinement('disjFacet', 'otherValue');
    helper.toggleTag('taG');

    helper.setQuery('a query');

    return helper;
  };

  it('does not clear anything without attributes', () => {
    const helper = initHelperWithRefinements();

    const finalState = utils.clearRefinements({
      helper,
    });

    expect(finalState.query).toBe(helper.state.query);
    expect(finalState.facetsRefinements).toEqual(
      helper.state.facetsRefinements
    );
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual(helper.state.tagRefinements);
  });

  it('can clear all the parameters defined in the list', () => {
    const helper = initHelperWithRefinements();

    const finalState = utils.clearRefinements({
      helper,
      attributesToClear: ['conjFacet'],
    });

    expect(finalState.query).toBe(helper.state.query);
    expect(finalState.facetsRefinements).toEqual({});
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual(helper.state.tagRefinements);
  });

  it('can clear tags only (including tags)', () => {
    const helper = initHelperWithRefinements();

    const finalState = utils.clearRefinements({
      helper,
      attributesToClear: ['_tags'],
    });

    expect(finalState.query).toBe(helper.state.query);
    expect(finalState.facetsRefinements).toEqual(
      helper.state.facetsRefinements
    );
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      finalState.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual([]);
  });

  it('can clear the query alone', () => {
    const helper = initHelperWithRefinements();

    const finalState = utils.clearRefinements({
      helper,
      attributesToClear: ['query'],
    });

    expect(finalState.query).toBe('');
    expect(finalState.facetsRefinements).toEqual(
      helper.state.facetsRefinements
    );
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual(helper.state.tagRefinements);
  });

  it('can clear the query alone and other refinements', () => {
    const helper = initHelperWithRefinements();

    const finalState = utils.clearRefinements({
      helper,
      attributesToClear: ['query', 'conjFacet'],
    });

    expect(finalState.query).toBe('');
    expect(finalState.facetsRefinements).toEqual({});
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
    expect(finalState.tagRefinements).toEqual(helper.state.tagRefinements);
  });
});

describe('utils.getPropertyByPath', () => {
  it('should be able to get a property', () => {
    const object = {
      name: 'name',
    };

    expect(utils.getPropertyByPath(object, 'name')).toBe('name');
  });

  it('should be able to get a nested property', () => {
    const object = {
      nested: {
        name: 'name',
      },
    };

    expect(utils.getPropertyByPath(object, 'nested.name')).toBe('name');
  });

  it('returns undefined if does not exist', () => {
    const object = {};

    expect(utils.getPropertyByPath(object, 'random')).toBe(undefined);
  });

  it('should stop traversing when property is not an object', () => {
    const object = {
      nested: {
        names: ['name'],
      },
    };

    expect(utils.getPropertyByPath(object, 'nested.name')).toBe(undefined);
  });
});
