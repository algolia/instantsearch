import { getInitialResults } from 'instantsearch.js/es/lib/server';
import { resetWidgetId, walkIndex } from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import { useContext } from 'react';
import {
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

import { createInsertHTML } from './createInsertHTML';

import type {
  SearchOptions,
  CompositionClient,
  SearchClient,
} from 'instantsearch.js';

type InitializePromiseProps = {
  /**
   * The nonce to use for the injected script tag.
   *
   * @see https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy#nonces
   */
  nonce?: string;
};

export function InitializePromise({ nonce }: InitializePromiseProps) {
  const search = useInstantSearchContext();
  const { waitForResultsRef } = useRSCContext();
  const insertHTML =
    useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  // Extract search parameters from the search client to use them
  // later during hydration.
  let requestParamsList: SearchOptions[];

  if (search.compositionID) {
    search.mainHelper!.setClient({
      ...search.mainHelper!.getClient(),
      search(query) {
        requestParamsList = [query.requestBody.params];
        return (search.client as CompositionClient).search(query);
      },
    } as CompositionClient);
  } else {
    search.mainHelper!.setClient({
      ...search.mainHelper!.getClient(),
      search(queries) {
        requestParamsList = queries.map(({ params }) => params);
        return (search.client as SearchClient).search(queries);
      },
    } as SearchClient);
  }

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
    const options = { inserted: false };
    const results = getInitialResults(search.mainIndex, requestParamsList);
    insertHTML(createInsertHTML({ options, results, nonce }));
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
            search._resetScheduleSearch?.();
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
