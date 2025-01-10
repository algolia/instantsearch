import { createLookingSimilarComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useLookingSimilar, useInstantSearch } from 'react-instantsearch-core';

import type {
  LookingSimilarProps as LookingSimilarPropsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { AlgoliaHit, BaseHit, Hit } from 'instantsearch.js';
import type { UseLookingSimilarProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit> = Pick<
  LookingSimilarPropsUiComponentProps<AlgoliaHit<THit>>,
  | 'items'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
  | 'layout'
  | 'status'
  | 'sendEvent'
>;

export type LookingSimilarProps<THit extends BaseHit> = Omit<
  LookingSimilarPropsUiComponentProps<AlgoliaHit<THit>>,
  keyof UiProps<THit>
> &
  UseLookingSimilarProps<THit> & {
    itemComponent?: LookingSimilarPropsUiComponentProps<THit>['itemComponent'];
    headerComponent?: LookingSimilarPropsUiComponentProps<THit>['headerComponent'];
    emptyComponent?: LookingSimilarPropsUiComponentProps<THit>['emptyComponent'];
    layoutComponent?: LookingSimilarPropsUiComponentProps<THit>['layout'];
  };

const LookingSimilarUiComponent = createLookingSimilarComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function LookingSimilar<THit extends BaseHit = BaseHit>({
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
}: LookingSimilarProps<THit>) {
  const { status } = useInstantSearch();
  const { items, sendEvent } = useLookingSimilar<THit>(
    {
      objectIDs,
      limit,
      threshold,
      queryParameters,
      fallbackParameters,
      escapeHTML,
      transformItems,
    },
    { $$widgetType: 'ais.lookingSimilar' }
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

  return <LookingSimilarUiComponent {...props} {...uiProps} />;
}
