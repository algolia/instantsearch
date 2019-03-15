import React, { render, unmountComponentAtNode } from 'preact-compat';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { WidgetFactory } from '../../types';
import connectQueryRules, {
  QueryRulesRenderer,
} from '../../connectors/query-rules/connectQueryRules';
import CustomData from '../../components/QueryRuleCustomData/QueryRuleCustomData';

export type QueryRuleCustomDataTemplates = {
  default: string | ((items: object[]) => string);
};

type QueryRuleCustomDataWidgetParams = {
  container: string | HTMLElement;
  templates?: QueryRuleCustomDataTemplates;
  transformItems?: (items: object[]) => any;
};

interface QueryRuleCustomDataConnectorWidgetParams
  extends QueryRuleCustomDataWidgetParams {
  container: HTMLElement;
  templates: QueryRuleCustomDataTemplates;
}

type QueryRuleCustomData = WidgetFactory<QueryRuleCustomDataWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-custom-data',
});

const renderer: QueryRulesRenderer<
  QueryRuleCustomDataConnectorWidgetParams
> = ({ userData, widgetParams }) => {
  const { container, templates } = widgetParams;

  render(<CustomData templates={templates} items={userData} />, container);
};

const queryRuleCustomData: QueryRuleCustomData = (
  {
    container,
    templates: userTemplates = {},
    transformItems = items => items,
  } = {} as QueryRuleCustomDataWidgetParams
) => {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const defaultTemplates = { default: '' };
  const templates: QueryRuleCustomDataTemplates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const containerNode = getContainerNode(container);
  const makeQueryRuleCustomData = connectQueryRules(renderer, () => {
    unmountComponentAtNode(containerNode);
  });

  return makeQueryRuleCustomData({
    container: containerNode,
    templates,
    transformItems,
  });
};

export default queryRuleCustomData;
