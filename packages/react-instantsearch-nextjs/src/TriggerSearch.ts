import {
  useInstantSearchContext,
  useRSCContext,
} from 'react-instantsearch-core';

export function TriggerSearch() {
  const instantsearch = useInstantSearchContext();
  const waitForResultsRef = useRSCContext();

  if (waitForResultsRef?.current?.status === 'pending') {
    if (instantsearch._hasSearchWidget) {
      if (instantsearch.compositionID) {
        instantsearch.mainHelper?.searchWithComposition();
      } else {
        instantsearch.mainHelper?.searchOnlyWithDerivedHelpers();
      }
    }
    instantsearch._hasRecommendWidget && instantsearch.mainHelper?.recommend();
  }

  return null;
}
