import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import getRefinements from '../getRefinements';

describe('getRefinements', () => {
  let helper: AlgoliaSearchHelper;
  let results: SearchResults;

  beforeEach(() => {
    helper = algoliasearchHelper(createSearchClient(), 'my_index', {
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
    results = new SearchResults(new SearchParameters(), [
      createSingleSearchResponse(),
    ]);
  });

  it('should retrieve one tag', () => {
    // @ts-expect-error not the correct call
    helper.addTag('tag1');
    const expected = [{ type: 'tag', attribute: '_tags', name: 'tag1' }];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve multiple tags', () => {
    // @ts-expect-error not the correct call
    helper.addTag('tag1').addTag('tag2');
    const expected = [
      { type: 'tag', attribute: '_tags', name: 'tag1' },
      { type: 'tag', attribute: '_tags', name: 'tag2' },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve one facetRefinement', () => {
    helper.toggleRefinement('facet1', 'facet1val1');
    const expected = [
      { type: 'facet', attribute: 'facet1', name: 'facet1val1' },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve one query refinement when `clearsQuery` is true', () => {
    helper.setQuery('a query');
    const expected = [
      {
        type: 'query',
        attribute: 'query',
        name: 'a query',
        query: 'a query',
      },
    ];
    const clearsQuery = true;
    expect(getRefinements(results, helper.state, clearsQuery)).toContainEqual(
      expected[0]
    );
  });

  it('should not retrieve any query refinements if `clearsQuery` if false', () => {
    helper.setQuery('a query');
    const expected = [];
    const clearsQuery = false;
    expect(getRefinements(results, helper.state, clearsQuery)).toEqual(
      expected
    );
  });

  it('should retrieve multiple facetsRefinements on one facet', () => {
    helper
      .toggleRefinement('facet1', 'facet1val1')
      .toggleRefinement('facet1', 'facet1val2');
    const expected = [
      { type: 'facet', attribute: 'facet1', name: 'facet1val1' },
      { type: 'facet', attribute: 'facet1', name: 'facet1val2' },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
  });

  it('should retrieve multiple facetsRefinements on multiple facets', () => {
    helper
      .toggleRefinement('facet1', 'facet1val1')
      .toggleRefinement('facet1', 'facet1val2')
      .toggleRefinement('facet2', 'facet2val1');
    const expected = [
      { type: 'facet', attribute: 'facet1', name: 'facet1val1' },
      { type: 'facet', attribute: 'facet1', name: 'facet1val2' },
      { type: 'facet', attribute: 'facet2', name: 'facet2val1' },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[2]);
  });

  it('should have a count for a facetRefinement if available', () => {
    helper.toggleRefinement('facet1', 'facet1val1');
    // @ts-expect-error file not fully migrated to typescript
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
      { type: 'facet', attribute: 'facet1', name: 'facet1val1', count: 4 },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should have exhaustive for a facetRefinement if available', () => {
    helper.toggleRefinement('facet1', 'facet1val1');
    results = {
      facets: [
        {
          name: 'facet1',
          // @ts-expect-error file not fully migrated to typescript
          exhaustive: true,
        },
      ],
    };
    const expected = [
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val1',
        exhaustive: true,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve one facetExclude', () => {
    helper.toggleExclude('facet1', 'facet1exclude1');
    const expected = [
      {
        type: 'exclude',
        attribute: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve multiple facetsExcludes on one facet', () => {
    helper
      .toggleExclude('facet1', 'facet1exclude1')
      .toggleExclude('facet1', 'facet1exclude2');
    const expected = [
      {
        type: 'exclude',
        attribute: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
      {
        type: 'exclude',
        attribute: 'facet1',
        name: 'facet1exclude2',
        exclude: true,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
  });

  it('should retrieve multiple facetsExcludes on multiple facets', () => {
    helper
      .toggleExclude('facet1', 'facet1exclude1')
      .toggleExclude('facet1', 'facet1exclude2')
      .toggleExclude('facet2', 'facet2exclude1');
    const expected = [
      {
        type: 'exclude',
        attribute: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
      {
        type: 'exclude',
        attribute: 'facet1',
        name: 'facet1exclude2',
        exclude: true,
      },
      {
        type: 'exclude',
        attribute: 'facet2',
        name: 'facet2exclude1',
        exclude: true,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[2]);
  });

  it('should retrieve one disjunctiveFacetRefinement', () => {
    helper.addDisjunctiveFacetRefinement(
      'disjunctiveFacet1',
      'disjunctiveFacet1val1'
    );
    const expected = [
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
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
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on multiple facets', () => {
    helper
      .toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1')
      .toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val2')
      .toggleRefinement('disjunctiveFacet2', 'disjunctiveFacet2val1');
    const expected = [
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
      },
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet2',
        name: 'disjunctiveFacet2val1',
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[2]);
  });

  it('should have a count for a disjunctiveFacetRefinement if available', () => {
    helper.toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    // @ts-expect-error file not fully migrated to typescript
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
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        count: 4,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should have exhaustive for a disjunctiveFacetRefinement if available', () => {
    helper.toggleRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [
        {
          name: 'disjunctiveFacet1',
          // @ts-expect-error file not fully migrated to typescript
          exhaustive: true,
        },
      ],
    };
    const expected = [
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        exhaustive: true,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve one hierarchicalFacetRefinement', () => {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1');
    const expected = [
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple facets', () => {
    helper
      .toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1')
      .toggleRefinement('hierarchicalFacet2', 'hierarchicalFacet2lvl0val1');
    const expected = [
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
      },
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet2',
        name: 'hierarchicalFacet2lvl0val1',
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
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
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
      },
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet2',
        name: 'hierarchicalFacet2lvl0val1 > lvl1val1',
      },
    ];

    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple levels without any data', () => {
    helper.toggleRefinement(
      'hierarchicalFacet2',
      'hierarchicalFacet2lvl0val1 > lvl1val1'
    );

    results = {
      hierarchicalFacets: [
        {
          // @ts-expect-error file not fully migrated to typescript
          count: null,
          // @ts-expect-error file not fully migrated to typescript
          data: null,
          isRefined: true,
          name: 'hierarchicalFacet2',
          // @ts-expect-error file not fully migrated to typescript
          path: null,
        },
      ],
    };

    const expected = {
      type: 'hierarchical',
      attribute: 'hierarchicalFacet2',
      name: 'hierarchicalFacet2lvl0val1 > lvl1val1',
      count: null,
      exhaustive: null,
    };

    expect(getRefinements(results, helper.state)).toContainEqual(expected);
  });

  it('should have a count for a hierarchicalFacetRefinement if available', () => {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1val1');
    results = {
      hierarchicalFacets: [
        {
          name: 'hierarchicalFacet1',
          data: {
            // @ts-expect-error file not fully migrated to typescript
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
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1val1',
        count: 4,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should have exhaustive for a hierarchicalFacetRefinement if available', () => {
    helper.toggleRefinement('hierarchicalFacet1', 'hierarchicalFacet1val1');
    results = {
      hierarchicalFacets: [
        {
          name: 'hierarchicalFacet1',
          data: [
            {
              name: 'hierarchicalFacet1val1',
              // @ts-expect-error file not fully migrated to typescript
              exhaustive: true,
            },
          ],
        },
      ],
    };
    const expected = [
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1val1',
        exhaustive: true,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve a numericRefinement on one facet', () => {
    // @ts-expect-error
    helper.addNumericRefinement('numericFacet1', '>', '1');
    const expected = [
      {
        type: 'numeric',
        attribute: 'numericFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve a numericRefinement on one disjunctive facet', () => {
    // @ts-expect-error
    helper.addNumericRefinement('numericDisjunctiveFacet1', '>', '1');
    const expected = [
      {
        type: 'numeric',
        attribute: 'numericDisjunctiveFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
  });

  it('should retrieve multiple numericRefinements with same operator', () => {
    helper
      // @ts-expect-error
      .addNumericRefinement('numericFacet1', '>', '1')
      // @ts-expect-error
      .addNumericRefinement('numericFacet1', '>', '2');
    const expected = [
      {
        type: 'numeric',
        attribute: 'numericFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
      {
        type: 'numeric',
        attribute: 'numericFacet1',
        operator: '>',
        name: '2',
        numericValue: 2,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
  });

  it('should retrieve multiple conjunctive and numericRefinements', () => {
    helper
      // @ts-expect-error
      .addNumericRefinement('numericFacet1', '>', '1')
      // @ts-expect-error
      .addNumericRefinement('numericFacet1', '>', '2')
      // @ts-expect-error
      .addNumericRefinement('numericFacet1', '<=', '3')
      // @ts-expect-error
      .addNumericRefinement('numericDisjunctiveFacet1', '>', '1')
      // @ts-expect-error
      .addNumericRefinement('numericDisjunctiveFacet1', '>', '2');

    const expected = [
      {
        type: 'numeric',
        attribute: 'numericFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
      {
        type: 'numeric',
        attribute: 'numericFacet1',
        operator: '>',
        name: '2',
        numericValue: 2,
      },
      {
        type: 'numeric',
        attribute: 'numericFacet1',
        operator: '<=',
        name: '3',
        numericValue: 3,
      },
      {
        type: 'numeric',
        attribute: 'numericDisjunctiveFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
      {
        type: 'numeric',
        attribute: 'numericDisjunctiveFacet1',
        operator: '>',
        name: '2',
        numericValue: 2,
      },
    ];
    expect(getRefinements(results, helper.state)).toContainEqual(expected[0]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[1]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[2]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[3]);
    expect(getRefinements(results, helper.state)).toContainEqual(expected[4]);
  });
});
