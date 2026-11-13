/** @jsx h */

import { createDocumentationMessageGenerator } from 'instantsearch-core';
import { createClearRefinementsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import Template from '../../components/Template/Template';
import { connectClearRefinements } from '../../connectors';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsRenderState,
  ClearRefinementsWidgetDescription,
} from '../../connectors';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template as TemplateType } from '../../types';
import type { WidgetFactory, Renderer } from 'instantsearch-core';

const withUsage = createDocumentationMessageGenerator({
  name: 'clear-refinements',
});

const ClearRefinements = createClearRefinementsComponent({
  createElement: h,
  Fragment,
});

export type ClearRefinementsCSSClasses = Partial<{
  /**
   * CSS class to add to the wrapper element.
   */
  root: string | string[];

  /**
   * CSS class to add to the button of the widget.
   */
  button: string | string[];

  /**
   * CSS class to add to the button when there are no refinements.
   */
  disabledButton: string | string[];
}>;

export type ClearRefinementsTemplates = Partial<{
  /**
   * Template for the content of the button
   */
  resetLabel: TemplateType<{ canRefine: boolean }>;
}>;

export type ClearRefinementsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: ClearRefinementsTemplates;

  /**
   * CSS classes to be added.
   */
  cssClasses?: ClearRefinementsCSSClasses;
};

export type ClearRefinementsWidget = WidgetFactory<
  ClearRefinementsWidgetDescription & { $$widgetType: 'ais.clearRefinements' },
  ClearRefinementsConnectorParams,
  ClearRefinementsWidgetParams
>;

const renderer = ({
  containerNode,
  classNames,
  templateProps,
}: {
  containerNode: HTMLElement;
  classNames: ClearRefinementsCSSClasses;
  templateProps: PreparedTemplateProps<Required<ClearRefinementsTemplates>>;
}): Renderer<
  ClearRefinementsRenderState,
  Partial<ClearRefinementsWidgetParams>
> => {
  // Created once per widget instance so Preact doesn't remount the template
  // subtree on every render; the changing data (`canRefine`) comes in
  // through the props.
  const resetLabelComponent = ({ canRefine }: { canRefine: boolean }) => (
    <Template
      {...templateProps}
      rootTagName="fragment"
      templateKey="resetLabel"
      data={{ canRefine }}
    />
  );

  return ({ refine, canRefine }, isFirstRendering) => {
    if (isFirstRendering) {
      return;
    }

    render(
      <ClearRefinements
        canRefine={canRefine}
        onClick={refine}
        classNames={classNames}
        resetLabelComponent={resetLabelComponent}
      />,
      containerNode
    );
  };
};

const clearRefinements: ClearRefinementsWidget = (widgetParams) => {
  const {
    container,
    templates = {},
    includedAttributes,
    excludedAttributes,
    transformItems,
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const classNames: ClearRefinementsCSSClasses = {
    root: userCssClasses.root,
    button: userCssClasses.button,
    disabledButton: userCssClasses.disabledButton,
  };

  const templateProps = prepareTemplateProps({
    defaultTemplates,
    templates,
  });

  const specializedRenderer = renderer({
    containerNode,
    classNames,
    templateProps,
  });

  const makeWidget = connectClearRefinements(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      includedAttributes,
      excludedAttributes,
      transformItems,
    }),
    $$widgetType: 'ais.clearRefinements',
  };
};

export default clearRefinements;
