/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Renderer, Template } from '../../types';
import connectSmartSort, {
  SmartSortConnectorParams,
  SmartSortRendererOptions,
} from '../../connectors/smart-sort/connectSmartSort';
import SmartSort from '../../components/SmartSort/SmartSort';
import defaultTemplates from './defaultTemplates';

export type SmartSortCSSClasses = Partial<{
  root: string;
  text: string;
  button: string;
}>;

export type SmartSortTemplates = Partial<{
  text: Template<{ isSmartSorted: boolean }>;
  button: Template<{ isSmartSorted: boolean }>;
}>;

type SmartSortWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: SmartSortCSSClasses;
  templates?: SmartSortTemplates;
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
> = ({ isSmartSorted, isVirtualReplica, refine, widgetParams }) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <SmartSort
      cssClasses={cssClasses}
      templates={templates}
      isSmartSorted={isSmartSorted}
      isVirtualReplica={isVirtualReplica}
      refine={refine}
    />,
    container
  );
};

const smartSort: SmartSortWidget = widgetParams => {
  const {
    container,
    templates: userTemplates = {} as SmartSortTemplates,
    cssClasses: userCssClasses = {} as SmartSortCSSClasses,
  } = widgetParams;

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const cssClasses: SmartSortCSSClasses = {
    root: cx(suit(), userCssClasses.root),
    text: cx(suit({ descendantName: 'text' }), userCssClasses.text),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
  };

  const templates: SmartSortTemplates = {
    ...defaultTemplates,
    ...userTemplates,
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
    }),
    $$widgetType: 'ais.smartSort',
  };
};

export default smartSort;
