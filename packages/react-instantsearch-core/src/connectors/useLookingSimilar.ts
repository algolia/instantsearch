import connectLookingSimilar from 'instantsearch.js/es/connectors/looking-similar/connectLookingSimilar';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { BaseHit } from 'instantsearch.js';
import type {
  LookingSimilarConnector,
  LookingSimilarConnectorParams,
  LookingSimilarWidgetDescription,
} from 'instantsearch.js/es/connectors/looking-similar/connectLookingSimilar';

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
