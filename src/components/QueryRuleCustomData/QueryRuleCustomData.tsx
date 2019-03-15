import React from 'preact-compat';
import { QueryRuleCustomDataTemplates } from '../../widgets/query-rule-custom-data/query-rule-custom-data';
import Template from '../Template/Template';

type QueryRuleCustomDataProps = {
  templates: QueryRuleCustomDataTemplates;
  items: object[];
};

const QueryRuleCustomData = ({
  templates,
  items,
}: QueryRuleCustomDataProps) => (
  <Template templateKey="default" templates={templates} data={items} />
);

export default QueryRuleCustomData;
