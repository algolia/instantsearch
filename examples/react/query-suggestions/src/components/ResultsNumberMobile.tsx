import React from 'react';
import { useInstantSearch } from 'react-instantsearch';

export function ResultsNumberMobile() {
  const { results } = useInstantSearch();
  const nbHits = results?.nbHits ?? 0;

  return (
    <div>
      <strong>{nbHits.toLocaleString()}</strong> results
    </div>
  );
}
