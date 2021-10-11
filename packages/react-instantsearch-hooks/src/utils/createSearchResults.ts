import algoliasearchHelper from 'algoliasearch-helper';

import type { SearchParameters } from 'algoliasearch-helper';

export function createSearchResults(state: SearchParameters) {
  return new algoliasearchHelper.SearchResults(state, [
    {
      query: state.query ?? '',
      page: state.page ?? 0,
      hitsPerPage: state.hitsPerPage ?? 20,
      hits: [],
      nbHits: 0,
      nbPages: 0,
      params: '',
      exhaustiveNbHits: true,
      exhaustiveFacetsCount: true,
      processingTimeMS: 0,
      index: state.index,
    },
  ]);
}
