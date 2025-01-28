import {
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
} from 'instantsearch-core';
import { connectRatingMenu } from 'instantsearch.js/es/connectors';
import React from 'react';
import { useConnector } from 'react-instantsearch';

import { cx } from '../utils';

export function Ratings({ attribute }: { attribute: string }) {
  const { refine, items, createURL } = useConnector<
    RatingMenuConnectorParams,
    RatingMenuWidgetDescription
  >(
    connectRatingMenu,
    { attribute },
    { $$widgetType: 'e-commerce.ratingMenu' }
  );

  return (
    <div className="ais-RatingMenu">
      <ul className="ais-RatingMenu-list">
        {items.map((rating) => {
          return (
            <li
              className={cx(
                'ais-RatingMenu-item',
                rating.isRefined && 'ais-RatingMenu-item--selected',
                rating.count === 0 && 'ais-RatingMenu-item--disabled'
              )}
              key={rating.value}
            >
              <a
                className="ais-RatingMenu-link"
                aria-label={`${rating.value} & up`}
                href={createURL(rating.value)}
                onClick={(event) => {
                  event.preventDefault();

                  refine(rating.value);
                }}
              >
                {rating.stars.map((isStarFull, starIndex) => {
                  return (
                    <svg
                      key={starIndex}
                      className={cx(
                        'ais-RatingMenu-starIcon',
                        isStarFull
                          ? 'ais-RatingMenu-starIcon--full'
                          : 'ais-RatingMenu-starIcon--empty'
                      )}
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"
                      />
                    </svg>
                  );
                })}

                <span className="ais-RatingMenu-count">{rating.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
