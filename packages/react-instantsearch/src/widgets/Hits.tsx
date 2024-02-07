import { createHits } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useHits } from 'react-instantsearch-core';

import type { HitsProps as HitsUiComponentProps } from '../ui/Hits';
import type { Pragma } from 'instantsearch-ui-components';
import type { Hit, BaseHit } from 'instantsearch.js';
import type { UseHitsProps } from 'react-instantsearch-core';

type UiProps<THit extends BaseHit> = Pick<
  HitsUiComponentProps<Hit<THit>>,
  'hits' | 'sendEvent'
>;

export type HitsProps<THit extends BaseHit> = Omit<
  HitsUiComponentProps<Hit<THit>>,
  keyof UiProps<THit>
> &
  UseHitsProps<THit>;

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

const HitsUiComponent = createHits({
  createElement: createElement as Pragma,
  Fragment,
});

export function Hits<THit extends BaseHit = BaseHit>({
  escapeHTML,
  transformItems,
  hitComponent: HitComponent = DefaultHitComponent,
  ...props
}: HitsProps<THit>) {
  const { hits, sendEvent } = useHits<THit>(
    { escapeHTML, transformItems },
    { $$widgetType: 'ais.hits' }
  );

  const uiProps: UiProps<THit> = {
    hits,
    sendEvent,
  };

  // FIXME: Use exported type from instantsearch-ui-components
  const itemComponent = ({ hit, index, ...rootProps }) => (
    <li key={hit.objectID} {...rootProps}>
      <HitComponent hit={hit} sendEvent={sendEvent} />
    </li>
  );

  return (
    <HitsUiComponent {...props} {...uiProps} itemComponent={itemComponent} />
  );
}
