/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import CurrentRefinements from '../../components/CurrentRefinements/CurrentRefinements';
import connectCurrentRefinements, {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsWidgetDescription,
} from '../../connectors/current-refinements/connectCurrentRefinements';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory } from '../../types';

export type CurrentRefinementsCSSClasses = {
  /**
   * CSS class to add to the root element.
   */
  root?: string | string[];

  /**
   * CSS class to add to the list element.
   */
  list?: string | string[];

  /**
   * CSS class to add to the each item element.
   */
  item?: string | string[];

  /**
   * CSS class to add to the label element.
   */
  label?: string | string[];

  /**
   * CSS class to add to the category element.
   */
  category?: string | string[];

  /**
   * CSS class to add to the categoryLabel element.
   */
  categoryLabel?: string | string[];

  /**
   * CSS class to add to the delete element.
   */
  delete?: string | string[];
};

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

const renderer = ({ items, widgetParams }, isFirstRender) => {
  if (isFirstRender) {
    return;
  }

  const { container, cssClasses } = widgetParams;

  render(
    <CurrentRefinements cssClasses={cssClasses} items={items} />,
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

const currentRefinements: CurrentRefinementsWidget = function currentRefinements(
  widgetParams
) {
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
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    category: cx(suit({ descendantName: 'category' }), userCssClasses.category),
    categoryLabel: cx(
      suit({ descendantName: 'categoryLabel' }),
      userCssClasses.categoryLabel
    ),
    delete: cx(suit({ descendantName: 'delete' }), userCssClasses.delete),
  };

  const makeWidget = connectCurrentRefinements<CurrentRefinementsWidgetParams>(
    renderer,
    () => render(null, containerNode)
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
