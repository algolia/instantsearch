/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Renderer } from '../../types';
import connectQueryRules, {
  QueryRulesConnectorParams,
  QueryRulesRendererOptions,
} from '../../connectors/query-rules/connectQueryRules';
import CustomData from '../../components/QueryRuleCustomData/QueryRuleCustomData';

export type QueryRuleCustomDataCSSClasses = {
  root: string;
};

export type QueryRuleCustomDataTemplates = {
  default?: string | (({ items }: { items: any }) => string);
};

type QueryRuleCustomDataWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: QueryRuleCustomDataCSSClasses;
  templates?: QueryRuleCustomDataTemplates;
  transformItems?: (items: any[]) => any;
};

type QueryRuleCustomDataRendererWidgetParams = {
  container: HTMLElement;
  cssClasses: QueryRuleCustomDataCSSClasses;
  templates: QueryRuleCustomDataTemplates;
} & QueryRuleCustomDataWidgetParams;

type QueryRuleCustomDataWidget = WidgetFactory<
  QueryRulesRendererOptions,
  QueryRulesConnectorParams,
  QueryRuleCustomDataWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-custom-data',
});

const suit = component('QueryRuleCustomData');

const renderer: Renderer<
  QueryRulesRendererOptions,
  QueryRuleCustomDataRendererWidgetParams
> = ({ items, widgetParams }) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <CustomData cssClasses={cssClasses} templates={templates} items={items} />,
    container
  );
};

const queryRuleCustomData: QueryRuleCustomDataWidget = widgetOptions => {
  const {
    container,
    cssClasses: userCssClasses = {} as QueryRuleCustomDataCSSClasses,
    templates: userTemplates = {},
    transformItems = items => items,
  } = widgetOptions || ({} as QueryRuleCustomDataWidgetParams);

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
  const makeQueryRuleCustomData = connectQueryRules(renderer, () => {
    render(null, containerNode);
  });

  return {
    ...makeQueryRuleCustomData({
      container: containerNode,
      cssClasses,
      templates,
      transformItems,
    }),

    $$type: 'ais.queryRuleCustomData',
    $$officialWidget: true,
  };
};

export default queryRuleCustomData;
