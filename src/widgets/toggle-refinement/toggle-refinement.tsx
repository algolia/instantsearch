/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import ToggleRefinement from '../../components/ToggleRefinement/ToggleRefinement';
import connectToggleRefinement, {
  ToggleRefinementConnectorParams,
  ToggleRefinementWidgetDescription,
  ToggleRefinementValue,
  ToggleRefinementRenderState,
} from '../../connectors/toggle-refinement/connectToggleRefinement';
import defaultTemplates from './defaultTemplates';
import {
  getContainerNode,
  prepareTemplateProps,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { RendererOptions, Template, WidgetFactory } from '../../types';
import { component } from '../../lib/suit';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';

const withUsage = createDocumentationMessageGenerator({
  name: 'toggle-refinement',
});
const suit = component('ToggleRefinement');

const renderer = ({
  containerNode,
  cssClasses,
  renderState,
  templates,
}: {
  containerNode: HTMLElement;
  cssClasses: ToggleRefinementComponentCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<ToggleRefinementTemplates>;
  };
  templates: Partial<ToggleRefinementTemplates>;
}) => (
  {
    value,
    refine,
    instantSearchInstance,
  }: ToggleRefinementRenderState &
    RendererOptions<ToggleRefinementConnectorParams>,
  isFirstRendering: boolean
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });

    return;
  }

  render(
    <ToggleRefinement
      cssClasses={cssClasses}
      currentRefinement={value}
      templateProps={renderState.templateProps!}
      refine={refine}
    />,
    containerNode
  );
};

export type ToggleRefinementCSSClasses = {
  /** CSS class to add to the root element. */
  root: string | string[];
  /** CSS class to add to the label wrapping element. */
  label: string | string[];
  /** CSS class to add to the checkbox. */
  checkbox: string | string[];
  /** CSS class to add to the label text. */
  labelText: string | string[];
};

export type ToggleRefinementComponentCSSClasses = {
  [key in keyof ToggleRefinementCSSClasses]: string;
};

export type ToggleRefinementTemplates = {
  /** the text that describes the toggle action */
  labelText: Template<ToggleRefinementValue>;
};

export type ToggleRefinementWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: Partial<ToggleRefinementTemplates>;

  /**
   * CSS classes to be added.
   */
  cssClasses?: Partial<ToggleRefinementCSSClasses>;
};

export type ToggleRefinementWidget = WidgetFactory<
  ToggleRefinementWidgetDescription & {
    $$widgetType: 'ais.toggleRefinement';
  },
  ToggleRefinementConnectorParams,
  ToggleRefinementWidgetParams
>;

/**
 * The toggleRefinement widget lets the user either:
 *  - switch between two values for a single facetted attribute (free_shipping / not_free_shipping)
 *  - toggleRefinement a faceted value on and off (only 'canon' for brands)
 *
 * This widget is particularly useful if you have a boolean value in the records.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 */
const toggleRefinement = function toggleRefinement(widgetParams) {
  const {
    container,
    attribute,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    on = true,
    off,
  } = widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    checkbox: cx(suit({ descendantName: 'checkbox' }), userCssClasses.checkbox),
    labelText: cx(
      suit({ descendantName: 'labelText' }),
      userCssClasses.labelText
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectToggleRefinement(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ attribute, on, off }),
    $$widgetType: 'ais.toggleRefinement',
  };
};

export default toggleRefinement;
