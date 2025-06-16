import React from 'react';

import { htmlEscapeJsonString } from './htmlEscape';

import type { InitialResults } from 'instantsearch.js';

export const createInsertHTML =
  ({
    options,
    results,
    nonce,
  }: {
    options: { inserted: boolean };
    results: InitialResults;
    nonce?: string;
  }) =>
  () => {
    if (options.inserted) {
      return <></>;
    }
    options.inserted = true;
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
  };
