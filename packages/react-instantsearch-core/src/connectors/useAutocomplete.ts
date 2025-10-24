import connectAutocomplete from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  AutocompleteConnectorParams,
  AutocompleteWidgetDescription,
} from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';

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
