import { WidgetFactory } from '../../types';
import { createDocumentationMessageGenerator, noop } from '../../lib/utils';
import connectQueryRules, {
  ParamTrackedFilters,
  ParamTransformRuleContexts,
  QueryRulesConnectorParams,
  QueryRulesWidgetDescription,
} from '../../connectors/query-rules/connectQueryRules';

type QueryRuleContextWidgetParams = {
  trackedFilters: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
};

type QueryRuleContext = WidgetFactory<
  QueryRulesWidgetDescription & { $$widgetType: 'ais.queryRuleContext' },
  QueryRulesConnectorParams,
  QueryRuleContextWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-context',
});

const queryRuleContext: QueryRuleContext = (
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
