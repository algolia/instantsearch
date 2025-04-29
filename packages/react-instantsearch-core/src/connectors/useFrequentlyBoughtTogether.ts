import connectFrequentlyBoughtTogether from 'instantsearch.js/es/connectors/frequently-bought-together/connectFrequentlyBoughtTogether';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { BaseHit } from 'instantsearch.js';
import type {
  FrequentlyBoughtTogetherConnector,
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherWidgetDescription,
} from 'instantsearch.js/es/connectors/frequently-bought-together/connectFrequentlyBoughtTogether';

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
