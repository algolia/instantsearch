import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import CurrentRefinements from '../../components/CurrentRefinements/CurrentRefinements.js';
import connectCurrentRefinements from '../../connectors/current-refinements/connectCurrentRefinements.js';
import { getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit.js';

const suit = component('CurrentRefinements');

const renderer = ({ containerNode, cssClasses }) => (
  { items },
  isFirstRendering
) => {
  if (isFirstRendering) {
    return;
  }

  render(
    <CurrentRefinements cssClasses={cssClasses} items={items} />,
    containerNode
  );
};

const usage = `Usage:
currentRefinements({
  container,
  [ includedAttributes ],
  [ excludedAttributes = ['query'] ],
  [ cssClasses.{root, list, item, label, category, categoryLabel, delete} ],
  [ transformItems ]
})`;

/**
 * @typedef {Object} CurrentRefinementsCSSClasses
 * @property {string} [root] CSS classes added to the root element.
 * @property {string} [list] CSS classes added to the list element.
 * @property {string} [item] CSS classes added to the item element.
 * @property {string} [label] CSS classes added to the label element.
 * @property {string} [category] CSS classes added to the category element.
 * @property {string} [categoryLabel] CSS classes added to the categoryLabel element.
 * @property {string} [delete] CSS classes added to the delete element.
 */

/**
 * @typedef {Object} CurrentRefinementsWidgetOptions
 * @property {string|HTMLElement} container The CSS Selector or HTMLElement to insert the widget
 * @property {string[]} [includedAttributes] The attributes to include in the refinements (all by default)
 * @property {string[]} [excludedAttributes = ['query']] The attributes to exclude from the refinements
 * @property {CurrentRefinementsCSSClasses} [cssClasses] The CSS classes to be added
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * The `currentRefinements` widget has two purposes give the user a synthetic view of the current filters
 * and the ability to remove a filter.
 *
 * This widget is usually in the top part of the search UI.
 * @type {WidgetFactory}
 * @devNovel CurrentRefinements
 * @category clear-filter
 * @param {CurrentRefinementsWidgetOptions} $0 The CurrentRefinements widget options.
 * @returns {Object} A new CurrentRefinements widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.currentRefinements({
 *     container: '#current-refinements',
 *     includedAttributes: [
 *       'free_shipping',
 *       'price',
 *       'brand',
 *       'category',
 *     ],
 *   })
 * );
 */
export default function currentRefinements({
  container,
  includedAttributes,
  excludedAttributes,
  cssClasses: userCssClasses = {},
  transformItems,
}) {
  if (!container) {
    throw new Error(usage);
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

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  try {
    const makeWidget = connectCurrentRefinements(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );

    return makeWidget({
      includedAttributes,
      excludedAttributes,
      transformItems,
    });
  } catch (error) {
    throw new Error(usage);
  }
}
