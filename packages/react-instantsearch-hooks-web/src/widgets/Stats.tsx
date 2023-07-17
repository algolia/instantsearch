import React from 'react';
import { useStats } from 'react-instantsearch-hooks';

import { Stats as StatsUiComponent } from '../ui/Stats';

import type {
  StatsProps as StatsUiComponentProps,
  StatsTranslationOptions,
} from '../ui/Stats';
import type { UseStatsProps } from 'react-instantsearch-hooks';
import { warn } from '../../../react-instantsearch-hooks/src/lib/warn';

type UiProps = Pick<
  StatsUiComponentProps,
  | 'nbHits'
  | 'nbSortedHits'
  | 'processingTimeMS'
  | 'areHitsSorted'
  | 'translations'
>;

export type StatsProps = Omit<StatsUiComponentProps, keyof UiProps> &
  UseStatsProps & {
    translations?: Partial<UiProps['translations']> & {
      /**
       * @deprecated Use `rootElementText` instead.
       */
      stats?: Partial<UiProps['translations']>['rootElementText'];
    };
  };

export function Stats({ translations, ...props }: StatsProps) {
  const { nbHits, nbSortedHits, processingTimeMS, areHitsSorted } = useStats(
    undefined,
    { $$widgetType: 'ais.stats' }
  );

  warn(
    !translations?.stats,
    'The `stats` translation is deprecated. Please use `rootElementText` instead.'
  );

  const statsTranslation = (options: StatsTranslationOptions): string =>
    options.areHitsSorted
      ? `${options.nbSortedHits!.toLocaleString()} relevant results sorted out of ${options.nbHits.toLocaleString()} found in ${options.processingTimeMS.toLocaleString()}ms`
      : `${options.nbHits.toLocaleString()} results found in ${options.processingTimeMS.toLocaleString()}ms`;

  const uiProps: UiProps = {
    nbHits,
    nbSortedHits,
    processingTimeMS,
    areHitsSorted,
    translations: {
      rootElementText: translations?.stats || statsTranslation,
      ...translations,
    },
  };

  return <StatsUiComponent {...props} {...uiProps} />;
}
