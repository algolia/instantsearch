import React from 'react';
import { useHits } from 'react-instantsearch-hooks';

import { Hits as HitsUiComponent } from '../ui/Hits';

import type { HitsProps as HitsUiComponentProps } from '../ui/Hits';
import type { Hit, BaseHit } from 'instantsearch.js';
import type { UseHitsProps } from 'react-instantsearch-hooks';

export type HitsProps<THit extends BaseHit> = Omit<
  HitsUiComponentProps<Hit<THit>>,
  'hits'
> &
  UseHitsProps<THit>;

export function Hits<THit extends BaseHit = BaseHit>(props: HitsProps<THit>) {
  const { hits } = useHits<THit>(props, { $$widgetType: 'ais.hits' });

  return <HitsUiComponent {...props} hits={hits} />;
}
