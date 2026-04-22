import { createTrendingFacetsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useTrendingFacets } from 'react-instantsearch-core';

import type {
  TrendingFacetsProps as TrendingFacetsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { UseTrendingFacetsProps } from 'react-instantsearch-core';

type UiProps = Pick<
  TrendingFacetsUiComponentProps,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
  | 'status'
>;

export type TrendingFacetsProps = Omit<
  TrendingFacetsUiComponentProps,
  keyof UiProps
> &
  UseTrendingFacetsProps & {
    itemComponent?: TrendingFacetsUiComponentProps['itemComponent'];
    headerComponent?: TrendingFacetsUiComponentProps['headerComponent'];
    emptyComponent?: TrendingFacetsUiComponentProps['emptyComponent'];
  };

const TrendingFacetsUiComponent = createTrendingFacetsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function TrendingFacets({
  facetName,
  limit,
  threshold,
  fallbackParameters,
  queryParameters,
  escapeHTML,
  transformItems,
  itemComponent,
  headerComponent,
  emptyComponent,
  ...props
}: TrendingFacetsProps) {
  const { status } = useInstantSearch();
  const { items } = useTrendingFacets(
    {
      facetName,
      limit,
      threshold,
      fallbackParameters,
      queryParameters,
      escapeHTML,
      transformItems,
    },
    { $$widgetType: 'ais.trendingFacets' }
  );

  const uiProps: UiProps = {
    items,
    itemComponent,
    headerComponent,
    emptyComponent,
    status,
  };

  return <TrendingFacetsUiComponent {...props} {...uiProps} />;
}
