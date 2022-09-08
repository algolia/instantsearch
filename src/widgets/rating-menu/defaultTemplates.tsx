/** @jsx h */
import { h } from 'preact';

import type { ComponentChild } from 'preact';
import type {
  RatingMenuComponentTemplates,
  RatingMenuCSSClasses,
} from './rating-menu';
import { formatNumber } from '../../lib/formatNumber';
import { cx } from '../../lib/utils';

type ItemWrapperProps = { children: ComponentChild } & {
  value: string;
  count: number;
  url: string;
  cssClasses: RatingMenuCSSClasses;
};

function ItemWrapper({
  children,
  count,
  value,
  url,
  cssClasses,
}: ItemWrapperProps) {
  if (count) {
    return (
      <a
        className={cx(cssClasses.link)}
        aria-label={`${value} & up`}
        href={url}
      >
        {children}
      </a>
    );
  }

  return (
    <div className={cx(cssClasses.link)} aria-label={`${value} & up`} disabled>
      {children}
    </div>
  );
}

const defaultTemplates: RatingMenuComponentTemplates = {
  item({ count, value, url, stars, cssClasses }) {
    return (
      <ItemWrapper
        count={count}
        value={value}
        url={url}
        cssClasses={cssClasses}
      >
        {stars.map((isFull, index) => (
          <svg
            key={index}
            className={cx([
              cx(cssClasses.starIcon),
              cx(isFull ? cssClasses.fullStarIcon : cssClasses.emptyStarIcon),
            ])}
            aria-hidden="true"
            width="24"
            height="24"
          >
            <use
              xlinkHref={
                isFull
                  ? '#ais-RatingMenu-starSymbol'
                  : '#ais-RatingMenu-starEmptySymbol'
              }
            />
          </svg>
        ))}
        <span className={cx(cssClasses.label)}>&amp; Up</span>
        {count && (
          <span className={cx(cssClasses.count)}>{formatNumber(count)}</span>
        )}
      </ItemWrapper>
    );
  },
};

export default defaultTemplates;
