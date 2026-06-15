import { ServerInsertedHTMLContext } from 'next/navigation';
import { useContext } from 'react';
import {
  __internal_createServerSearchExecution,
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
  const execution = __internal_createServerSearchExecution(search);

  execution.resetWidgetIds();

  const injectInitialResults = (requestParamsList?: SearchOptions[]) => {
    const options = { inserted: false };
    const results = execution.getInitialResults(requestParamsList);
    insertHTML(createInsertHTML({ options, results, nonce }));
  };

  if (waitForResultsRef?.current === null) {
    waitForResultsRef.current = wrapPromiseWithState(
      execution
        .prepare()
        .then((requestParamsList) => {
          const shouldRefetch = execution.hasTwoPassWidgets();

          if (shouldRefetch) {
            execution.resetScheduleSearch();
            waitForResultsRef.current = wrapPromiseWithState(
              execution.prepare().then(injectInitialResults)
            );
          }

          return { requestParamsList, shouldRefetch };
        })
        .then(({ requestParamsList, shouldRefetch }) => {
          if (shouldRefetch) {
            return;
          }
          injectInitialResults(requestParamsList);
        })
    );
  }

  return null;
}
