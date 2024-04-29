import { createHitsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useHits } from 'react-instantsearch-core';

import type {
  HitsProps as HitsUiComponentProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { Hit, BaseHit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';
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

// @MAJOR: Move default hit component back to the UI library
// once flavour specificities are erased
function DefaultHitComponent<THit extends BaseHit = BaseHit>({
  hit,
}: {
  hit: THit;
}) {
  return (
    <div style={{ wordBreak: 'break-all' }}>
      {JSON.stringify(hit).slice(0, 100)}…
    </div>
  );
}

const HitsUiComponent = createHitsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function Hits<THit extends BaseHit = BaseHit>({
  escapeHTML,
  transformItems,
  hitComponent: HitComponent = DefaultHitComponent,
  bannerComponent: BannerComponent,
  ...props
}: HitsProps<THit>) {
  const {
    hits,
    banner: bannerData,
    sendEvent,
  } = useHits<THit>(
    { escapeHTML, transformItems },
    { $$widgetType: 'ais.hits' }
  );

  const itemComponent: HitsUiComponentProps<Hit<THit>>['itemComponent'] = ({
    hit,
    index,
    ...itemProps
  }) => (
    <li key={hit.objectID} {...itemProps}>
      <HitComponent hit={hit} sendEvent={sendEvent} />
    </li>
  );

  const banner = BannerComponent === false ? undefined : bannerData;

  const bannerComponent =
    BannerComponent === false
      ? undefined
      : (BannerComponent as HitsUiComponentProps<Hit<THit>>['bannerComponent']);

  const uiProps: UiProps<THit> = {
    hits,
    sendEvent,
    itemComponent,
    banner,
    bannerComponent,
  };

  return <HitsUiComponent {...props} {...uiProps} />;
}
