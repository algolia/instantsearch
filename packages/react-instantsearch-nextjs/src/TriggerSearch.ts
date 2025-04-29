import { ServerInsertedHTMLContext } from 'next/navigation';
import { useContext } from 'react';
import {
  useInstantSearchContext,
  useRSCContext,
} from 'react-instantsearch-core';

import { createInsertHTML } from './createInsertHTML';

export function TriggerSearch({ nonce }: { nonce?: string }) {
  const instantsearch = useInstantSearchContext();
  const waitForResultsRef = useRSCContext();
  const insertHTML =
    useContext(ServerInsertedHTMLContext) ||
    (() => {
      throw new Error('Missing ServerInsertedHTMLContext');
    });

  if (waitForResultsRef?.current?.status === 'pending') {
    if (instantsearch._hasSearchWidget) {
      if (instantsearch.compositionID) {
        instantsearch.mainHelper?.searchWithComposition();
      } else {
        instantsearch.mainHelper?.searchOnlyWithDerivedHelpers();
      }
    }
    instantsearch._hasRecommendWidget && instantsearch.mainHelper?.recommend();

    // If there are no widgets, we inject empty initial results instantly
    if (!instantsearch._hasSearchWidget && !instantsearch._hasRecommendWidget) {
      const options = { inserted: false };
      insertHTML(createInsertHTML({ options, results: {}, nonce }));
    }
  }

  return null;
}
