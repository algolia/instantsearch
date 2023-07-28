import React from 'react';
import { useInstantSearch } from 'react-instantsearch';
import './Refresh.css';

export function Refresh() {
  const { refresh } = useInstantSearch();

  return (
    <button
      className="Refresh"
      type="button"
      onClick={() => {
        refresh();
      }}
    >
      <svg
        fill="none"
        viewBox="0 0 24 24"
        style={{
          width: '1rem',
          height: '1rem',
        }}
        stroke="currentColor"
        strokeWidth={2}
      >
        <title>Refresh the search results</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
}
