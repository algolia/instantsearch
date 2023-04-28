import connectToggleRefinement from 'instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { UseParentIndexProps } from '../lib/useParentIndex';
import type {
  ToggleRefinementConnectorParams,
  ToggleRefinementWidgetDescription,
} from 'instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement';

export type UseToggleRefinementProps = ToggleRefinementConnectorParams &
  UseParentIndexProps;

export function useToggleRefinement(
  props: UseToggleRefinementProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    ToggleRefinementConnectorParams,
    ToggleRefinementWidgetDescription
  >(connectToggleRefinement, props, additionalWidgetProperties);
}
