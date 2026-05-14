/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import RelevantSort from '../../components/RelevantSort/RelevantSort';
import { connectRelevantSort } from '../../connectors';
import { component } from '../../lib/suit';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  RelevantSortComponentCSSClasses,
  RelevantSortComponentTemplates,
} from '../../components/RelevantSort/RelevantSort';
import type {
  RelevantSortConnectorParams,
  RelevantSortRenderState,
  RelevantSortWidgetDescription,
} from '../../connectors';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Template } from '../../types';

export type RelevantSortCSSClasses = Partial<{
  root: string;
  text: string;
  button: string;
}>;

export type RelevantSortTemplates = Partial<{
  text: Template<{ isRelevantSorted: boolean }>;
  button: Template<{ isRelevantSorted: boolean }>;
}>;

export type RelevantSortWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: RelevantSortCSSClasses;
  templates?: RelevantSortTemplates;
};

export type RelevantSortWidget = WidgetFactory<
  RelevantSortWidgetDescription & { $$widgetType: 'ais.relevantSort' },
  RelevantSortConnectorParams,
  RelevantSortWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'relevant-sort',
});

const suit = component('RelevantSort');

const renderer =
  ({
    containerNode,
    cssClasses,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: RelevantSortComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<RelevantSortComponentTemplates>;
    };
    templates: RelevantSortComponentTemplates;
  }) =>
  ({ isRelevantSorted, isVirtualReplica, refine }: RelevantSortRenderState) => {
    render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={templates}
        isRelevantSorted={isRelevantSorted}
        isVirtualReplica={isVirtualReplica}
        refine={refine}
      />,
      containerNode
    );
  };

const relevantSort: RelevantSortWidget = (widgetParams) => {
  const {
    container,
    templates: userTemplates = {},
    cssClasses: userCssClasses = {},
  } = widgetParams;

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    text: cx(suit({ descendantName: 'text' }), userCssClasses.text),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
  };
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

  const makeWidget = connectRelevantSort(specializedRenderer, () => {
    render(null, containerNode);
  });

  return {
    ...makeWidget({}),
    $$widgetType: 'ais.relevantSort',
  };
};

export default relevantSort;
