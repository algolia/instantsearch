import { connectAutocomplete } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  AutocompleteConnectorParams,
  AutocompleteWidgetDescription,
} from 'instantsearch-core';

export type UseAutocompleteProps = AutocompleteConnectorParams;

export function useAutocomplete(
  props?: UseAutocompleteProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    AutocompleteConnectorParams,
    AutocompleteWidgetDescription
  >(connectAutocomplete, props, additionalWidgetProperties);
}
