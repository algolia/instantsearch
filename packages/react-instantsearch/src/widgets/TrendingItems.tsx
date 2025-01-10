import { createTrendingItemsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useTrendingItems } from 'react-instantsearch-core';

import type {
  TrendingItemsProps as TrendingItemsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { BaseHit, Hit } from 'instantsearch.js';
import type { UseTrendingItemsProps } from 'react-instantsearch-core';

type UiProps<TItem extends BaseHit> = Pick<
  TrendingItemsUiComponentProps<TItem>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
  | 'layout'
  | 'status'
  | 'sendEvent'
>;

export type TrendingItemsProps<TItem extends BaseHit> = Omit<
  TrendingItemsUiComponentProps<TItem>,
  keyof UiProps<TItem>
> &
  UseTrendingItemsProps & {
    itemComponent?: TrendingItemsUiComponentProps<TItem>['itemComponent'];
    headerComponent?: TrendingItemsUiComponentProps<TItem>['headerComponent'];
    emptyComponent?: TrendingItemsUiComponentProps<TItem>['emptyComponent'];
    layoutComponent?: TrendingItemsUiComponentProps<TItem>['layout'];
  };

const TrendingItemsUiComponent = createTrendingItemsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function TrendingItems<TItem extends BaseHit = BaseHit>({
  facetName,
  facetValue,
  limit,
  threshold,
  fallbackParameters,
  queryParameters,
  escapeHTML,
  transformItems,
  itemComponent,
  headerComponent,
  emptyComponent,
  layoutComponent,
  ...props
}: TrendingItemsProps<TItem>) {
  const facetParameters =
    facetName && facetValue ? { facetName, facetValue } : {};

  const { status } = useInstantSearch();
  const { items, sendEvent } = useTrendingItems(
    {
      ...facetParameters,
      limit,
      threshold,
      fallbackParameters,
      queryParameters,
      escapeHTML,
      transformItems,
    },
    { $$widgetType: 'ais.trendingItems' }
  );

  const layout: typeof layoutComponent = layoutComponent
    ? (layoutProps) =>
        layoutComponent({
          ...layoutProps,
          classNames: {
            list: layoutProps.classNames.list,
            item: layoutProps.classNames.item,
          },
        })
    : undefined;

  const uiProps: UiProps<TItem> = {
    items: items as Array<Hit<TItem>>,
    itemComponent,
    headerComponent,
    emptyComponent,
    layout,
    status,
    sendEvent,
  };

  return <TrendingItemsUiComponent {...props} {...uiProps} />;
}
