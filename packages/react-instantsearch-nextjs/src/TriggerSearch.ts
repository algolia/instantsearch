import { ServerInsertedHTMLContext } from 'next/navigation';
import { useContext } from 'react';
import {
  __internal_createServerSearchExecution,
  useInstantSearchContext,
  useRSCContext,
} from 'react-instantsearch-core';

import { createInsertHTML } from './createInsertHTML';

export function TriggerSearch({ nonce }: { nonce?: string }) {
  const instantsearch = useInstantSearchContext();
  const { waitForResultsRef } = useRSCContext();
  const insertHTML =
    useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  if (waitForResultsRef?.current?.status === 'pending') {
    const execution = __internal_createServerSearchExecution(instantsearch);

    execution.trigger();

    // If there are no widgets, we inject empty initial results instantly
    if (!execution.hasSearchOrRecommendWidgets()) {
      const options = { inserted: false };
      insertHTML(createInsertHTML({ options, results: {}, nonce }));
    }
  }

  return null;
}
