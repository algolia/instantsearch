/** @jsx h */

import { h } from 'preact';
import {
  QueryRuleCustomDataCSSClasses,
  QueryRuleCustomDataTemplates,
} from '../../widgets/query-rule-custom-data/query-rule-custom-data';
import Template from '../Template/Template';

export type QueryRuleCustomDataProps = {
  cssClasses: QueryRuleCustomDataCSSClasses;
  templates: QueryRuleCustomDataTemplates;
  items: any[];
};

const QueryRuleCustomData = ({
  cssClasses,
  templates,
  items,
}: QueryRuleCustomDataProps) => (
  <Template
    templateKey="default"
    templates={templates}
    rootProps={{ className: cssClasses.root }}
    data={{ items }}
  />
);

export default QueryRuleCustomData;
