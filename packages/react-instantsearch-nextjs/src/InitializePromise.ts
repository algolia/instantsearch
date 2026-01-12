import {
  getInitialResults,
  waitForResults,
} from 'instantsearch.js/es/lib/server';
import { resetWidgetId, walkIndex } from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';
import {
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

import { createInsertHTML } from './createInsertHTML';

import type { SearchOptions } from 'instantsearch.js';

const MAX_REFETCH_ATTEMPTS = 2;

type InitializePromiseProps = {
  /**
   * The nonce to use for the injected script tag.
   *
   * @see https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy#nonces
   */
  nonce?: string;
};

/**
 * Handles server-side rendering of InstantSearch results in Next.js App Router.
 * Waits for results, checks for dynamic widgets, and injects initial state for hydration.
 *
 * @internal This component is used internally by InstantSearchNext
 */
export function InitializePromise({ nonce }: InitializePromiseProps): null {
  const search = useInstantSearchContext();
  const rscContext = useRSCContext();
  const insertHTMLContext = useContext(ServerInsertedHTMLContext);

  const initializationStartedRef = useRef(false);
  const hasInjectedRef = useRef(false);
  const searchInstanceRef = useRef(search);
  const isProcessingRef = useRef(false);
  const refetchAttemptsRef = useRef(0);

  useEffect(() => {
    if (!rscContext?.waitForResultsRef) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'InitializePromise: waitForResultsRef is not available. Make sure InstantSearchRSCContext is properly configured.'
        );
      }
      return;
    }

    if (!insertHTMLContext) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'InitializePromise: ServerInsertedHTMLContext is not available. This component must be used within Next.js App Router.'
        );
      }
      return;
    }

    const { waitForResultsRef } = rscContext;
    const insertHTML = insertHTMLContext;

    const searchInstanceChanged = searchInstanceRef.current !== search;
    if (searchInstanceChanged) {
      initializationStartedRef.current = false;
      hasInjectedRef.current = false;
      isProcessingRef.current = false;
      refetchAttemptsRef.current = 0;
      searchInstanceRef.current = search;
    }

    if (
      initializationStartedRef.current ||
      waitForResultsRef.current !== null ||
      isProcessingRef.current
    ) {
      return;
    }

    initializationStartedRef.current = true;
    isProcessingRef.current = true;

    const abortController = new AbortController();
    let cleanedUp = false;

    resetWidgetId();

    const injectInitialResults = (
      requestParamsList: SearchOptions[]
    ): boolean => {
      if (
        hasInjectedRef.current ||
        abortController.signal.aborted ||
        cleanedUp
      ) {
        return false;
      }

      try {
        const options = { inserted: false };
        const results = getInitialResults(search.mainIndex, requestParamsList);
        insertHTML(createInsertHTML({ options, results, nonce }));
        hasInjectedRef.current = true;
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(
            'InitializePromise: Failed to inject initial results',
            error
          );
        }
        return false;
      }
    };

    const checkForDynamicWidgets = (): boolean => {
      if (abortController.signal.aborted || cleanedUp) {
        return false;
      }

      try {
        let hasDynamicWidgets = false;
        walkIndex(search.mainIndex, (index) => {
          const widgets = index.getWidgets();
          hasDynamicWidgets =
            hasDynamicWidgets ||
            widgets.some((widget) => widget.$$type === 'ais.dynamicWidgets');
        });
        return hasDynamicWidgets;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(
            'InitializePromise: Error checking for dynamic widgets',
            error
          );
        }
        return false;
      }
    };

    const initializeResults = async (): Promise<void> => {
      if (abortController.signal.aborted || cleanedUp) {
        return;
      }

      try {
        const requestParamsList = await waitForResults(search);

        if (abortController.signal.aborted || cleanedUp) {
          return;
        }

        const shouldRefetch = checkForDynamicWidgets();

        if (shouldRefetch) {
          if (refetchAttemptsRef.current >= MAX_REFETCH_ATTEMPTS) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `InitializePromise: Maximum refetch attempts (${MAX_REFETCH_ATTEMPTS}) reached. Using initial results.`
              );
            }
            injectInitialResults(requestParamsList);
            return;
          }

          refetchAttemptsRef.current += 1;

          if (typeof search._resetScheduleSearch === 'function') {
            try {
              search._resetScheduleSearch();
            } catch (resetError) {
              if (process.env.NODE_ENV === 'development') {
                console.warn(
                  'InitializePromise: Failed to reset search schedule',
                  resetError
                );
              }
            }
          }

          if (abortController.signal.aborted || cleanedUp) {
            return;
          }

          try {
            const refetchedParamsList = await waitForResults(search);

            if (abortController.signal.aborted || cleanedUp) {
              return;
            }

            if (!injectInitialResults(refetchedParamsList)) {
              injectInitialResults(requestParamsList);
            }
          } catch (refetchError) {
            if (process.env.NODE_ENV === 'development') {
              console.error(
                'InitializePromise: Error during refetch',
                refetchError
              );
            }
            injectInitialResults(requestParamsList);
          }
        } else {
          injectInitialResults(requestParamsList);
        }
      } finally {
        isProcessingRef.current = false;
      }
    };

    if (!abortController.signal.aborted && !cleanedUp) {
      waitForResultsRef.current = wrapPromiseWithState(initializeResults());
    }

    return () => {
      cleanedUp = true;
      abortController.abort();
    };
  }, [search, rscContext, insertHTMLContext, nonce]);

  return null;
}
