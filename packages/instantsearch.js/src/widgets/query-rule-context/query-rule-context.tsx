import { createDocumentationMessageGenerator, noop } from 'instantsearch-core';

import { connectQueryRules } from '../../connectors';

import type {
  ParamTrackedFilters,
  ParamTransformRuleContexts,
  QueryRulesConnectorParams,
  QueryRulesWidgetDescription,
} from '../../connectors';
import type { WidgetFactory } from 'instantsearch-core';

export type QueryRuleContextWidgetParams = {
  trackedFilters: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
};

export type QueryRuleContextWidget = WidgetFactory<
  QueryRulesWidgetDescription & { $$widgetType: 'ais.queryRuleContext' },
  QueryRulesConnectorParams,
  QueryRuleContextWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-context',
});

const queryRuleContext: QueryRuleContextWidget = (
  widgetParams = {} as QueryRuleContextWidgetParams
) => {
  if (!widgetParams.trackedFilters) {
    throw new Error(withUsage('The `trackedFilters` option is required.'));
  }

  return {
    ...connectQueryRules<QueryRuleContextWidgetParams>(noop)(widgetParams),
    $$widgetType: 'ais.queryRuleContext',
  };
};

export default queryRuleContext;
