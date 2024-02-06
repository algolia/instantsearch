/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import CustomData from '../../components/QueryRuleCustomData/QueryRuleCustomData';
import connectQueryRules from '../../connectors/query-rules/connectQueryRules';
import { component } from '../../lib/suit';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  QueryRuleCustomDataComponentCSSClasses,
  QueryRuleCustomDataComponentTemplates,
} from '../../components/QueryRuleCustomData/QueryRuleCustomData';
import type {
  QueryRulesConnectorParams,
  QueryRulesRenderState,
  QueryRulesWidgetDescription,
} from '../../connectors/query-rules/connectQueryRules';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Template } from '../../types';

export type QueryRuleCustomDataCSSClasses = Partial<{
  root: string | string[];
}>;

export type QueryRuleCustomDataTemplates = Partial<{
  default: Template<{ items: any[] }>;
}>;

export type QueryRuleCustomDataWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: QueryRuleCustomDataCSSClasses;
  templates?: QueryRuleCustomDataTemplates;
};

export type QueryRuleCustomDataWidget = WidgetFactory<
  QueryRulesWidgetDescription & { $$widgetType: 'ais.queryRuleCustomData' },
  QueryRulesConnectorParams,
  QueryRuleCustomDataWidgetParams
>;

export const defaultTemplates: QueryRuleCustomDataComponentTemplates = {
  default: ({ items }) => JSON.stringify(items, null, 2),
};

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-custom-data',
});

const suit = component('QueryRuleCustomData');

const renderer =
  ({
    containerNode,
    cssClasses,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: QueryRuleCustomDataComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<QueryRuleCustomDataComponentTemplates>;
    };
    templates: QueryRuleCustomDataComponentTemplates;
  }) =>
  ({ items }: QueryRulesRenderState) => {
    render(
      <CustomData
        cssClasses={cssClasses}
        templates={templates}
        items={items}
      />,
      containerNode
    );
  };

const queryRuleCustomData: QueryRuleCustomDataWidget = (widgetParams) => {
  const {
    container,
    cssClasses: userCssClasses = {},
    templates: userTemplates = {},
    transformItems = ((items) =>
      items) as QueryRulesConnectorParams['transformItems'],
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const containerNode = getContainerNode(container);
  const templates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectQueryRules(specializedRenderer, () => {
    render(null, containerNode);
  });

  return {
    ...makeWidget({
      transformItems,
    }),
    $$widgetType: 'ais.queryRuleCustomData',
  };
};

export default queryRuleCustomData;
