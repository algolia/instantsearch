import {
  createSingleSearchResponse,
  createSearchClient,
} from '@instantsearch/mocks';
import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

import { getRefinements } from '..';

import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

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
    helper.addTag('tag1');

    expect(getRefinements(results, helper.state)).toEqual([
      { type: 'tag', attribute: '_tags', name: 'tag1' },
    ]);
  });

  it('should retrieve multiple tags', () => {
    helper.addTag('tag1').addTag('tag2');

    expect(getRefinements(results, helper.state)).toEqual([
      { type: 'tag', attribute: '_tags', name: 'tag1' },
      { type: 'tag', attribute: '_tags', name: 'tag2' },
    ]);
  });

  it('should retrieve one facetRefinement', () => {
    helper.toggleFacetRefinement('facet1', 'facet1val1');

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val1',
        escapedValue: 'facet1val1',
      },
    ]);
  });

  it('should retrieve one query refinement when `clearsQuery` is true', () => {
    helper.setQuery('a query');
    const clearsQuery = true;

    expect(getRefinements(results, helper.state, clearsQuery)).toEqual([
      {
        type: 'query',
        attribute: 'query',
        name: 'a query',
        query: 'a query',
      },
    ]);
  });

  it('should not retrieve any query refinements if `clearsQuery` if false', () => {
    helper.setQuery('a query');
    const expected: never[] = [];
    const clearsQuery = false;

    expect(getRefinements(results, helper.state, clearsQuery)).toEqual(
      expected
    );
  });

  it('should retrieve multiple facetsRefinements on one facet', () => {
    helper
      .toggleFacetRefinement('facet1', 'facet1val1')
      .toggleFacetRefinement('facet1', 'facet1val2');

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val1',
        escapedValue: 'facet1val1',
      },
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val2',
        escapedValue: 'facet1val2',
      },
    ]);
  });

  it('should retrieve multiple facetsRefinements on multiple facets', () => {
    helper
      .toggleFacetRefinement('facet1', 'facet1val1')
      .toggleFacetRefinement('facet1', 'facet1val2')
      .toggleFacetRefinement('facet2', 'facet2val1');

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val1',
        escapedValue: 'facet1val1',
      },
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val2',
        escapedValue: 'facet1val2',
      },
      {
        type: 'facet',
        attribute: 'facet2',
        name: 'facet2val1',
        escapedValue: 'facet2val1',
      },
    ]);
  });

  it('should have a count for a facetRefinement if available', () => {
    helper.toggleFacetRefinement('facet1', 'facet1val1');
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

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val1',
        escapedValue: 'facet1val1',
        count: 4,
      },
    ]);
  });

  it('should have exhaustive for a facetRefinement if available', () => {
    helper.toggleFacetRefinement('facet1', 'facet1val1');
    results = {
      facets: [
        {
          name: 'facet1',
          // @ts-expect-error file not fully migrated to typescript
          exhaustive: true,
        },
      ],
    };

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'facet',
        attribute: 'facet1',
        name: 'facet1val1',
        escapedValue: 'facet1val1',
        exhaustive: true,
      },
    ]);
  });

  it('should retrieve one facetExclude', () => {
    helper.toggleFacetExclusion('facet1', 'facet1exclude1');

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'exclude',
        attribute: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
    ]);
  });

  it('should retrieve multiple facetsExcludes on one facet', () => {
    helper
      .toggleFacetExclusion('facet1', 'facet1exclude1')
      .toggleFacetExclusion('facet1', 'facet1exclude2');

    expect(getRefinements(results, helper.state)).toEqual([
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
    ]);
  });

  it('should retrieve multiple facetsExcludes on multiple facets', () => {
    helper
      .toggleFacetExclusion('facet1', 'facet1exclude1')
      .toggleFacetExclusion('facet1', 'facet1exclude2')
      .toggleFacetExclusion('facet2', 'facet2exclude1');

    expect(getRefinements(results, helper.state)).toEqual([
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
    ]);
  });

  it('should retrieve one disjunctiveFacetRefinement', () => {
    helper.addDisjunctiveFacetRefinement(
      'disjunctiveFacet1',
      'disjunctiveFacet1val1'
    );

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        escapedValue: 'disjunctiveFacet1val1',
      },
    ]);
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

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        escapedValue: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
        escapedValue: 'disjunctiveFacet1val2',
      },
    ]);
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on multiple facets', () => {
    helper
      .toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1')
      .toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val2')
      .toggleFacetRefinement('disjunctiveFacet2', 'disjunctiveFacet2val1');

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        escapedValue: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
        escapedValue: 'disjunctiveFacet1val2',
      },
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet2',
        name: 'disjunctiveFacet2val1',
        escapedValue: 'disjunctiveFacet2val1',
      },
    ]);
  });

  it('should have a count for a disjunctiveFacetRefinement if available', () => {
    helper.toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
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

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        escapedValue: 'disjunctiveFacet1val1',
        count: 4,
      },
    ]);
  });

  it('should have exhaustive for a disjunctiveFacetRefinement if available', () => {
    helper.toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [
        {
          name: 'disjunctiveFacet1',
          // @ts-expect-error file not fully migrated to typescript
          exhaustive: true,
        },
      ],
    };

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'disjunctive',
        attribute: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        escapedValue: 'disjunctiveFacet1val1',
        exhaustive: true,
      },
    ]);
  });

  it('should retrieve one hierarchicalFacetRefinement', () => {
    helper.toggleFacetRefinement(
      'hierarchicalFacet1',
      'hierarchicalFacet1lvl0val1'
    );

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
        escapedValue: 'hierarchicalFacet1lvl0val1',
      },
    ]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple facets', () => {
    helper
      .toggleFacetRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1')
      .toggleFacetRefinement(
        'hierarchicalFacet2',
        'hierarchicalFacet2lvl0val1'
      );

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
        escapedValue: 'hierarchicalFacet1lvl0val1',
      },
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet2',
        name: 'hierarchicalFacet2lvl0val1',
        escapedValue: 'hierarchicalFacet2lvl0val1',
      },
    ]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple facets and multiple levels', () => {
    helper
      .toggleFacetRefinement('hierarchicalFacet1', 'hierarchicalFacet1lvl0val1')
      .toggleFacetRefinement(
        'hierarchicalFacet2',
        'hierarchicalFacet2lvl0val1 > lvl1val1'
      );

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1lvl0val1',
        escapedValue: 'hierarchicalFacet1lvl0val1',
      },
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet2',
        name: 'hierarchicalFacet2lvl0val1 > lvl1val1',
        escapedValue: 'hierarchicalFacet2lvl0val1 > lvl1val1',
      },
    ]);
  });

  it('should retrieve hierarchicalFacetsRefinements on multiple levels without any data', () => {
    helper.toggleFacetRefinement(
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

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet2',
        name: 'hierarchicalFacet2lvl0val1 > lvl1val1',
        escapedValue: 'hierarchicalFacet2lvl0val1 > lvl1val1',
        count: null,
      },
    ]);
  });

  it('should have a count for a hierarchicalFacetRefinement if available', () => {
    helper.toggleFacetRefinement(
      'hierarchicalFacet1',
      'hierarchicalFacet1val1'
    );
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

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1val1',
        escapedValue: 'hierarchicalFacet1val1',
        count: 4,
      },
    ]);
  });

  it('should have exhaustive for a hierarchicalFacetRefinement if available', () => {
    helper.toggleFacetRefinement(
      'hierarchicalFacet1',
      'hierarchicalFacet1val1'
    );
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

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'hierarchical',
        attribute: 'hierarchicalFacet1',
        name: 'hierarchicalFacet1val1',
        escapedValue: 'hierarchicalFacet1val1',
        exhaustive: true,
      },
    ]);
  });

  it('should retrieve a numericRefinement on one facet', () => {
    helper.addNumericRefinement('numericFacet1', '>', 1);

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'numeric',
        attribute: 'numericFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
    ]);
  });

  it('should retrieve a numericRefinement on one disjunctive facet', () => {
    helper.addNumericRefinement('numericDisjunctiveFacet1', '>', 1);

    expect(getRefinements(results, helper.state)).toEqual([
      {
        type: 'numeric',
        attribute: 'numericDisjunctiveFacet1',
        operator: '>',
        name: '1',
        numericValue: 1,
      },
    ]);
  });

  it('should retrieve multiple numericRefinements with same operator', () => {
    helper
      .addNumericRefinement('numericFacet1', '>', 1)
      .addNumericRefinement('numericFacet1', '>', 2);

    expect(getRefinements(results, helper.state)).toEqual([
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
    ]);
  });

  it('should retrieve multiple conjunctive and numericRefinements', () => {
    helper
      .addNumericRefinement('numericFacet1', '>', 1)
      .addNumericRefinement('numericFacet1', '>', 2)
      .addNumericRefinement('numericFacet1', '<=', 3)
      .addNumericRefinement('numericDisjunctiveFacet1', '>', 1)
      .addNumericRefinement('numericDisjunctiveFacet1', '>', 2);

    expect(getRefinements(results, helper.state)).toEqual([
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
    ]);
  });
});
