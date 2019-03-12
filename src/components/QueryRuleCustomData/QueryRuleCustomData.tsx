import React from 'preact-compat';
import { QueryRuleCustomDataTemplates } from '../../widgets/query-rule-custom-data/query-rule-custom-data';
import Template from '../Template/Template';

type QueryRuleCustomDataProps = {
  templateProps: {
    templates: QueryRuleCustomDataTemplates;
  };
  items: object[];
};

const QueryRuleCustomData = ({
  templateProps,
  items,
}: QueryRuleCustomDataProps) => (
  <Template {...templateProps} templateKey="default" data={items} />
);

export default QueryRuleCustomData;
