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
  | 'fallbackComponent'
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
    fallbackComponent?: FrequentlyBoughtTogetherPropsUiComponentProps<THit>['fallbackComponent'];
  };

const FrequentlyBoughtTogetherUiComponent =
  createFrequentlyBoughtTogetherComponent({
    createElement: createElement as Pragma,
    Fragment,
  });

export function FrequentlyBoughtTogether<THit extends BaseHit = BaseHit>({
  objectIDs,
  maxRecommendations,
  threshold,
  queryParameters,
  transformItems,
  itemComponent,
  headerComponent,
  fallbackComponent,
  ...props
}: FrequentlyBoughtTogetherProps<THit>) {
  const { status } = useInstantSearch();
  const { recommendations } = useFrequentlyBoughtTogether<THit>(
    {
      objectIDs,
      maxRecommendations,
      threshold,
      queryParameters,
      transformItems,
    },
    { $$widgetType: 'ais.frequentlyBoughtTogether' }
  );

  const uiProps: UiProps<THit> = {
    items: recommendations as Array<Hit<THit>>,
    itemComponent,
    headerComponent,
    fallbackComponent,
    status,
    sendEvent: () => {},
  };

  return <FrequentlyBoughtTogetherUiComponent {...props} {...uiProps} />;
}
