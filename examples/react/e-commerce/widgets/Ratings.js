import React from 'react';
import { connectRange } from 'react-instantsearch-dom';
import cx from 'classnames';

const Ratings = ({ currentRefinement, refine, createURL, count }) => {
  const ratings = new Array(4).fill(null).map((_, ratingIndex) => {
    const value = 4 - ratingIndex;

    const itemsCount = count
      .filter((countObj) => value <= parseInt(countObj.value, 10))
      .map((countObj) => countObj.count)
      .reduce((sum, currentCount) => sum + currentCount, 0);

    return {
      value,
      count: itemsCount,
    };
  });
  const stars = new Array(5).fill(null);

  return (
    <div className="ais-RatingMenu">
      <ul className="ais-RatingMenu-list">
        {ratings.map((rating, ratingIndex) => {
          const isRatingSelected =
            ratings.every(
              (currentRating) => currentRating.value !== currentRefinement.min
            ) || rating.value === currentRefinement.min;

          return (
            <li
              className={cx('ais-RatingMenu-item', {
                'ais-RatingMenu-item--selected': isRatingSelected,
                'ais-RatingMenu-item--disabled': rating.count === 0,
              })}
              key={rating.value}
            >
              <a
                className="ais-RatingMenu-link"
                aria-label={`${rating.value} & up`}
                href={createURL(rating.value)}
                onClick={(event) => {
                  event.preventDefault();

                  if (currentRefinement.min === rating.value) {
                    refine({ min: 0 });
                  } else {
                    refine({ min: rating.value });
                  }
                }}
              >
                {stars.map((_, starIndex) => {
                  const starNumber = starIndex + 1;
                  const isStarFull = starNumber < 5 - ratingIndex;

                  return (
                    <svg
                      key={starIndex}
                      className={cx('ais-RatingMenu-starIcon', {
                        'ais-RatingMenu-starIcon--full': isStarFull,
                        'ais-RatingMenu-starIcon--empty': !isStarFull,
                      })}
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
};

export default connectRange(Ratings);
