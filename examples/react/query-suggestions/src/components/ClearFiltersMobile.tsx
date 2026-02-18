import React from 'react';
import { useClearRefinements } from 'react-instantsearch';

export function ClearFiltersMobile() {
  const { refine } = useClearRefinements();

  function onClick() {
    refine();
    document.body.classList.remove('filtering');
  }

  return (
    <div className="ais-ClearRefinements">
      <button className="ais-ClearRefinements-button" onClick={onClick}>
        Reset filters
      </button>
    </div>
  );
}
