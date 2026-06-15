import { getInitialResults as getInstantSearchInitialResults } from 'instantsearch.js/es/lib/server';
import {
  isTwoPassWidget,
  resetWidgetId,
  walkIndex,
} from 'instantsearch.js/es/lib/utils';

import type {
  CompositionClient,
  InitialResults,
  InstantSearch,
  SearchClient,
  SearchOptions,
} from 'instantsearch.js';

export type ServerSearchExecutionOptions = {
  skipRecommend?: boolean;
};

type InternalInstantSearch = InstantSearch & {
  _resetScheduleSearch?: () => void;
};

export function resetServerSearchWidgetIds() {
  resetWidgetId();
}

export function createServerSearchExecution(search: InstantSearch) {
  const helper = search.mainHelper!;
  const client = helper.getClient();

  let isClientPatched = false;
  let requestParamsList: SearchOptions[] | undefined;

  function patchSearchClient() {
    if (isClientPatched) {
      return;
    }

    if (search.compositionID) {
      helper.setClient({
        ...client,
        search(query) {
          requestParamsList = [query.requestBody.params];
          return (client as CompositionClient).search(query);
        },
      } as CompositionClient);
    } else {
      helper.setClient({
        ...client,
        search(queries) {
          requestParamsList = queries.map(({ params }) => params);
          return (client as SearchClient).search(queries);
        },
      } as SearchClient);
    }

    isClientPatched = true;
  }

  return {
    resetWidgetIds() {
      resetServerSearchWidgetIds();
    },

    prepare({
      skipRecommend = false,
    }: ServerSearchExecutionOptions = {}): Promise<
      SearchOptions[] | undefined
    > {
      requestParamsList = undefined;
      patchSearchClient();

      return new Promise((resolve, reject) => {
        let searchResultsReceived = false;
        let recommendResultsReceived = false;

        helper.derivedHelpers[0].once('result', () => {
          searchResultsReceived = true;
          if (
            !search._hasRecommendWidget ||
            skipRecommend ||
            recommendResultsReceived
          ) {
            resolve(requestParamsList);
          }
        });

        helper.derivedHelpers[0].once('recommend:result', () => {
          recommendResultsReceived = true;
          if (!search._hasSearchWidget || searchResultsReceived) {
            resolve(requestParamsList);
          }
        });

        helper.once('error', reject);
        search.once('error', reject);
        helper.derivedHelpers.forEach((derivedHelper) =>
          derivedHelper.once('error', reject)
        );
      });
    },

    trigger({ skipRecommend = false }: ServerSearchExecutionOptions = {}) {
      if (search._hasSearchWidget) {
        if (search.compositionID) {
          helper.searchWithComposition();
        } else {
          helper.searchOnlyWithDerivedHelpers();
        }
      }

      if (!skipRecommend && search._hasRecommendWidget) {
        helper.recommend();
      }
    },

    hasSearchOrRecommendWidgets() {
      return search._hasSearchWidget || search._hasRecommendWidget;
    },

    hasTwoPassWidgets() {
      let hasTwoPassWidgets = false;

      walkIndex(search.mainIndex, (index) => {
        hasTwoPassWidgets =
          hasTwoPassWidgets || index.getWidgets().some(isTwoPassWidget);
      });

      return hasTwoPassWidgets;
    },

    resetScheduleSearch() {
      (search as InternalInstantSearch)._resetScheduleSearch?.();
    },

    getInitialResults(
      paramsList?: SearchOptions[] | undefined
    ): InitialResults {
      return getInstantSearchInitialResults(search.mainIndex, paramsList);
    },
  };
}
