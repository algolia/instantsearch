import { connectFrequentlyBoughtTogether } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  BaseHit,
  FrequentlyBoughtTogetherConnector,
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherWidgetDescription,
} from 'instantsearch-core';

export type UseFrequentlyBoughtTogetherProps<THit extends BaseHit = BaseHit> =
  FrequentlyBoughtTogetherConnectorParams<THit>;

export function useFrequentlyBoughtTogether<THit extends BaseHit = BaseHit>(
  props?: UseFrequentlyBoughtTogetherProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    FrequentlyBoughtTogetherConnectorParams<THit>,
    FrequentlyBoughtTogetherWidgetDescription<THit>
  >(
    connectFrequentlyBoughtTogether as FrequentlyBoughtTogetherConnector<THit>,
    props,
    additionalWidgetProperties
  );
}
