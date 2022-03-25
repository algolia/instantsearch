import React from 'react';
import { useInfiniteHits } from 'react-instantsearch-hooks';

import { InfiniteHits as InfiniteHitsUiComponent } from '../ui/InfiniteHits';

import type { InfiniteHitsProps as InfiniteHitsUiComponentProps } from '../ui/InfiniteHits';
import type { BaseHit, Hit } from 'instantsearch.js';
import type { UseInfiniteHitsProps } from 'react-instantsearch-hooks';

export type InfiniteHitsProps<THit extends BaseHit = BaseHit> = Omit<
  InfiniteHitsUiComponentProps<Hit<THit>>,
  | 'hits'
  | 'onShowPrevious'
  | 'onShowMore'
  | 'isFirstPage'
  | 'isLastPage'
  | 'translations'
> &
  UseInfiniteHitsProps<THit> & {
    /**
     * Displays the "Show Previous" button when the UI is loaded from a page
     * beyond the first one.
     * @default true
     */
    showPrevious?: boolean;
  };

export function InfiniteHits<THit extends BaseHit = BaseHit>({
  showPrevious: shouldShowPrevious = true,
  ...props
}: InfiniteHitsProps<THit>) {
  const { hits, showPrevious, showMore, isFirstPage, isLastPage } =
    useInfiniteHits<THit>(props, { $$widgetType: 'ais.infiniteHits' });

  return (
    <InfiniteHitsUiComponent
      {...props}
      translations={{
        showPrevious: 'Show previous results',
        showMore: 'Show more results',
      }}
      hits={hits}
      onShowPrevious={shouldShowPrevious ? showPrevious : undefined}
      onShowMore={showMore}
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
    />
  );
}
