import { createFrequentlyBoughtTogetherComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import {
  useFrequentlyBoughtTogether,
  useInstantSearch,
} from 'react-instantsearch-core';

import type {
  FrequentlyBoughtTogetherProps as FrequentlyBoughtTogetherPropsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { AlgoliaHit, BaseHit, Hit } from 'instantsearch.js';
import type { UseFrequentlyBoughtTogetherProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit> = Pick<
  FrequentlyBoughtTogetherPropsUiComponentProps<AlgoliaHit<THit>>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
  | 'layout'
  | 'status'
  | 'sendEvent'
>;

export type FrequentlyBoughtTogetherProps<THit extends BaseHit> = Omit<
  FrequentlyBoughtTogetherPropsUiComponentProps<AlgoliaHit<THit>>,
  keyof UiProps<THit>
> &
  UseFrequentlyBoughtTogetherProps<THit> & {
    itemComponent?: FrequentlyBoughtTogetherPropsUiComponentProps<THit>['itemComponent'];
    headerComponent?: FrequentlyBoughtTogetherPropsUiComponentProps<THit>['headerComponent'];
    emptyComponent?: FrequentlyBoughtTogetherPropsUiComponentProps<THit>['emptyComponent'];
    layoutComponent?: FrequentlyBoughtTogetherPropsUiComponentProps<THit>['layout'];
  };

const FrequentlyBoughtTogetherUiComponent =
  createFrequentlyBoughtTogetherComponent({
    createElement: createElement as Pragma,
    Fragment,
  });

export function FrequentlyBoughtTogether<THit extends BaseHit = BaseHit>({
  objectIDs,
  limit,
  threshold,
  queryParameters,
  escapeHTML,
  transformItems,
  itemComponent,
  headerComponent,
  emptyComponent,
  layoutComponent,
  ...props
}: FrequentlyBoughtTogetherProps<THit>) {
  const { status } = useInstantSearch();
  const { items, sendEvent } = useFrequentlyBoughtTogether<THit>(
    {
      objectIDs,
      limit,
      threshold,
      queryParameters,
      escapeHTML,
      transformItems,
    },
    { $$widgetType: 'ais.frequentlyBoughtTogether' }
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

  const uiProps: UiProps<THit> = {
    items: items as Array<Hit<THit>>,
    itemComponent,
    headerComponent,
    emptyComponent,
    layout,
    status,
    sendEvent,
  };

  return <FrequentlyBoughtTogetherUiComponent {...props} {...uiProps} />;
}
