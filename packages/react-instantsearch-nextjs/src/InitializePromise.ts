import { getInitialResults } from 'instantsearch.js/es/lib/server';
import {
  isTwoPassWidget,
  walkIndex,
  resetWidgetId,
} from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import { useContext } from 'react';
import {
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

import { createInsertHTML } from './createInsertHTML';

import type {
  IndexWidget,
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

function isWithinIsolatedIndex(index: IndexWidget): boolean {
  let current: IndexWidget | null = index;

  while (current) {
    if (current._isolated) {
      return true;
    }
    current = current.getParent();
  }

  return false;
}

export function InitializePromise({ nonce }: InitializePromiseProps) {
  const search = useInstantSearchContext();
  const { waitForResultsRef, resolveWaitForResultsRef } = useRSCContext();
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
      let settled = false;
      const derivedHelper = search.mainHelper!.derivedHelpers[0];
      const settle = () => {
        if (settled) {
          return;
        }
        settled = true;
        if (resolveWaitForResultsRef) {
          resolveWaitForResultsRef.current = null;
        }
        resolve();
      };
      const onResult = () => {
        searchReceived = true;
        if (!search._hasRecommendWidget || recommendReceived) {
          settle();
        }
      };
      const onRecommendResult = () => {
        recommendReceived = true;
        if (!search._hasSearchWidget || searchReceived) {
          settle();
        }
      };

      if (resolveWaitForResultsRef) {
        resolveWaitForResultsRef.current = () => {
          derivedHelper.removeListener('result', onResult);
          derivedHelper.removeListener('recommend:result', onRecommendResult);
          settle();
        };
      }

      derivedHelper.once('result', onResult);
      derivedHelper.once('recommend:result', onRecommendResult);
    });

  const injectInitialResults = () => {
    const options = { inserted: false };
    const results = getInitialResults(
      search.mainIndex,
      search._hasSearchWidget ? requestParamsList || [] : []
    );
    insertHTML(createInsertHTML({ options, results, nonce }));
  };

  if (waitForResultsRef?.current === null) {
    waitForResultsRef.current = wrapPromiseWithState(
      waitForResults()
        .then(() => {
          let shouldRefetch = false;
          walkIndex(search.mainIndex, (index) => {
            if (isWithinIsolatedIndex(index)) {
              return;
            }
            shouldRefetch =
              shouldRefetch || index.getWidgets().some(isTwoPassWidget);
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
