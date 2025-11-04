import React, { useContext, use } from 'react';
import { useInstantSearch, InstantSearchRSCContext } from 'react-instantsearch';

export function QueryId() {
  const { results } = useInstantSearch();
  const { waitForResultsRef } = useContext(InstantSearchRSCContext);

  const promise = waitForResultsRef?.current;
  if (promise) {
    use(promise);
    use(promise);
  }

  return <div id="query-id">{results.queryID}</div>;
}
