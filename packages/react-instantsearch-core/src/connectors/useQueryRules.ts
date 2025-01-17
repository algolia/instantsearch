import { connectQueryRules } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  QueryRulesConnectorParams,
  QueryRulesWidgetDescription,
} from 'instantsearch-core';

export type UseQueryRulesProps = QueryRulesConnectorParams;

export function useQueryRules(
  props?: UseQueryRulesProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<QueryRulesConnectorParams, QueryRulesWidgetDescription>(
    connectQueryRules,
    props,
    additionalWidgetProperties
  );
}
