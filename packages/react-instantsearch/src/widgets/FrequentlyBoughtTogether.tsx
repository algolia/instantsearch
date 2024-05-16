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
import type { Hit, BaseHit } from 'instantsearch.js';
import type { UseFrequentlyBoughtTogetherProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit> = Pick<
  FrequentlyBoughtTogetherPropsUiComponentProps<Hit<THit>>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
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
  ...props
}: FrequentlyBoughtTogetherProps<THit>) {
  const { status } = useInstantSearch();
  const { items } = useFrequentlyBoughtTogether<THit>(
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

  const uiProps: UiProps<THit> = {
    items,
    itemComponent,
    headerComponent,
    emptyComponent,
    status,
    sendEvent: () => {},
  };

  return <FrequentlyBoughtTogetherUiComponent {...props} {...uiProps} />;
}
