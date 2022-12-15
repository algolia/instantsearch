import React from 'react';
import { connectCurrentRefinements } from 'react-instantsearch-dom';

const ClearFiltersMobile = ({ items, refine, containerRef }) => {
  function onClick() {
    refine(items);
    document.body.classList.remove('filtering');
    containerRef.current.scrollIntoView();
  }

  return (
    <div className="ais-ClearRefinements">
      <button className="ais-ClearRefinements-button" onClick={onClick}>
        Reset filters
      </button>
    </div>
  );
};

export default connectCurrentRefinements(ClearFiltersMobile);
