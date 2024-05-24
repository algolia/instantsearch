import {
  useInstantSearchContext,
  useRSCContext,
} from 'react-instantsearch-core';

export function TriggerSearch() {
  const instantsearch = useInstantSearchContext();
  const waitForResultsRef = useRSCContext();

  if (waitForResultsRef?.current?.status === 'pending') {
    instantsearch._hasSearchWidget &&
      instantsearch.mainHelper?.searchOnlyWithDerivedHelpers();
    instantsearch._hasRecommendWidget && instantsearch.mainHelper?.recommend();
  }

  return null;
}
