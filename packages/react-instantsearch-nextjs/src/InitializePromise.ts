import { getInitialResults } from 'instantsearch-core';
import { isTwoPassWidget, walkIndex, resetWidgetId } from 'instantsearch-core';
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
} from 'instantsearch-core';

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
    search.helper!.setClient({
      ...search.helper!.getClient(),
      search(query) {
        requestParamsList = [query.requestBody.params];
        return (search.client as CompositionClient).search(query);
      },
    } as CompositionClient);
  } else {
    search.helper!.setClient({
      ...search.helper!.getClient(),
      search(queries) {
        requestParamsList = queries.map(({ params }) => params);
        return (search.client as SearchClient).search(queries);
      },
    } as SearchClient);
  }

  resetWidgetId();

  const waitForResults = () =>
    new Promise<void>((resolve, reject) => {
      let searchReceived = false;
      let recommendReceived = false;
      let settled = false;
      const helper = search.helper!;
      const derivedHelper = helper.derivedHelpers[0];
      const settle = (error?: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        if (resolveWaitForResultsRef) {
          resolveWaitForResultsRef.current = null;
        }
        derivedHelper.removeListener('result', onResult);
        derivedHelper.removeListener('recommend:result', onRecommendResult);
        helper.removeListener('error', onError);
        search.removeListener('error', onError);
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      // A failed search or Recommend request never emits a result, so the
      // promise would stay pending.
      const onError = (error: Error) => {
        settle(error);
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
          settle();
        };
      }

      derivedHelper.once('result', onResult);
      derivedHelper.once('recommend:result', onRecommendResult);
      helper.on('error', onError);
      search.on('error', onError);
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
