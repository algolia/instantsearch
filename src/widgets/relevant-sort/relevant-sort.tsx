/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Renderer, Template } from '../../types';
import connectRelevantSort, {
  RelevantSortConnectorParams,
  RelevantSortRenderState,
  RelevantSortWidgetDescription,
} from '../../connectors/relevant-sort/connectRelevantSort';
import RelevantSort from '../../components/RelevantSort/RelevantSort';
import defaultTemplates from './defaultTemplates';

export type RelevantSortCSSClasses = Partial<{
  root: string;
  text: string;
  button: string;
}>;

export type RelevantSortTemplates = Partial<{
  text: Template<{ isRelevantSorted: boolean }>;
  button: Template<{ isRelevantSorted: boolean }>;
}>;

type RelevantSortWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: RelevantSortCSSClasses;
  templates?: RelevantSortTemplates;
};

type RelevantSortRendererWidgetParams = {
  container: HTMLElement;
  cssClasses: RelevantSortCSSClasses;
  templates: RelevantSortTemplates;
} & RelevantSortWidgetParams;

type RelevantSortWidget = WidgetFactory<
  RelevantSortWidgetDescription & { $$widgetType: 'ais.relevantSort' },
  RelevantSortConnectorParams,
  RelevantSortWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'relevant-sort',
});

const suit = component('RelevantSort');

const renderer: Renderer<
  RelevantSortRenderState,
  RelevantSortRendererWidgetParams
> = ({ isRelevantSorted, isVirtualReplica, refine, widgetParams }) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <RelevantSort
      cssClasses={cssClasses}
      templates={templates}
      isRelevantSorted={isRelevantSorted}
      isVirtualReplica={isVirtualReplica}
      refine={refine}
    />,
    container
  );
};

const relevantSort: RelevantSortWidget = widgetParams => {
  const {
    container,
    templates: userTemplates = {} as RelevantSortTemplates,
    cssClasses: userCssClasses = {} as RelevantSortCSSClasses,
  } = widgetParams;

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const cssClasses: RelevantSortCSSClasses = {
    root: cx(suit(), userCssClasses.root),
    text: cx(suit({ descendantName: 'text' }), userCssClasses.text),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
  };

  const templates: RelevantSortTemplates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const containerNode = getContainerNode(container);
  const makeWidget = connectRelevantSort(renderer, () => {
    render(null, containerNode);
  });

  return {
    ...makeWidget({
      container: containerNode,
      cssClasses,
      templates,
    }),
    $$widgetType: 'ais.relevantSort',
  };
};

export default relevantSort;
