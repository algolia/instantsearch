import React from 'react';

import { cx } from './lib/cx';

export type StatsTranslations = (
  nbHits: number,
  processingTimeMS: number,
  nbSortedHits?: number,
  areHitsSorted?: boolean
) => string;

export type StatsProps = React.ComponentProps<'div'> & {
  nbHits: number;
  processingTimeMS: number;
  nbSortedHits?: number;
  areHitsSorted?: boolean;
  classNames?: Partial<StatsClassNames>;
  translations?: StatsTranslations;
};

export type StatsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
};

export function Stats({
  classNames = {},
  nbHits,
  processingTimeMS,
  nbSortedHits,
  areHitsSorted,
  translations,
  ...props
}: StatsProps) {
  const translation =
    areHitsSorted && nbHits !== nbSortedHits
      ? `${nbSortedHits!.toLocaleString()} relevant results sorted out of ${nbHits.toLocaleString()} found in ${processingTimeMS.toLocaleString()}ms`
      : `${nbHits.toLocaleString()} results found in ${processingTimeMS.toLocaleString()}ms`;

  return (
    <div
      {...props}
      className={cx('ais-Stats', classNames.root, props.className)}
    >
      <span className="ais-Stats-text">
        {translations
          ? translations(nbHits, processingTimeMS, nbSortedHits, areHitsSorted)
          : translation}
      </span>
    </div>
  );
}
