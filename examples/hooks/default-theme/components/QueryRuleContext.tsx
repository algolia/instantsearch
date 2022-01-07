import { useQueryRules, UseQueryRulesProps } from 'react-instantsearch-hooks';

export type QueryRuleContextProps = Partial<
  Pick<UseQueryRulesProps, 'trackedFilters' | 'transformRuleContexts'>
>;

export function QueryRuleContext(props: QueryRuleContextProps) {
  useQueryRules(props);
  return null;
}
