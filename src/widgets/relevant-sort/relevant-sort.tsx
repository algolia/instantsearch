/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Template } from '../../types';
import connectRelevantSort, {
  RelevantSortConnectorParams,
  RelevantSortRenderState,
  RelevantSortWidgetDescription,
} from '../../connectors/relevant-sort/connectRelevantSort';
import RelevantSort, {
  RelevantSortComponentCSSClasses,
} from '../../components/RelevantSort/RelevantSort';
import defaultTemplates from './defaultTemplates';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';

export type RelevantSortCSSClasses = {
  root?: string;
  text?: string;
  button?: string;
};

export type RelevantSortTemplates = Partial<{
  text: Template<{ isRelevantSorted: boolean }>;
  button: Template<{ isRelevantSorted: boolean }>;
}>;

type RelevantSortWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: RelevantSortCSSClasses;
  templates?: RelevantSortTemplates;
};

type RelevantSortWidget = WidgetFactory<
  RelevantSortWidgetDescription & { $$widgetType: 'ais.relevantSort' },
  RelevantSortConnectorParams,
  RelevantSortWidgetParams
>;

const withUsage = createDocumentationMessageGenerator({
  name: 'relevant-sort',
});

const suit = component('RelevantSort');

const renderer = ({
  containerNode,
  cssClasses,
  templates,
}: {
  containerNode: HTMLElement;
  cssClasses: RelevantSortComponentCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<RelevantSortTemplates>;
  };
  templates: RelevantSortTemplates;
}) => ({
  isRelevantSorted,
  isVirtualReplica,
  refine,
}: RelevantSortRenderState) => {
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

const relevantSort: RelevantSortWidget = widgetParams => {
  const {
    container,
    templates: userTemplates = {} as RelevantSortTemplates,
    cssClasses: userCssClasses = {} as RelevantSortCSSClasses,
  } = widgetParams;

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses: RelevantSortComponentCSSClasses = {
    root: cx(suit(), userCssClasses.root),
    text: cx(suit({ descendantName: 'text' }), userCssClasses.text),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
  };
  const templates: RelevantSortTemplates = {
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
