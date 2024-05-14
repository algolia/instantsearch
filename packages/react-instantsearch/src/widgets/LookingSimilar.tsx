import { createLookingSimilarComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useLookingSimilar, useInstantSearch } from 'react-instantsearch-core';

import type {
  LookingSimilarProps as LookingSimilarPropsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { Hit, BaseHit } from 'instantsearch.js';
import type { UseLookingSimilarProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit> = Pick<
  LookingSimilarPropsUiComponentProps<Hit<THit>>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
  | 'status'
  | 'sendEvent'
>;

export type LookingSimilarProps<THit extends BaseHit> = Omit<
  LookingSimilarPropsUiComponentProps<Hit<THit>>,
  keyof UiProps<THit>
> &
  UseLookingSimilarProps<THit> & {
    itemComponent?: LookingSimilarPropsUiComponentProps<THit>['itemComponent'];
    headerComponent?: LookingSimilarPropsUiComponentProps<THit>['headerComponent'];
    emptyComponent?: LookingSimilarPropsUiComponentProps<THit>['emptyComponent'];
  };

const LookingSimilarUiComponent = createLookingSimilarComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function LookingSimilar<THit extends BaseHit = BaseHit>({
  objectIDs,
  maxRecommendations,
  threshold,
  queryParameters,
  fallbackParameters,
  transformItems,
  itemComponent,
  headerComponent,
  emptyComponent,
  ...props
}: LookingSimilarProps<THit>) {
  const { status } = useInstantSearch();
  const { items } = useLookingSimilar<THit>(
    {
      objectIDs,
      maxRecommendations,
      threshold,
      queryParameters,
      fallbackParameters,
      transformItems,
    },
    { $$widgetType: 'ais.lookingSimilar' }
  );

  const uiProps: UiProps<THit> = {
    items,
    itemComponent,
    headerComponent,
    emptyComponent,
    status,
    sendEvent: () => {},
  };

  return <LookingSimilarUiComponent {...props} {...uiProps} />;
}
