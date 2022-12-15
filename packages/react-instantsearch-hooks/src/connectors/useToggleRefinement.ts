import connectToggleRefinement from 'instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ToggleRefinementConnectorParams,
  ToggleRefinementWidgetDescription,
} from 'instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement';

export type UseToggleRefinementProps = ToggleRefinementConnectorParams;

export function useToggleRefinement(
  props: UseToggleRefinementProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ToggleRefinementConnectorParams,
    ToggleRefinementWidgetDescription
  >(connectToggleRefinement, props, additionalWidgetProperties);
}
