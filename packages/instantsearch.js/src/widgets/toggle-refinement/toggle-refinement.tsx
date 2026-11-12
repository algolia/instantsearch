/** @jsx h */

import { createDocumentationMessageGenerator } from 'instantsearch-core';
import { createToggleRefinementComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import Template from '../../components/Template/Template';
import { connectToggleRefinement } from '../../connectors';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  ToggleRefinementConnectorParams,
  ToggleRefinementWidgetDescription,
  ToggleRefinementRenderState,
} from '../../connectors';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template as TemplateType } from '../../types';
import type { RendererOptions, WidgetFactory } from 'instantsearch-core';

const withUsage = createDocumentationMessageGenerator({
  name: 'toggle-refinement',
});

const ToggleRefinement = createToggleRefinementComponent({
  createElement: h,
  Fragment,
});

export type ToggleRefinementCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the label wrapping element.
   */
  label: string | string[];
  /**
   * CSS class to add to the checkbox.
   */
  checkbox: string | string[];
  /**
   * CSS class to add to the label text.
   */
  labelText: string | string[];
}>;

export type ToggleRefinementTemplates = Partial<{
  /**
   * the text that describes the toggle action
   */
  labelText: TemplateType<ToggleRefinementRenderState['value']>;
}>;

export type ToggleRefinementWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: ToggleRefinementTemplates;

  /**
   * CSS classes to be added.
   */
  cssClasses?: ToggleRefinementCSSClasses;
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
const toggleRefinement: ToggleRefinementWidget = function toggleRefinement(
  widgetParams
) {
  const {
    container,
    attribute,
    cssClasses: userCssClasses = {},
    templates = {},
    on = true,
    off,
  } = widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const classNames: ToggleRefinementCSSClasses = {
    root: userCssClasses.root,
    label: userCssClasses.label,
    checkbox: userCssClasses.checkbox,
    labelText: userCssClasses.labelText,
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

  const makeWidget = connectToggleRefinement(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ attribute, on, off }),
    $$widgetType: 'ais.toggleRefinement',
  };
};

const renderer =
  ({
    containerNode,
    classNames,
    templateProps,
  }: {
    containerNode: HTMLElement;
    classNames: ToggleRefinementCSSClasses;
    templateProps: PreparedTemplateProps<Required<ToggleRefinementTemplates>>;
  }) =>
  (
    {
      value,
      refine,
    }: ToggleRefinementRenderState &
      RendererOptions<ToggleRefinementConnectorParams>,
    isFirstRendering: boolean
  ) => {
    if (isFirstRendering) {
      return;
    }

    render(
      <ToggleRefinement
        classNames={classNames}
        checked={value.isRefined}
        labelTextComponent={({ value }) => (
          <Template
            {...templateProps}
            rootTagName="fragment"
            templateKey="labelText"
            data={value}
          />
        )}
        onChange={(isChecked) => refine({ isRefined: !isChecked })}
        value={value}
      />,
      containerNode
    );
  };

export default toggleRefinement;
