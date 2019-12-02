import { WidgetFactory } from '../../types';
import { createDocumentationMessageGenerator, noop } from '../../lib/utils';
import connectQueryRules, {
  ParamTrackedFilters,
  ParamTransformRuleContexts,
} from '../../connectors/query-rules/connectQueryRules';

type QueryRuleContextWidgetParams = {
  trackedFilters: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
};

type QueryRuleContext = WidgetFactory<QueryRuleContextWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-context',
});

const queryRuleContext: QueryRuleContext = (
  { trackedFilters, transformRuleContexts } = {} as QueryRuleContextWidgetParams
) => {
  if (!trackedFilters) {
    throw new Error(withUsage('The `trackedFilters` option is required.'));
  }

  return {
    ...connectQueryRules(noop)({
      trackedFilters,
      transformRuleContexts,
    }),

    $$type: 'ais.queryRuleContext',
  };
};

export default queryRuleContext;
