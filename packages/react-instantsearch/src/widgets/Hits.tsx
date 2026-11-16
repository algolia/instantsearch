import { createHitsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useMemo } from 'react';
import { useHits } from 'react-instantsearch-core';

import type { Hit, BaseHit } from 'instantsearch-core';
import type { SendEventForHits } from 'instantsearch-core';
import type {
  HitsProps as HitsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { UseHitsProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit> = Pick<
  HitsUiComponentProps<Hit<THit>>,
  | 'hits'
  | 'sendEvent'
  | 'itemComponent'
  | 'emptyComponent'
  | 'banner'
  | 'bannerComponent'
>;

export type HitsProps<THit extends BaseHit> = Omit<
  HitsUiComponentProps<Hit<THit>>,
  keyof UiProps<THit>
> & {
  hitComponent?: React.JSXElementConstructor<{
    hit: Hit<THit>;
    sendEvent: SendEventForHits;
  }>;
} & {
  bannerComponent?:
    | React.JSXElementConstructor<{
        banner: Required<HitsUiComponentProps<Hit<THit>>>['banner'];
        className: string;
      }>
    | false;
} & UseHitsProps<THit>;

const HitsUiComponent = createHitsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function Hits<THit extends BaseHit = BaseHit>({
  transformItems,
  hitComponent: HitComponent,
  bannerComponent: BannerComponent,
  ...props
}: HitsProps<THit>) {
  const {
    items: hits,
    banner,
    sendEvent,
  } = useHits<THit>({ transformItems }, { $$widgetType: 'ais.hits' });

  // Without a `hitComponent`, the UI component renders its default hit.
  const itemComponent: HitsUiComponentProps<Hit<THit>>['itemComponent'] =
    useMemo(
      () =>
        HitComponent
          ? ({ hit, index: _index, ...itemProps }) => (
              <li key={hit.objectID} {...itemProps}>
                <HitComponent hit={hit} sendEvent={sendEvent} />
              </li>
            )
          : undefined,
      [HitComponent, sendEvent]
    );

  const bannerComponent = (
    BannerComponent === false ? () => null : BannerComponent
  ) as HitsUiComponentProps<Hit<THit>>['bannerComponent'];

  const uiProps: UiProps<THit> = {
    hits,
    sendEvent,
    itemComponent,
    banner,
    bannerComponent,
  };

  return <HitsUiComponent {...props} {...uiProps} />;
}
