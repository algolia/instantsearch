import { connectLookingSimilar } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  BaseHit,
  LookingSimilarConnector,
  LookingSimilarConnectorParams,
  LookingSimilarWidgetDescription,
} from 'instantsearch-core';

export type UseLookingSimilarProps<THit extends BaseHit = BaseHit> =
  LookingSimilarConnectorParams<THit>;

export function useLookingSimilar<THit extends BaseHit = BaseHit>(
  props?: UseLookingSimilarProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    LookingSimilarConnectorParams<THit>,
    LookingSimilarWidgetDescription<THit>
  >(
    connectLookingSimilar as LookingSimilarConnector<THit>,
    props,
    additionalWidgetProperties
  );
}
