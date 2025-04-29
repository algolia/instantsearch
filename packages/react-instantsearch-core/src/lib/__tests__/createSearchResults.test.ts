import { SearchParameters } from 'algoliasearch-helper';

import { createSearchResults } from '../createSearchResults';

describe('createSearchResults', () => {
  test('returns search results with an empty state', () => {
    expect(createSearchResults(new SearchParameters())).toEqual(
      expect.objectContaining({
        disjunctiveFacets: [],
        exhaustiveFacetsCount: true,
        exhaustiveNbHits: true,
        facets: [],
        hierarchicalFacets: [],
        hits: [],
        hitsPerPage: 20,
        index: undefined,
        nbHits: 0,
        nbPages: 0,
        page: 0,
        params: '',
        processingTimeMS: 0,
        query: '',
      })
    );
  });

  test('returns search results with index', () => {
    expect(
      createSearchResults(
        new SearchParameters({
          index: 'index',
        })
      )
    ).toEqual(
      expect.objectContaining({
        index: 'index',
      })
    );
  });

  test('returns search results with query', () => {
    expect(
      createSearchResults(
        new SearchParameters({
          query: 'query',
        })
      )
    ).toEqual(
      expect.objectContaining({
        query: 'query',
      })
    );
  });

  test('returns search results with page', () => {
    expect(
      createSearchResults(
        new SearchParameters({
          page: 2,
        })
      )
    ).toEqual(
      expect.objectContaining({
        page: 2,
      })
    );
  });

  test('returns search results with hitsPerPage', () => {
    expect(
      createSearchResults(
        new SearchParameters({
          hitsPerPage: 50,
        })
      )
    ).toEqual(
      expect.objectContaining({
        hitsPerPage: 50,
      })
    );
  });
});
