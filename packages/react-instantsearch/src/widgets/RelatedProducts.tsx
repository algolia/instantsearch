import { createRelatedProductsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useRelatedProducts } from 'react-instantsearch-core';

import type {
  RelatedProductsProps as RelatedProductsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { Hit, BaseHit } from 'instantsearch.js';
import type { UseRelatedProductsProps } from 'react-instantsearch-core';

type UiProps<TItem extends BaseHit> = Pick<
  RelatedProductsUiComponentProps<TItem>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
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
  ...props
}: RelatedProductsProps<TItem>) {
  const { status } = useInstantSearch();
  const { items } = useRelatedProducts(
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

  const uiProps: UiProps<TItem> = {
    items: items as Array<Hit<TItem>>,
    itemComponent,
    headerComponent,
    emptyComponent,
    status,
    sendEvent: () => {},
  };

  return <RelatedProductsUiComponent {...props} {...uiProps} />;
}
