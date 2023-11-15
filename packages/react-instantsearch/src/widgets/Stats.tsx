import React from 'react';
import { useStats } from 'react-instantsearch-core';

import { Stats as StatsUiComponent } from '../ui/Stats';

import type {
  StatsProps as StatsUiComponentProps,
  StatsTranslationOptions,
} from '../ui/Stats';
import type { UseStatsProps } from 'react-instantsearch-core';

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

export function Stats({ translations, ...props }: StatsProps) {
  const { nbHits, nbSortedHits, processingTimeMS, areHitsSorted } = useStats(
    undefined,
    { $$widgetType: 'ais.stats' }
  );

  const uiProps: UiProps = {
    nbHits,
    nbSortedHits,
    processingTimeMS,
    areHitsSorted,
    translations: {
      rootElementText(options: StatsTranslationOptions) {
        return `${
          options.areHitsSorted
            ? getSortedResultsSentence(options)
            : getResultsSentence(options)
        } found in ${options.processingTimeMS.toLocaleString()}ms`;
      },
      ...translations,
    },
  };

  return <StatsUiComponent {...props} {...uiProps} />;
}

function getSortedResultsSentence({
  nbHits,
  nbSortedHits,
}: StatsTranslationOptions) {
  const suffix = `sorted out of ${nbHits.toLocaleString()}`;

  if (nbSortedHits === 0) {
    return `No relevant results ${suffix}`;
  }

  if (nbSortedHits === 1) {
    return `1 relevant result ${suffix}`;
  }

  if (nbSortedHits! > 1) {
    return `${(nbSortedHits || 0).toLocaleString()} relevant results ${suffix}`;
  }

  return '';
}

function getResultsSentence({ nbHits }: StatsTranslationOptions) {
  if (nbHits === 0) {
    return 'No results';
  }

  if (nbHits === 1) {
    return '1 result';
  }

  if (nbHits > 1) {
    return `${nbHits.toLocaleString()} results`;
  }

  return '';
}
