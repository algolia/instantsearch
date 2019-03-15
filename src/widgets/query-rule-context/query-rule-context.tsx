import noop from 'lodash/noop';
import { WidgetFactory } from '../../types';
import { createDocumentationMessageGenerator } from '../../lib/utils';
import connectQueryRules, {
  ParamTrackedFilters,
  ParamTransformRuleContexts,
} from '../../connectors/query-rules/connectQueryRules';

type QueryRulesWidgetParams = {
  trackedFilters: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
};

type QueryRuleContext = WidgetFactory<QueryRulesWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-context',
});

const queryRuleContext: QueryRuleContext = (
  { trackedFilters, transformRuleContexts } = {} as QueryRulesWidgetParams
) => {
  if (!trackedFilters) {
    throw new Error(withUsage('The `trackedFilters` option is required.'));
  }

  return connectQueryRules(noop)({
    trackedFilters,
    transformRuleContexts,
  });
};

export default queryRuleContext;
