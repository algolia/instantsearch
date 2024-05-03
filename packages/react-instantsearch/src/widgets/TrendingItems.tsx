import { createTrendingItemsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useTrendingItems } from 'react-instantsearch-core';

import type {
  TrendingItemsProps as TrendingItemsUiComponentProps,
  Pragma,
  RecordWithObjectID,
} from 'instantsearch-ui-components';
import type { Hit } from 'instantsearch.js';
import type { UseTrendingItemsProps } from 'react-instantsearch-core';

type UiProps<TItem extends RecordWithObjectID> = Pick<
  TrendingItemsUiComponentProps<TItem>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'fallbackComponent'
  | 'status'
  | 'sendEvent'
>;

export type TrendingItemsProps<TItem extends RecordWithObjectID> = Omit<
  TrendingItemsUiComponentProps<TItem>,
  keyof UiProps<TItem>
> &
  UseTrendingItemsProps & {
    itemComponent?: TrendingItemsUiComponentProps<TItem>['itemComponent'];
    headerComponent?: TrendingItemsUiComponentProps<TItem>['headerComponent'];
    fallbackComponent?: TrendingItemsUiComponentProps<TItem>['fallbackComponent'];
  };

const TrendingItemsUiComponent = createTrendingItemsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function TrendingItems<
  TItem extends RecordWithObjectID = RecordWithObjectID
>({
  facetName,
  facetValue,
  maxRecommendations,
  threshold,
  fallbackParameters,
  queryParameters,
  transformItems,
  itemComponent,
  headerComponent,
  fallbackComponent,
  ...props
}: TrendingItemsProps<TItem>) {
  const facetParameters =
    facetName && facetValue ? { facetName, facetValue } : {};

  const { status } = useInstantSearch();
  const { recommendations } = useTrendingItems(
    {
      ...facetParameters,
      maxRecommendations,
      threshold,
      fallbackParameters,
      queryParameters,
      transformItems,
    },
    { $$widgetType: 'ais.TrendingItems' }
  );

  const uiProps: UiProps<TItem> = {
    items: recommendations as Array<Hit<TItem>>,
    itemComponent,
    headerComponent,
    fallbackComponent,
    status,
    sendEvent: () => {},
  };

  return <TrendingItemsUiComponent {...props} {...uiProps} />;
}
