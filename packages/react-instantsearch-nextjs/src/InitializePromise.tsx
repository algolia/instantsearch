import { getInitialResults } from 'instantsearch.js/es/lib/server';
import { walkIndex } from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import React, { useContext } from 'react';
import {
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

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
  let requestParamsList: Array<SearchOptions | undefined>;
  search.mainHelper!.setClient({
    search(queries, requestOptions) {
      requestParamsList = queries.map(({ params }) => params);
      return search.client.search(queries, requestOptions);
    },
  });

  const waitForResults = () =>
    new Promise<void>((resolve) => {
      search.mainHelper!.derivedHelpers[0].on('result', () => {
        resolve();
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
            __html: `window[Symbol.for("InstantSearchInitialResults")] = ${JSON.stringify(
              results
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
