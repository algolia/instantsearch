import { isIndexWidget } from 'instantsearch.js/es/lib/utils';
import { useEffect, useState } from 'react';

import { getIndexSearchResults } from './getIndexSearchResults';
import { useIndexContext } from './useIndexContext';
import { useInstantSearchContext } from './useInstantSearchContext';

import type { SearchResults } from 'algoliasearch-helper';
import type { ScopedResult } from 'instantsearch.js';

export type SearchResultsApi = {
  results: SearchResults<any>;
  scopedResults: ScopedResult[];
};

export function useSearchResults(): SearchResultsApi {
  const search = useInstantSearchContext();
  const searchIndex = useIndexContext();
  const [searchResults, setSearchResults] = useState(() => {
    const indexSearchResults = getIndexSearchResults(searchIndex);
    return {
      results: indexSearchResults.results,
      scopedResults: indexSearchResults.scopedResults,
    };
  });

  useEffect(() => {
    function handleRender() {
      const results = searchIndex.getResults();

      // Results can be `null` when the first search is stalled.
      // In this case, we skip the update.
      // See: https://github.com/algolia/instantsearch/blob/20996c7a159988c58e00ff24d2d2dc98af8b980f/src/widgets/index/index.ts#L652-L657
      if (results !== null) {
        setSearchResults({
          results,
          scopedResults: searchIndex.getScopedResults(),
        });
      } else if (search.mainIndex.getIndexName().length === 0) {
        // If the main index has no name, we get the scoped results from
        // the first child index instead.
        const childIndex = search.mainIndex.getWidgets().find(isIndexWidget);
        childIndex &&
          setSearchResults({
            results: getIndexSearchResults(searchIndex).results,
            scopedResults: childIndex.getScopedResults(),
          });
      }
    }

    search.addListener('render', handleRender);

    return () => {
      search.removeListener('render', handleRender);
    };
  }, [search, searchIndex]);

  return searchResults;
}
