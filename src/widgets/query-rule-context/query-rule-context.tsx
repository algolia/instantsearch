import { WidgetFactory } from '../../types';
import { createDocumentationMessageGenerator, noop } from '../../lib/utils';
import connectQueryRules, {
  ParamTrackedFilters,
  ParamTransformRuleContexts,
  QueryRulesConnectorParams,
} from '../../connectors/query-rules/connectQueryRules';

type QueryRuleContextWidgetParams = {
  trackedFilters: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
};

type QueryRuleContext = WidgetFactory<
  QueryRulesConnectorParams,
  QueryRuleContextWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-context',
});

const queryRuleContext: QueryRuleContext = widgetOptions => {
  const { trackedFilters, transformRuleContexts } =
    widgetOptions || ({} as QueryRuleContextWidgetParams);

  if (!trackedFilters) {
    throw new Error(withUsage('The `trackedFilters` option is required.'));
  }

  return {
    ...connectQueryRules(noop)({
      trackedFilters,
      transformRuleContexts,
    }),

    $$type: 'ais.queryRuleContext',
    $$params: widgetOptions,
  };
};

export default queryRuleContext;
