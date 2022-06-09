import { useConnector } from '../hooks/useConnector';

import type { SearchResults } from 'algoliasearch-helper';
import type { Connector, ScopedResult } from 'instantsearch.js';

export type SearchResultsRenderState = {
  results: SearchResults<any>;
  scopedResults: ScopedResult[];
};

type SearchResultsWidgetDescription = {
  $$type: 'ais.searchResults';
  renderState: SearchResultsRenderState;
};

const connectSearchResults: Connector<SearchResultsWidgetDescription, never> = (
  renderFn
) => {
  return (widgetParams) => {
    return {
      $$type: 'ais.searchResults',
      getWidgetRenderState({ results, scopedResults }) {
        return {
          results: results!,
          scopedResults,
          widgetParams,
        };
      },
      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState!(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },
      dispose() {},
    };
  };
};

export function useSearchResults() {
  return useConnector(connectSearchResults);
}
