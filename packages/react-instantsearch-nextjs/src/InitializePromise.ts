import {
  getInitialResults,
  waitForResults,
} from 'instantsearch.js/es/lib/server';
import { resetWidgetId, walkIndex } from 'instantsearch.js/es/lib/utils';
import { ServerInsertedHTMLContext } from 'next/navigation';
import { useContext } from 'react';
import {
  useInstantSearchContext,
  useRSCContext,
  wrapPromiseWithState,
} from 'react-instantsearch-core';

import { createInsertHTML } from './createInsertHTML';

import type { SearchOptions } from 'instantsearch.js';

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

  resetWidgetId();

  const injectInitialResults = (requestParamsList: SearchOptions[]) => {
    const options = { inserted: false };
    const results = getInitialResults(search.mainIndex, requestParamsList);
    insertHTML(createInsertHTML({ options, results, nonce }));
  };

  if (waitForResultsRef?.current === null) {
    waitForResultsRef.current = wrapPromiseWithState(
      waitForResults(search).then((requestParamsList) => {
        let shouldRefetch = false;
        walkIndex(search.mainIndex, (index) => {
          shouldRefetch =
            shouldRefetch ||
            index
              .getWidgets()
              .some((widget) => widget.$$type === 'ais.dynamicWidgets');
        });

        if (shouldRefetch) {
          search._resetScheduleSearch?.();
          waitForResultsRef.current = wrapPromiseWithState(
            waitForResults(search).then(injectInitialResults)
          );
          return;
        }

        injectInitialResults(requestParamsList);
      })
    );
  }

  return null;
}
