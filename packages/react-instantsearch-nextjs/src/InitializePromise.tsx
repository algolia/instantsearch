import { getInitialResults } from 'instantsearch.js/es/lib/server';
import { resetWidgetId, walkIndex } from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import React, { useContext } from 'react';
import {
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

import { htmlEscapeJsonString } from './htmlEscape';

import type { SearchOptions } from 'instantsearch.js';

export function InitializePromise() {
  const search = useInstantSearchContext();
  const waitForResultsRef = useRSCContext();
  const insertHTML =
    useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  // Extract search parameters from the search client to use them
  // later during hydration.
  let requestParamsList: SearchOptions[];
  search.mainHelper!.setClient({
    ...search.mainHelper!.getClient(),
    search(queries) {
      requestParamsList = queries.map(({ params }) => params!);
      return search.client.search(queries);
    },
  });

  resetWidgetId();

  const waitForResults = () =>
    new Promise<void>((resolve) => {
      let searchReceived = false;
      let recommendReceived = false;
      search.mainHelper!.derivedHelpers[0].once('result', () => {
        searchReceived = true;
        if (!search._hasRecommendWidget || recommendReceived) {
          resolve();
        }
      });
      search.mainHelper!.derivedHelpers[0].once('recommend:result', () => {
        recommendReceived = true;
        if (!search._hasSearchWidget || searchReceived) {
          resolve();
        }
      });
    });

  const injectInitialResults = () => {
    let inserted = false;
    const results = getInitialResults(search.mainIndex, requestParamsList);
    insertHTML(() => {
      if (inserted) {
        return <></>;
      }
      inserted = true;
      return (
        <script
          dangerouslySetInnerHTML={{
            __html: `window[Symbol.for("InstantSearchInitialResults")] = ${htmlEscapeJsonString(
              JSON.stringify(results)
            )}`,
          }}
        />
      );
    });
  };

  if (waitForResultsRef?.current === null) {
    waitForResultsRef.current = wrapPromiseWithState(
      waitForResults()
        .then(() => {
          let shouldRefetch = false;
          walkIndex(search.mainIndex, (index) => {
            shouldRefetch = index
              .getWidgets()
              .some((widget) => widget.$$type === 'ais.dynamicWidgets');
          });

          if (shouldRefetch) {
            waitForResultsRef.current = wrapPromiseWithState(
              waitForResults().then(injectInitialResults)
            );
          }

          return shouldRefetch;
        })
        .then((shouldRefetch) => {
          if (shouldRefetch) {
            return;
          }
          injectInitialResults();
        })
    );
  }

  return null;
}
