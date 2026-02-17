import React from 'react';
import { useInstantSearch } from 'react-instantsearch';

export function SaveFiltersMobile({ onClick }: { onClick: () => void }) {
  const { results } = useInstantSearch();
  const nbHits = results?.nbHits ?? 0;

  return (
    <button className="button button-primary" onClick={onClick}>
      See {nbHits.toLocaleString()} results
    </button>
  );
}
