/** @jsx h */

import { h } from 'preact';

import Template from '../Template/Template';

import type { ComponentCSSClasses } from '../../types';
import type {
  QueryRuleCustomDataCSSClasses,
  QueryRuleCustomDataTemplates,
} from '../../widgets/query-rule-custom-data/query-rule-custom-data';

export type QueryRuleCustomDataComponentCSSClasses =
  ComponentCSSClasses<QueryRuleCustomDataCSSClasses>;

export type QueryRuleCustomDataComponentTemplates =
  Required<QueryRuleCustomDataTemplates>;

export type QueryRuleCustomDataProps = {
  cssClasses: QueryRuleCustomDataComponentCSSClasses;
  templates: QueryRuleCustomDataComponentTemplates;
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
