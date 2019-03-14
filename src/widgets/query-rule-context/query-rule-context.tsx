import noop from 'lodash/noop';
import { WidgetFactory } from '../../types';
import connectQueryRules, {
  QueryRulesConnectorParams,
} from '../../connectors/query-rules/connectQueryRules';

type QueryRulesWidgetParams = Pick<
  QueryRulesConnectorParams,
  'trackedFilters' | 'transformRuleContexts'
>;

type QueryRuleContext = WidgetFactory<QueryRulesWidgetParams>;

const queryRuleContext: QueryRuleContext = ({
  trackedFilters,
  transformRuleContexts,
} = {}) => {
  return connectQueryRules(noop)({
    trackedFilters,
    transformRuleContexts,
  });
};

export default queryRuleContext;
