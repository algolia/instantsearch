import { createFrequentlyBoughtTogetherComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useMemo } from 'react';
import {
  useFrequentlyBoughtTogether,
  useInstantSearch,
} from 'react-instantsearch-core';

import type {
  FrequentlyBoughtTogetherProps as FrequentlyBoughtTogetherPropsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { Hit, BaseHit } from 'instantsearch.js';
import type { UseFrequentlyBoughtTogetherProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit> = Pick<
  FrequentlyBoughtTogetherPropsUiComponentProps<Hit<THit>>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
  | 'layout'
  | 'status'
  | 'sendEvent'
>;

export type FrequentlyBoughtTogetherProps<THit extends BaseHit> = Omit<
  FrequentlyBoughtTogetherPropsUiComponentProps<Hit<THit>>,
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
  fallbackParameters,
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
      fallbackParameters,
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

  const _itemComponent: typeof itemComponent = useMemo(
    () =>
      itemComponent
        ? (itemProps) => itemComponent({ ...itemProps, sendEvent })
        : undefined,
    [itemComponent, sendEvent]
  );

  const uiProps: UiProps<THit> = {
    items,
    itemComponent: _itemComponent,
    headerComponent,
    emptyComponent,
    layout,
    status,
    sendEvent,
  };

  return <FrequentlyBoughtTogetherUiComponent {...props} {...uiProps} />;
}
