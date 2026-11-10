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
        instantsearch.helper?.searchWithComposition();
      } else {
        instantsearch.helper?.searchOnlyWithDerivedHelpers();
      }
    }
    instantsearch._hasRecommendWidget && instantsearch.helper?.recommend();

    if (!instantsearch._hasSearchWidget && !instantsearch._hasRecommendWidget) {
      resolveWaitForResultsRef?.current?.();
    }
  }

  return null;
}
