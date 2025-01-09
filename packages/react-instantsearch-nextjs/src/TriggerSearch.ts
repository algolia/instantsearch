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
        instantsearch.helper?.searchWithComposition();
      } else {
        instantsearch.helper?.searchOnlyWithDerivedHelpers();
      }
    }
    if (instantsearch._hasRecommendWidget) {
      instantsearch.helper?.recommend();
    }
  }

  return null;
}
