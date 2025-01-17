import { connectToggleRefinement } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  ToggleRefinementConnectorParams,
  ToggleRefinementWidgetDescription,
} from 'instantsearch-core';

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
