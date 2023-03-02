/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h, render } from 'preact';

import CurrentRefinements from '../../components/CurrentRefinements/CurrentRefinements';
import connectCurrentRefinements from '../../connectors/current-refinements/connectCurrentRefinements';
import { component } from '../../lib/suit';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsRenderState,
  CurrentRefinementsWidgetDescription,
} from '../../connectors/current-refinements/connectCurrentRefinements';
import type { ComponentCSSClasses, Renderer, WidgetFactory } from '../../types';

export type CurrentRefinementsCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];

  /**
   * CSS class to add to the root element when no refinements.
   */
  noRefinementRoot: string | string[];

  /**
   * CSS class to add to the list element.
   */
  list: string | string[];

  /**
   * CSS class to add to the each item element.
   */
  item: string | string[];

  /**
   * CSS class to add to the label element.
   */
  label: string | string[];

  /**
   * CSS class to add to the category element.
   */
  category: string | string[];

  /**
   * CSS class to add to the categoryLabel element.
   */
  categoryLabel: string | string[];

  /**
   * CSS class to add to the delete element.
   */
  delete: string | string[];
}>;

export type CurrentRefinementsWidgetParams = {
  /**
   * The CSS Selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * The CSS classes to override.
   */
  cssClasses?: CurrentRefinementsCSSClasses;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'current-refinements',
});
const suit = component('CurrentRefinements');

const renderer: Renderer<
  CurrentRefinementsRenderState,
  Partial<CurrentRefinementsWidgetParams>
> = ({ items, widgetParams, canRefine }, isFirstRender) => {
  if (isFirstRender) {
    return;
  }

  const { container, cssClasses } = widgetParams as {
    container: HTMLElement;
    cssClasses: ComponentCSSClasses<CurrentRefinementsCSSClasses>;
  };

  render(
    <CurrentRefinements
      cssClasses={cssClasses}
      items={items}
      canRefine={canRefine}
    />,
    container
  );
};

export type CurrentRefinementsWidget = WidgetFactory<
  CurrentRefinementsWidgetDescription & {
    $$widgetType: 'ais.currentRefinements';
  },
  CurrentRefinementsConnectorParams,
  CurrentRefinementsWidgetParams
>;

const currentRefinements: CurrentRefinementsWidget =
  function currentRefinements(widgetParams) {
    const {
      container,
      includedAttributes,
      excludedAttributes,
      cssClasses: userCssClasses = {},
      transformItems,
    } = widgetParams || {};

    if (!container) {
      throw new Error(withUsage('The `container` option is required.'));
    }

    const containerNode = getContainerNode(container);
    const cssClasses: CurrentRefinementsCSSClasses = {
      root: cx(suit(), userCssClasses.root),
      noRefinementRoot: cx(
        suit({ modifierName: 'noRefinement' }),
        userCssClasses.noRefinementRoot
      ),
      list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
      item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
      label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
      category: cx(
        suit({ descendantName: 'category' }),
        userCssClasses.category
      ),
      categoryLabel: cx(
        suit({ descendantName: 'categoryLabel' }),
        userCssClasses.categoryLabel
      ),
      delete: cx(suit({ descendantName: 'delete' }), userCssClasses.delete),
    };

    const makeWidget =
      connectCurrentRefinements<CurrentRefinementsWidgetParams>(renderer, () =>
        render(null, containerNode)
      );

    return {
      ...makeWidget({
        container: containerNode,
        cssClasses,
        includedAttributes,
        excludedAttributes,
        transformItems,
      }),
      $$widgetType: 'ais.currentRefinements',
    };
  };

export default currentRefinements;
