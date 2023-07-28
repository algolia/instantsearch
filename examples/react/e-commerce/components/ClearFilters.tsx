import React from 'react';
import { useClearRefinements } from 'react-instantsearch-hooks-web';

export function ClearFilters() {
  const { refine, canRefine } = useClearRefinements();

  return (
    <div className="ais-ClearRefinements">
      <button
        className={`ais-ClearRefinements-button ${
          !canRefine ? 'ais-ClearRefinements-button--disabled' : ''
        }`}
        disabled={!canRefine}
        type="button"
        onClick={refine}
      >
        <div className="clear-filters">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 11 11"
          >
            <g fill="none" fillRule="evenodd">
              <path d="M0 0h11v11H0z" />
              <path
                fill="#000"
                fillRule="nonzero"
                d="M8.26 2.75a3.896 3.896 0 1 0 1.102 3.262l.007-.056a.49.49 0 0 1 .485-.456c.253 0 .451.206.437.457 0 0 .012-.109-.006.061a4.813 4.813 0 1 1-1.348-3.887v-.987a.458.458 0 1 1 .917.002v2.062a.459.459 0 0 1-.459.459H7.334a.458.458 0 1 1-.002-.917h.928z"
              />
            </g>
          </svg>
          Clear filters
        </div>
      </button>
    </div>
  );
}
