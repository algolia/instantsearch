import React from 'react';
import { useStats } from 'react-instantsearch-hooks';

import { Stats as StatsUiComponent } from '../ui/Stats';

import type { StatsProps as StatsUiComponentProps } from '../ui/Stats';
import type { UseStatsProps } from 'react-instantsearch-hooks';

type UiProps = Pick<
  StatsUiComponentProps,
  | 'nbHits'
  | 'nbSortedHits'
  | 'processingTimeMS'
  | 'areHitsSorted'
  | 'translations'
>;

export type StatsProps = Omit<StatsUiComponentProps, keyof UiProps> &
  UseStatsProps & { translations?: Partial<UiProps['translations']> };

export function Stats(props: StatsProps) {
  const { nbHits, nbSortedHits, processingTimeMS, areHitsSorted } = useStats(
    undefined,
    { $$widgetType: 'ais.stats' }
  );

  const statsTranslation = (
    n: number,
    ms: number,
    nSorted?: number,
    sorted?: boolean
  ): string =>
    sorted
      ? `${nSorted!.toLocaleString()} relevant results sorted out of ${n.toLocaleString()} found in ${ms.toLocaleString()}ms`
      : `${n.toLocaleString()} results found in ${ms.toLocaleString()}ms`;

  const uiProps: UiProps = {
    nbHits,
    nbSortedHits,
    processingTimeMS,
    areHitsSorted,
    translations: {
      stats: statsTranslation,
      ...(props.translations || {}),
    },
  };

  return <StatsUiComponent {...props} {...uiProps} />;
}
