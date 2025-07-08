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
  | 'layout'
  | 'status'
  | 'sendEvent'
>;

export type TrendingFacetsProps = Omit<
  TrendingFacetsUiComponentProps,
  keyof UiProps
> &
  UseTrendingFacetsProps & {
    headerComponent?: TrendingFacetsUiComponentProps['headerComponent'];
    emptyComponent?: TrendingFacetsUiComponentProps['emptyComponent'];
  } & (
    | {
        itemComponent: TrendingFacetsUiComponentProps['itemComponent'];
        layoutComponent?: TrendingFacetsUiComponentProps['layout'];
      }
    | {
        itemComponent?: TrendingFacetsUiComponentProps['itemComponent'];
        layoutComponent: TrendingFacetsUiComponentProps['layout'];
      }
  );

const TrendingFacetsUiComponent = createTrendingFacetsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function TrendingFacets({
  attribute,
  limit,
  threshold,
  transformItems,
  itemComponent,
  headerComponent,
  emptyComponent,
  layoutComponent,
  ...props
}: TrendingFacetsProps) {
  const { status } = useInstantSearch();
  const { items } = useTrendingFacets(
    {
      attribute,
      limit,
      threshold,
      transformItems,
    },
    { $$widgetType: 'ais.trendingFacets' }
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

  const uiProps: UiProps = {
    items,
    itemComponent,
    headerComponent,
    emptyComponent,
    layout,
    status,
    sendEvent: () => {},
  };

  return <TrendingFacetsUiComponent {...props} {...uiProps} />;
}
