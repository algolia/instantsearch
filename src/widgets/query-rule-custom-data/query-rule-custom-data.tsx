/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Renderer, Template } from '../../types';
import connectQueryRules, {
  QueryRulesConnectorParams,
  QueryRulesRenderState,
  QueryRulesWidgetDescription,
} from '../../connectors/query-rules/connectQueryRules';
import CustomData from '../../components/QueryRuleCustomData/QueryRuleCustomData';

export type QueryRuleCustomDataCSSClasses = {
  root: string;
};

export type QueryRuleCustomDataTemplates = {
  default: Template<{ items: any[] }>;
};

type QueryRuleCustomDataWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: QueryRuleCustomDataCSSClasses;
  templates?: Partial<QueryRuleCustomDataTemplates>;
};

type QueryRuleCustomDataRendererWidgetParams = {
  container: HTMLElement;
  cssClasses: QueryRuleCustomDataCSSClasses;
  templates: QueryRuleCustomDataTemplates;
} & QueryRuleCustomDataWidgetParams;

type QueryRuleCustomDataWidget = WidgetFactory<
  QueryRulesWidgetDescription & { $$widgetType: 'ais.queryRuleCustomData' },
  QueryRulesConnectorParams,
  QueryRuleCustomDataWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-custom-data',
});

const suit = component('QueryRuleCustomData');

const renderer: Renderer<
  QueryRulesRenderState,
  QueryRuleCustomDataRendererWidgetParams
> = ({ items, widgetParams }) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <CustomData cssClasses={cssClasses} templates={templates} items={items} />,
    container
  );
};

const queryRuleCustomData: QueryRuleCustomDataWidget = widgetParams => {
  const {
    container,
    cssClasses: userCssClasses = {} as QueryRuleCustomDataCSSClasses,
    templates: userTemplates = {},
    transformItems = (items =>
      items) as QueryRulesConnectorParams['transformItems'],
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const defaultTemplates = {
    default: ({ items }) => JSON.stringify(items, null, 2),
  };
  const templates: QueryRuleCustomDataTemplates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const containerNode = getContainerNode(container);
  const makeWidget = connectQueryRules(renderer, () => {
    render(null, containerNode);
  });

  return {
    ...makeWidget({
      container: containerNode,
      cssClasses,
      templates,
      transformItems,
    }),
    $$widgetType: 'ais.queryRuleCustomData',
  };
};

export default queryRuleCustomData;
