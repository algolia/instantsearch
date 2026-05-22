import React from 'react';

import { htmlEscapeJsonString } from './htmlEscape';

import type { InitialResults } from 'instantsearch.js';

export const createInsertHTML =
  ({
    options,
    results,
    chatStates,
    nonce,
  }: {
    options: { inserted: boolean };
    results: InitialResults;
    chatStates?: Record<string, unknown[]>;
    nonce?: string;
  }) =>
  () => {
    if (options.inserted) {
      return <></>;
    }
    options.inserted = true;
    return (
      <>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window[Symbol.for("InstantSearchInitialResults")] = ${htmlEscapeJsonString(
              JSON.stringify(results)
            )}`,
          }}
        />
        {chatStates ? (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window[Symbol.for("InstantSearchInitialChatStates")] = ${htmlEscapeJsonString(
                JSON.stringify(chatStates)
              )}`,
            }}
          />
        ) : null}
      </>
    );
  };
