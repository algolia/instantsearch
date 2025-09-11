import React from 'react';
import { useInstantSearch } from 'react-instantsearch';

import { formatNumber } from '../utils';

export function ResultsNumberMobile() {
  const {
    results: { nbHits },
  } = useInstantSearch();

  return (
    <div>
      <strong>{formatNumber(nbHits)}</strong> results
    </div>
  );
}
