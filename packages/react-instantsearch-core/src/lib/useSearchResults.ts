import { useEffect, useRef, useState } from 'react';

import { dequal } from './dequal';
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
  const [searchResults, setSearchResults] = useState(() =>
    getIndexSearchResults(searchIndex)
  );
  const _scopedResultsRef = useRef(searchResults.scopedResults);

  useEffect(() => {
    function handleRender() {
      const results = searchIndex.getResults();
      const scopedResults = searchIndex.getScopedResults();

      // Results can be `null` when the first search is stalled.
      // In this case, we skip the update.
      // See: https://github.com/algolia/instantsearch/blob/20996c7a159988c58e00ff24d2d2dc98af8b980f/src/widgets/index/index.ts#L652-L657
      console.log('useSearchResults() > handleRender()');
      if (
        results !== null &&
        !dequal(scopedResults, _scopedResultsRef.current)
      ) {
        console.log('useSearchResults() > handleRender() > setState()');
        _scopedResultsRef.current = scopedResults;
        setSearchResults({
          results,
          scopedResults,
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
