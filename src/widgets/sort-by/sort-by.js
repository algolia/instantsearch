import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import Selector from '../../components/Selector/Selector.js';
import connectSortBy from '../../connectors/sort-by/connectSortBy.js';
import { getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit.js';

const suit = component('SortBy');

const renderer = ({ containerNode, cssClasses }) => (
  { currentRefinement, items, refine },
  isFirstRendering
) => {
  if (isFirstRendering) {
    return;
  }

  render(
    <div className={cssClasses.root}>
      <Selector
        cssClasses={cssClasses}
        currentValue={currentRefinement}
        items={items}
        setValue={refine}
      />
    </div>,
    containerNode
  );
};

const usage = `Usage:
sortBy({
  container,
  items,
  [cssClasses.{root, select, option}],
  [transformItems]
})`;

/**
 * @typedef {Object} SortByWidgetCssClasses
 * @property {string|string[]} [root] CSS classes added to the outer `<div>`.
 * @property {string|string[]} [select] CSS classes added to the parent `<select>`.
 * @property {string|string[]} [option] CSS classes added to each `<option>`.
 */

/**
 * @typedef {Object} SortByIndexDefinition
 * @property {string} value The name of the index to target.
 * @property {string} label The label of the index to display.
 */

/**
 * @typedef {Object} SortByWidgetItems
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {SortByIndexDefinition[]} items Array of objects defining the different indices to choose from.
 * @property {SortByWidgetCssClasses} [cssClasses] CSS classes to be added.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * Sort by selector is a widget used for letting the user choose between different
 * indices that contains the same data with a different order / ranking formula.
 *
 * For the users it is like they are selecting a new sort order.
 * @type {WidgetFactory}
 * @devNovel SortBy
 * @category sort
 * @param {SortByWidgetItems} $0 Options for the SortBy widget
 * @return {Widget} Creates a new instance of the SortBy widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.sortBy({
 *     container: '#sort-by-container',
 *     items: [
 *       {value: 'instant_search', label: 'Most relevant'},
 *       {value: 'instant_search_price_asc', label: 'Lowest price'},
 *       {value: 'instant_search_price_desc', label: 'Highest price'}
 *     ]
 *   })
 * );
 */
export default function sortBy({
  container,
  items,
  cssClasses: userCssClasses = {},
  transformItems,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    select: cx(suit({ descendantName: 'select' }), userCssClasses.select),
    option: cx(suit({ descendantName: 'option' }), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  try {
    const makeWidget = connectSortBy(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ items, transformItems });
  } catch (error) {
    throw new Error(usage);
  }
}
