/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Renderer } from '../../types';
import connectSmartSort, {
  SmartSortConnectorParams,
  SmartSortRendererOptions,
} from '../../connectors/smart-sort/connectSmartSort';
import SmartSort from '../../components/SmartSort/SmartSort';

export type SmartSortCSSClasses = {
  root: string;
};

export type SmartSortTemplates = {
  default: string | (({ isSmartSorted }: { isSmartSorted: boolean }) => string);
};

type SmartSortWidgetParams = {
  container: string | HTMLElement;
  relevancyStrictness?: number;
  cssClasses?: SmartSortCSSClasses;
  templates: SmartSortTemplates;
};

type SmartSortRendererWidgetParams = {
  container: HTMLElement;
  cssClasses: SmartSortCSSClasses;
  templates: SmartSortTemplates;
} & SmartSortWidgetParams;

type SmartSortWidget = WidgetFactory<
  SmartSortRendererOptions,
  SmartSortConnectorParams,
  SmartSortWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'smart-sort',
});

const suit = component('SmartSort');

const renderer: Renderer<
  SmartSortRendererOptions,
  SmartSortRendererWidgetParams
> = ({ isSmartSorted, refine, widgetParams }) => {
  const {
    container,
    cssClasses,
    templates,
    relevancyStrictness,
  } = widgetParams;

  render(
    <SmartSort
      cssClasses={cssClasses}
      templates={templates}
      isSmartSorted={isSmartSorted}
      relevancyStrictness={relevancyStrictness}
      refine={refine}
    />,
    container
  );
};

const smartSort: SmartSortWidget = widgetParams => {
  const {
    container,
    templates,
    relevancyStrictness,
    cssClasses: userCssClasses = {} as SmartSortCSSClasses,
  } = widgetParams;

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (!templates || !templates.default) {
    throw new Error(withUsage('The `templates.default` option is required.'));
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const containerNode = getContainerNode(container);
  const makeWidget = connectSmartSort(renderer, () => {
    render(null, containerNode);
  });

  return {
    ...makeWidget({
      container: containerNode,
      cssClasses,
      templates,
      relevancyStrictness,
    }),
    $$widgetType: 'ais.smartSort',
  };
};

export default smartSort;
