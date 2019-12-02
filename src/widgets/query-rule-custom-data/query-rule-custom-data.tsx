/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory } from '../../types';
import connectQueryRules, {
  QueryRulesRenderer,
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

interface QueryRuleCustomDataRendererWidgetParams
  extends QueryRuleCustomDataWidgetParams {
  container: HTMLElement;
  cssClasses: QueryRuleCustomDataCSSClasses;
  templates: QueryRuleCustomDataTemplates;
}

type QueryRuleCustomData = WidgetFactory<QueryRuleCustomDataWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rule-custom-data',
});

const suit = component('QueryRuleCustomData');

const renderer: QueryRulesRenderer<QueryRuleCustomDataRendererWidgetParams> = ({
  items,
  widgetParams,
}) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <CustomData cssClasses={cssClasses} templates={templates} items={items} />,
    container
  );
};

const queryRuleCustomData: QueryRuleCustomData = (
  {
    container,
    cssClasses: userCssClasses = {} as QueryRuleCustomDataCSSClasses,
    templates: userTemplates = {},
    transformItems = items => items,
  } = {} as QueryRuleCustomDataWidgetParams
) => {
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
  };
};

export default queryRuleCustomData;
