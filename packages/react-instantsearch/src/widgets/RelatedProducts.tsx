import { createRelatedProductsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useMemo } from 'react';
import { useInstantSearch, useRelatedProducts } from 'react-instantsearch-core';

import type {
  RelatedProductsProps as RelatedProductsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { BaseHit, Hit } from 'instantsearch.js';
import type { UseRelatedProductsProps } from 'react-instantsearch-core';

type UiProps<TItem extends BaseHit> = Pick<
  RelatedProductsUiComponentProps<TItem>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
  | 'layout'
  | 'status'
  | 'sendEvent'
>;

export type RelatedProductsProps<TItem extends BaseHit> = Omit<
  RelatedProductsUiComponentProps<TItem>,
  keyof UiProps<TItem>
> &
  UseRelatedProductsProps & {
    itemComponent?: RelatedProductsUiComponentProps<TItem>['itemComponent'];
    headerComponent?: RelatedProductsUiComponentProps<TItem>['headerComponent'];
    emptyComponent?: RelatedProductsUiComponentProps<TItem>['emptyComponent'];
    layoutComponent?: RelatedProductsUiComponentProps<TItem>['layout'];
  };

const RelatedProductsUiComponent = createRelatedProductsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function RelatedProducts<TItem extends BaseHit = BaseHit>({
  objectIDs,
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
}: RelatedProductsProps<TItem>) {
  const { status } = useInstantSearch();
  const { items, sendEvent } = useRelatedProducts(
    {
      objectIDs,
      limit,
      threshold,
      fallbackParameters,
      queryParameters,
      escapeHTML,
      transformItems,
    },
    { $$widgetType: 'ais.relatedProducts' }
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

  const _itemComponent: typeof itemComponent = useMemo(
    () =>
      itemComponent
        ? (itemProps) => itemComponent({ ...itemProps, sendEvent })
        : undefined,
    [itemComponent, sendEvent]
  );

  const uiProps: UiProps<TItem> = {
    items: items as Array<Hit<TItem>>,
    itemComponent: _itemComponent,
    headerComponent,
    emptyComponent,
    layout,
    status,
    sendEvent,
  };

  return <RelatedProductsUiComponent {...props} {...uiProps} />;
}
