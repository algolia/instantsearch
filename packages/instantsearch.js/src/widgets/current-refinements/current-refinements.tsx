/** @jsx h */

import { createDocumentationMessageGenerator } from 'instantsearch-core';
import { createCurrentRefinementsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import { connectCurrentRefinements } from '../../connectors';
import { getContainerNode } from '../../lib/utils';

import type {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsRenderState,
  CurrentRefinementsWidgetDescription,
} from '../../connectors';
import type { Renderer, WidgetFactory } from 'instantsearch-core';

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

const CurrentRefinements = createCurrentRefinementsComponent({
  createElement: h,
  Fragment,
});

const renderer: Renderer<
  CurrentRefinementsRenderState,
  Partial<CurrentRefinementsWidgetParams>
> = ({ items, widgetParams, canRefine }, isFirstRender) => {
  if (isFirstRender) {
    return;
  }

  const { container, classNames } = widgetParams as {
    container: HTMLElement;
    classNames: CurrentRefinementsCSSClasses;
  };

  render(
    <CurrentRefinements
      classNames={classNames}
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
    const classNames: CurrentRefinementsCSSClasses = {
      root: userCssClasses.root,
      noRefinementRoot: userCssClasses.noRefinementRoot,
      list: userCssClasses.list,
      item: userCssClasses.item,
      label: userCssClasses.label,
      category: userCssClasses.category,
      categoryLabel: userCssClasses.categoryLabel,
      delete: userCssClasses.delete,
    };

    const makeWidget = connectCurrentRefinements<
      CurrentRefinementsWidgetParams & {
        classNames: CurrentRefinementsCSSClasses;
      }
    >(renderer, () => render(null, containerNode));

    return {
      ...makeWidget({
        container: containerNode,
        classNames,
        includedAttributes,
        excludedAttributes,
        transformItems,
      }),
      $$widgetType: 'ais.currentRefinements',
    };
  };

export default currentRefinements;
