import { createInfiniteHitsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useMemo } from 'react';
import { useInfiniteHits } from 'react-instantsearch-core';

import type { BaseHit, Hit, SendEventForHits } from 'instantsearch-core';
import type {
  InfiniteHitsProps as InfiniteHitsUiComponentProps,
  InfiniteHitsTranslations,
  Pragma,
} from 'instantsearch-ui-components';
import type { UseInfiniteHitsProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit = BaseHit> = Pick<
  InfiniteHitsUiComponentProps<Hit<THit>>,
  | 'hits'
  | 'banner'
  | 'bannerComponent'
  | 'sendEvent'
  | 'itemComponent'
  | 'emptyComponent'
  | 'onShowPrevious'
  | 'onShowMore'
  | 'loadPreviousComponent'
  | 'loadMoreComponent'
  | 'isFirstPage'
  | 'isLastPage'
  | 'translations'
>;

export type InfiniteHitsProps<THit extends BaseHit = BaseHit> = Omit<
  InfiniteHitsUiComponentProps<Hit<THit>>,
  keyof UiProps<THit>
> & {
  hitComponent?: React.JSXElementConstructor<{
    hit: Hit<THit>;
    sendEvent: SendEventForHits;
  }>;
} & {
  bannerComponent?:
    | React.JSXElementConstructor<{
        banner: Required<InfiniteHitsUiComponentProps<Hit<THit>>>['banner'];
        className: string;
      }>
    | false;
} & UseInfiniteHitsProps<THit> & {
    /**
     * Displays the "Show Previous" button when the UI is loaded from a page
     * beyond the first one.
     * @default true
     */
    showPrevious?: boolean;
    translations?: Partial<InfiniteHitsTranslations>;
  };

const InfiniteHitsUiComponent = createInfiniteHitsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function InfiniteHits<THit extends BaseHit = BaseHit>({
  showPrevious: shouldShowPrevious = true,
  cache,
  transformItems,
  translations,
  hitComponent: HitComponent,
  bannerComponent: BannerComponent,
  ...props
}: InfiniteHitsProps<THit>) {
  const {
    items,
    banner,
    sendEvent,
    showPrevious,
    showMore,
    isFirstPage,
    isLastPage,
  } = useInfiniteHits<THit>(
    { cache, showPrevious: shouldShowPrevious, transformItems },
    { $$widgetType: 'ais.infiniteHits' }
  );

  // Without a `hitComponent`, the UI component renders its default hit.
  const itemComponent: InfiniteHitsUiComponentProps<
    Hit<THit>
  >['itemComponent'] = useMemo(
    () =>
      HitComponent
        ? ({ hit, index: _index, ...itemProps }) => (
            <li key={hit.objectID} {...itemProps}>
              <HitComponent hit={hit} sendEvent={sendEvent} />
            </li>
          )
        : undefined,
    [HitComponent, sendEvent]
  );

  const bannerComponent = (
    BannerComponent === false ? () => null : BannerComponent
  ) as InfiniteHitsUiComponentProps<Hit<THit>>['bannerComponent'];

  const uiProps: UiProps<THit> = {
    hits: items,
    banner,
    bannerComponent,
    sendEvent,
    itemComponent,
    onShowPrevious: shouldShowPrevious ? showPrevious : undefined,
    onShowMore: showMore,
    isFirstPage,
    isLastPage,
    translations,
  };

  return <InfiniteHitsUiComponent {...props} {...uiProps} />;
}
