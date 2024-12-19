/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import ClearRefinements from '../../components/ClearRefinements/ClearRefinements';
import connectClearRefinements from '../../connectors/clear-refinements/connectClearRefinements';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  ClearRefinementsComponentCSSClasses,
  ClearRefinementsComponentTemplates,
} from '../../components/ClearRefinements/ClearRefinements';
import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsRenderState,
  ClearRefinementsWidgetDescription,
} from '../../connectors/clear-refinements/connectClearRefinements';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Template, Renderer } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'clear-refinements',
});
const suit = component('ClearRefinements');

const renderer =
  ({
    containerNode,
    cssClasses,
    renderState,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: ClearRefinementsComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<ClearRefinementsComponentTemplates>;
    };
    templates: ClearRefinementsTemplates;
  }): Renderer<
    ClearRefinementsRenderState,
    Partial<ClearRefinementsWidgetParams>
  > =>
  ({ refine, canRefine }, isFirstRendering) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
        templates,
      });
      return;
    }

    render(
      <ClearRefinements
        refine={refine}
        cssClasses={cssClasses}
        canRefine={canRefine}
        templateProps={renderState.templateProps!}
      />,
      containerNode
    );
  };

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
  resetLabel: Template<{ canRefine: boolean }>;
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

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
    disabledButton: cx(
      suit({ descendantName: 'button', modifierName: 'disabled' }),
      userCssClasses.disabledButton
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
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
