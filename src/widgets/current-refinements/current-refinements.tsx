/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import CurrentRefinements from '../../components/CurrentRefinements/CurrentRefinements';
import connectCurrentRefinements, {
  CurrentRefinementsRenderer,
  Item,
} from '../../connectors/current-refinements/connectCurrentRefinements';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory } from '../../types';

type CurrentRefinementsCSSClasses = {
  root: string | string[];
  list: string | string[];
  item: string | string[];
  label: string | string[];
  category: string | string[];
  categoryLabel: string | string[];
  delete: string | string[];
};

export type CurrentRefinementsComponentCSSClasses = {
  [TClassName in keyof CurrentRefinementsCSSClasses]: string;
};

export type CurrentRefinementsWidgetParams = {
  /**
   * The CSS Selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;
  /**
   * The CSS classes to override.
   */
  cssClasses?: Partial<CurrentRefinementsCSSClasses>;
  /**
   * The attributes to include in the widget (all by default).
   * Cannot be used with `excludedAttributes`.
   *
   * @default `[]`
   */
  includedAttributes?: string[];
  /**
   * The attributes to exclude from the widget.
   * Cannot be used with `includedAttributes`.
   *
   * @default `['query']`
   */
  excludedAttributes?: string[];
  /**
   * Receives the items, and is called before displaying them.
   * Should return a new array with the same shape as the original array.
   * Useful for mapping over the items to transform, and remove or reorder them.
   */
  transformItems?: (items: Item[]) => any;
};

interface CurrentRefinementsRendererWidgetParams
  extends CurrentRefinementsWidgetParams {
  container: HTMLElement;
  cssClasses: CurrentRefinementsComponentCSSClasses;
}

type CurrentRefinements = WidgetFactory<CurrentRefinementsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'current-refinements',
});
const suit = component('CurrentRefinements');

const renderer: CurrentRefinementsRenderer<CurrentRefinementsRendererWidgetParams> = (
  { items, widgetParams },
  isFirstRender
) => {
  if (isFirstRender) {
    return;
  }

  const { container, cssClasses } = widgetParams;

  render(
    <CurrentRefinements cssClasses={cssClasses} items={items} />,
    container
  );
};

const currentRefinements: CurrentRefinements = ({
  container,
  includedAttributes,
  excludedAttributes,
  cssClasses: userCssClasses = {} as CurrentRefinementsCSSClasses,
  transformItems,
}) => {
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

  const makeWidget = connectCurrentRefinements(renderer, () =>
    render(null, containerNode)
  );

  return makeWidget({
    container: containerNode,
    cssClasses,
    includedAttributes,
    excludedAttributes,
    transformItems,
  });
};

export default currentRefinements;
