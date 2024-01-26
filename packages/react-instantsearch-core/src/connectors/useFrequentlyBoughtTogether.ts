import connectFrequentlyBoughtTogether from 'instantsearch.js/es/connectors/frequently-bought-together/connectFrequentlyBoughtTogether';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherWidgetDescription,
} from 'instantsearch.js/es/connectors/frequently-bought-together/connectFrequentlyBoughtTogether';

export type UseFrequentlyBoughtTogetherProps =
  FrequentlyBoughtTogetherConnectorParams;

export function useFrequentlyBoughtTogether(
  props: UseFrequentlyBoughtTogetherProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    FrequentlyBoughtTogetherConnectorParams,
    FrequentlyBoughtTogetherWidgetDescription
  >(connectFrequentlyBoughtTogether, props, additionalWidgetProperties);
}
