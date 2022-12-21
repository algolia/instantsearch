import React from 'react';
import { useInfiniteHits } from 'react-instantsearch-hooks';

import { InfiniteHits as InfiniteHitsUiComponent } from '../ui/InfiniteHits';

import type { InfiniteHitsProps as InfiniteHitsUiComponentProps } from '../ui/InfiniteHits';
import type { BaseHit, Hit } from 'instantsearch.js';
import type { UseInfiniteHitsProps } from 'react-instantsearch-hooks';

type UiProps<THit extends BaseHit = BaseHit> = Pick<
  InfiniteHitsUiComponentProps<Hit<THit>>,
  | 'hits'
  | 'sendEvent'
  | 'onShowPrevious'
  | 'onShowMore'
  | 'isFirstPage'
  | 'isLastPage'
  | 'translations'
>;

export type InfiniteHitsProps<THit extends BaseHit = BaseHit> = Omit<
  InfiniteHitsUiComponentProps<Hit<THit>>,
  keyof UiProps<THit>
> &
  UseInfiniteHitsProps<THit> & {
    /**
     * Displays the "Show Previous" button when the UI is loaded from a page
     * beyond the first one.
     * @default true
     */
    showPrevious?: boolean;
    translations?: Partial<UiProps<THit>['translations']>;
  };

export function InfiniteHits<THit extends BaseHit = BaseHit>({
  showPrevious: shouldShowPrevious = true,
  cache,
  escapeHTML,
  showPrevious: userShowPrevious,
  transformItems,
  translations,
  ...props
}: InfiniteHitsProps<THit>) {
  const { hits, sendEvent, showPrevious, showMore, isFirstPage, isLastPage } =
    useInfiniteHits<THit>(
      { cache, escapeHTML, showPrevious: userShowPrevious, transformItems },
      { $$widgetType: 'ais.infiniteHits' }
    );

  const uiProps: UiProps<THit> = {
    hits,
    sendEvent,
    onShowPrevious: shouldShowPrevious ? showPrevious : undefined,
    onShowMore: showMore,
    isFirstPage,
    isLastPage,
    translations: {
      showPreviousButtonText: 'Show previous results',
      showMoreButtonText: 'Show more results',
      ...translations,
    },
  };

  return <InfiniteHitsUiComponent {...props} {...uiProps} />;
}
