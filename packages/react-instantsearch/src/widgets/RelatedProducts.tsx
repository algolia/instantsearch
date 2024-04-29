import { createRelatedProductsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useInstantSearch, useRelatedProducts } from 'react-instantsearch-core';

import type {
  RelatedProductsProps as RelatedProductsUiComponentProps,
  Pragma,
  RecordWithObjectID,
} from 'instantsearch-ui-components';
import type { Hit } from 'instantsearch.js';
import type { UseRelatedProductsProps } from 'react-instantsearch-core';

type UiProps<TItem extends RecordWithObjectID> = Pick<
  RelatedProductsUiComponentProps<TItem>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'fallbackComponent'
  | 'status'
  | 'sendEvent'
>;

export type RelatedProductsProps<TItem extends RecordWithObjectID> = Omit<
  RelatedProductsUiComponentProps<TItem>,
  keyof UiProps<TItem>
> &
  UseRelatedProductsProps & {
    itemComponent?: RelatedProductsUiComponentProps<TItem>['itemComponent'];
    headerComponent?: RelatedProductsUiComponentProps<TItem>['headerComponent'];
    fallbackComponent?: RelatedProductsUiComponentProps<TItem>['fallbackComponent'];
  };

const RelatedProductsUiComponent = createRelatedProductsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function RelatedProducts<
  TItem extends RecordWithObjectID = RecordWithObjectID
>({
  objectIDs,
  maxRecommendations,
  threshold,
  fallbackParameters,
  queryParameters,
  transformItems,
  itemComponent,
  headerComponent,
  fallbackComponent,
  ...props
}: RelatedProductsProps<TItem>) {
  const { status } = useInstantSearch();
  const { recommendations } = useRelatedProducts(
    {
      objectIDs,
      maxRecommendations,
      threshold,
      fallbackParameters,
      queryParameters,
      transformItems,
    },
    { $$widgetType: 'ais.relatedProducts' }
  );

  const uiProps: UiProps<TItem> = {
    items: recommendations as Array<Hit<TItem>>,
    itemComponent,
    headerComponent,
    fallbackComponent,
    status,
    sendEvent: () => {},
  };

  return <RelatedProductsUiComponent {...props} {...uiProps} />;
}
