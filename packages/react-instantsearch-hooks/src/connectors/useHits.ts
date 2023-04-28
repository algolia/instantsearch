import connectHits from 'instantsearch.js/es/connectors/hits/connectHits';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type { BaseHit } from 'instantsearch.js';
import type {
  HitsConnectorParams,
  HitsWidgetDescription,
  HitsConnector,
} from 'instantsearch.js/es/connectors/hits/connectHits';

export type UseHitsProps<THit extends BaseHit = BaseHit> =
  HitsConnectorParams<THit> & UseParentIndexProps;

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
