import React, { useContext, use } from 'react';
import { useInstantSearch, InstantSearchRSCContext } from 'react-instantsearch';

export function QueryId() {
  const { results } = useInstantSearch();
  const { waitForResultsRef } = useContext(InstantSearchRSCContext);

  if (waitForResultsRef?.current) {
    use(waitForResultsRef.current);
    use(waitForResultsRef.current);
  }

  return <div id="query-id">{results.queryID}</div>;
}
