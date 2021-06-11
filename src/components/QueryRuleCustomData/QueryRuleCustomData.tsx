/** @jsx h */

import { h } from 'preact';
import { ComponentCSSClasses, ComponentTemplates } from '../../types';
import {
  QueryRuleCustomDataCSSClasses,
  QueryRuleCustomDataTemplates,
} from '../../widgets/query-rule-custom-data/query-rule-custom-data';
import Template from '../Template/Template';

export type QueryRuleCustomDataComponentCSSClasses = ComponentCSSClasses<
  QueryRuleCustomDataCSSClasses
>;

export type QueryRuleCustomDataComponentTemplates = ComponentTemplates<
  QueryRuleCustomDataTemplates
>;

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
