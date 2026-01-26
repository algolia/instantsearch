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

const SSR_TIMEOUT_MS = 30000;

export function InitializePromise({ nonce }: InitializePromiseProps) {
  const search = useInstantSearchContext();
  const { waitForResultsRef } = useRSCContext();
  const insertHTML =
    useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  let requestParamsList: SearchOptions[];
  let ssrSearchFailed = false;

  const handleResponse = (response: any) => {
    if (!response || !('results' in response)) {
      ssrSearchFailed = true;
      return { results: [] };
    }
    return response;
  };

  const handleError = () => {
    ssrSearchFailed = true;
    return { results: [] };
  };

  if (search.compositionID) {
    search.mainHelper!.setClient({
      ...search.mainHelper!.getClient(),
      search(query) {
        requestParamsList = [query.requestBody.params];
        return (search.client as CompositionClient)
          .search(query)
          .then(handleResponse)
          .catch(handleError);
      },
    } as CompositionClient);
  } else {
    search.mainHelper!.setClient({
      ...search.mainHelper!.getClient(),
      search(queries) {
        requestParamsList = queries.map(({ params }) => params);
        return (search.client as SearchClient)
          .search(queries)
          .then(handleResponse)
          .catch(handleError);
      },
    } as SearchClient);
  }

  resetWidgetId();

  const waitForResults = () =>
    new Promise<void>((resolve, reject) => {
      let searchReceived = false;
      let recommendReceived = false;
      let isSettled = false;

      const helper = search.mainHelper!;
      const derivedHelper = helper.derivedHelpers[0];

      const timeout = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          reject(new Error('InstantSearch SSR timeout'));
        }
      }, SSR_TIMEOUT_MS);

      const settle = (error?: unknown) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeout);

        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };

      derivedHelper.once('result', () => {
        searchReceived = true;
        if (!search._hasRecommendWidget || recommendReceived) {
          settle();
        }
      });

      derivedHelper.once('recommend:result', () => {
        recommendReceived = true;
        if (!search._hasSearchWidget || searchReceived) {
          settle();
        }
      });

      helper.on('error', settle);
      search.on('error', settle);
      helper.derivedHelpers.forEach((dh) => dh.on('error', settle));
    });

  const injectInitialResults = () => {
    if (ssrSearchFailed) return;

    try {
      const options = { inserted: false };
      const results = getInitialResults(search.mainIndex, requestParamsList);
      insertHTML(createInsertHTML({ options, results, nonce }));
    } catch {
      // Silently fail - SSR results are optional
    }
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
              waitForResults()
                .then(injectInitialResults)
                .catch(() => {
                  // Silently fail on refetch errors
                })
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
        .catch(() => {
          // Silently fail - allows app to continue without SSR results
        })
    );
  }

  return null;
}
