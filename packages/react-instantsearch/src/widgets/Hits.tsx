import React from 'react';
import { useHits } from 'react-instantsearch-core';

import { Hits as HitsUiComponent } from '../ui/Hits';

import type { HitsProps as HitsUiComponentProps } from '../ui/Hits';
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

export function Hits<THit extends BaseHit = BaseHit>({
  escapeHTML,
  transformItems,
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

  return <HitsUiComponent {...props} {...uiProps} />;
}
