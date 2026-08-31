import {
  useInstantSearchContext,
  useRSCContext,
} from 'react-instantsearch-core';

export function TriggerSearch() {
  const instantsearch = useInstantSearchContext();
  const { waitForResultsRef, resolveWaitForResultsRef } = useRSCContext();

  if (waitForResultsRef?.current?.status === 'pending') {
    if (instantsearch._hasSearchWidget) {
      if (instantsearch.compositionID) {
        instantsearch.mainHelper?.searchWithComposition();
      } else {
        instantsearch.mainHelper?.searchOnlyWithDerivedHelpers();
      }
    }
    instantsearch._hasRecommendWidget && instantsearch.mainHelper?.recommend();

    if (!instantsearch._hasSearchWidget && !instantsearch._hasRecommendWidget) {
      resolveWaitForResultsRef?.current?.();
    }
  }

  return null;
}
