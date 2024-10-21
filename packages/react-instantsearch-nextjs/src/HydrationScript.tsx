// @ts-expect-error
import React, { use } from 'react';
import { useRSCContext } from 'react-instantsearch-core';

import { htmlEscapeJsonString } from './htmlEscape';

import type { InitialResults } from 'instantsearch.js';

type HydrationScriptProps = {
  /**
   * The nonce to use for the injected script tag.
   *
   * @see https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy#nonces
   */
  nonce?: string;
  initialResults?: InitialResults;
};

export function HydrationScript({
  nonce,
  initialResults,
}: HydrationScriptProps) {
  const waitForResultsRef = useRSCContext();

  let results = initialResults;

  if (typeof window === 'undefined') {
    results = use(waitForResultsRef?.current);

    // If they're using dynamic widgets we return null results first
    if (!results) {
      results = use(waitForResultsRef?.current);
    }
  }

  if (!results) {
    return null;
  }

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `window[Symbol.for("InstantSearchInitialResults")] = ${htmlEscapeJsonString(
          JSON.stringify(results)
        )}`,
      }}
    />
  );
}
