import { cx } from 'instantsearch-ui-components';
import React from 'react';

export type StatsProps = React.ComponentProps<'div'> & {
  nbHits: number;
  processingTimeMS: number;
  nbSortedHits?: number;
  areHitsSorted?: boolean;
  classNames?: Partial<StatsClassNames>;
  translations: {
    rootElementText: StatsTranslations;
  };
};

export type StatsTranslationOptions = Pick<
  StatsProps,
  'nbHits' | 'processingTimeMS' | 'nbSortedHits' | 'areHitsSorted'
>;

export type StatsTranslations = (options: StatsTranslationOptions) => string;

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
  const translationOptions: StatsTranslationOptions = {
    nbHits,
    processingTimeMS,
    nbSortedHits,
    areHitsSorted,
  };

  return (
    <div
      {...props}
      className={cx('ais-Stats', classNames.root, props.className)}
    >
      <span className="ais-Stats-text">
        {translations.rootElementText(translationOptions)}
      </span>
    </div>
  );
}
