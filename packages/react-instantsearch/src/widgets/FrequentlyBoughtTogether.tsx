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
  | 'itemComponent'
  | 'items'
  | 'fallbackComponent'
  | 'headerComponent'
  | 'status'
  | 'translations'
  | 'sendEvent'
  | 'view'
>;

export type FrequentlyBoughtTogetherProps<THit extends BaseHit> = Omit<
  FrequentlyBoughtTogetherPropsUiComponentProps<Hit<THit>>,
  keyof UiProps<THit>
> & {
  itemComponent?: React.JSXElementConstructor<{
    item: Hit<THit>;
    // sendEvent: SendEventForHits;
  }>;
} & UseFrequentlyBoughtTogetherProps<THit>;

// @MAJOR: Move default hit component back to the UI library
// once flavour specificities are erased
function DefaultItemComponent<THit extends BaseHit = BaseHit>({
  item,
}: {
  item: THit;
}) {
  return (
    <div style={{ wordBreak: 'break-all' }}>
      {JSON.stringify(item).slice(0, 100)}…
    </div>
  );
}

const FrequentlyBoughtTogetherUiComponent =
  createFrequentlyBoughtTogetherComponent({
    createElement: createElement as Pragma,
    Fragment,
  });

export function FrequentlyBoughtTogether<THit extends BaseHit = BaseHit>({
  transformItems,
  itemComponent: ItemComponent = DefaultItemComponent,
  objectIDs,
  maxRecommendations,
  threshold,
  queryParameters,
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

  const itemComponent: FrequentlyBoughtTogetherPropsUiComponentProps<
    Hit<THit>
  >['itemComponent'] = ({ item, index, ...itemProps }) => (
    <li key={item.objectID} {...itemProps}>
      <ItemComponent item={item} />
    </li>
  );

  const uiProps: UiProps<THit> = {
    items: recommendations,
    sendEvent: () => {},
    itemComponent,
    status,
  };

  return <FrequentlyBoughtTogetherUiComponent {...props} {...uiProps} />;
}
