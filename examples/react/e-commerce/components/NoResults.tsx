import React from 'react';
import { useInstantSearch } from 'react-instantsearch';

import { ClearFilters } from './ClearFilters';

export function NoResults() {
  const { results } = useInstantSearch();

  const hasRefinements = results.getRefinements().length > 0;
  const description = hasRefinements
    ? 'Try to reset your applied filters.'
    : 'Please try another query.';

  return (
    <div className="hits-empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="138"
        height="138"
        className="hits-empty-state-image"
      >
        <defs>
          <linearGradient id="c" x1="50%" x2="50%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="#F5F5FA" />
            <stop offset="100%" stopColor="#FFF" />
          </linearGradient>
          <path
            id="b"
            d="M68.71 114.25a45.54 45.54 0 1 1 0-91.08 45.54 45.54 0 0 1 0 91.08z"
          />
          <filter
            id="a"
            width="140.6%"
            height="140.6%"
            x="-20.3%"
            y="-15.9%"
            filterUnits="objectBoundingBox"
          >
            <feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
            <feGaussianBlur
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
              stdDeviation="5.5"
            />
            <feColorMatrix
              in="shadowBlurOuter1"
              result="shadowMatrixOuter1"
              values="0 0 0 0 0.145098039 0 0 0 0 0.17254902 0 0 0 0 0.380392157 0 0 0 0.15 0"
            />
            <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter2" />
            <feGaussianBlur
              in="shadowOffsetOuter2"
              result="shadowBlurOuter2"
              stdDeviation="1.5"
            />
            <feColorMatrix
              in="shadowBlurOuter2"
              result="shadowMatrixOuter2"
              values="0 0 0 0 0.364705882 0 0 0 0 0.392156863 0 0 0 0 0.580392157 0 0 0 0.2 0"
            />
            <feMerge>
              <feMergeNode in="shadowMatrixOuter1" />
              <feMergeNode in="shadowMatrixOuter2" />
            </feMerge>
          </filter>
        </defs>
        <g fill="none" fillRule="evenodd">
          <circle
            cx="68.85"
            cy="68.85"
            r="68.85"
            fill="#5468FF"
            opacity=".07"
          />
          <circle
            cx="68.85"
            cy="68.85"
            r="52.95"
            fill="#5468FF"
            opacity=".08"
          />
          <use fill="#000" filter="url(#a)" xlinkHref="#b" />
          <use fill="url(#c)" xlinkHref="#b" />
          <path
            d="M76.01 75.44c5-5 5.03-13.06.07-18.01a12.73 12.73 0 0 0-18 .07c-5 4.99-5.03 13.05-.07 18a12.73 12.73 0 0 0 18-.06zm2.5 2.5a16.28 16.28 0 0 1-23.02.09A16.29 16.29 0 0 1 55.57 55a16.28 16.28 0 0 1 23.03-.1 16.28 16.28 0 0 1-.08 23.04zm1.08-1.08l-2.15 2.16 8.6 8.6 2.16-2.15-8.6-8.6z"
            fill="#5369FF"
          />
        </g>
      </svg>

      <p className="hits-empty-state-title">
        Sorry, we can&apos;t find any matches to your query!
      </p>
      <p className="hits-empty-state-description">{description}</p>

      <ClearFilters />
    </div>
  );
}
