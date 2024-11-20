import { connectHits } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  BaseHit,
  HitsConnectorParams,
  HitsWidgetDescription,
  HitsConnector,
} from 'instantsearch-core';

export type UseHitsProps<THit extends BaseHit = BaseHit> =
  HitsConnectorParams<THit>;

export function useHits<THit extends BaseHit = BaseHit>(
  props?: UseHitsProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<HitsConnectorParams<THit>, HitsWidgetDescription<THit>>(
    connectHits as HitsConnector<THit>,
    props,
    additionalWidgetProperties
  );
}
