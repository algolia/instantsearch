import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList.js';
import connectMenu from '../../connectors/menu/connectMenu.js';
import defaultTemplates from './defaultTemplates.js';
import { prepareTemplateProps, getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('Menu');

const renderer = ({
  containerNode,
  cssClasses,
  renderState,
  templates,
  showMore,
}) => (
  {
    refine,
    items,
    createURL,
    instantSearchInstance,
    isShowingMore,
    toggleShowMore,
    canToggleShowMore,
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const facetValues = items.map(facetValue => ({
    ...facetValue,
    url: createURL(facetValue.name),
  }));

  render(
    <RefinementList
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={facetValues}
      showMore={showMore}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
      toggleShowMore={toggleShowMore}
      isShowingMore={isShowingMore}
      canToggleShowMore={canToggleShowMore}
    />,
    containerNode
  );
};

const usage = `Usage:
menu({
  container,
  attribute,
  [ sortBy = ['isRefined', 'name:asc'] ],
  [ limit = 10 ],
  [ showMore = false ],
  [ showMoreLimit = 10 ],
  [ cssClasses.{root, noRefinementRoot, list, item, selectedItem, link, label, count, showMore, disabledShowMore} ],
  [ templates.{item, showMoreActive, showMoreInactive} ],
  [ transformItems ]
})`;

/**
 * @typedef {Object} MenuCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [noRefinementRoot] CSS class to add to the root element when no refinements.
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to each item element.
 * @property {string|string[]} [selectedItem] CSS class to add to each selected item element.
 * @property {string|string[]} [link] CSS class to add to each link (when using the default template).
 * @property {string|string[]} [label] CSS class to add to each label (when using the default template).
 * @property {string|string[]} [count] CSS class to add to each count element (when using the default template).
 * @property {string|string[]} [showMore] CSS class to add to the show more button.
 * @property {string|string[]} [disabledShowMore] CSS class to add to the disabled show more button.
 */

/**
 * @typedef {Object} MenuTemplates
 * @property {string|function({count: number, cssClasses: object, isRefined: boolean, label: string, url: string, value: string}):string} [item] Item template. The string template gets the same values as the function.
 * @property {string} [showMoreActive] Template used when showMore was clicked.
 * @property {string} [showMoreInactive] Template used when showMore not clicked.
 */

/**
 * @typedef {Object} MenuWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attribute Name of the attribute for faceting
 * @property {string[]|function} [sortBy=['isRefined', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {MenuTemplates} [templates] Customize the output through templating.
 * @property {number} [limit=10] How many facets values to retrieve.
 * @property {boolean} [showMore=false] Limit the number of results and display a showMore button.
 * @property {number} [showMoreLimit=10] How many facets values to retrieve when showing more.
 * @property {MenuCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * Create a menu based on a facet. A menu displays facet values and let the user selects only one value at a time.
 * It also displays an empty value which lets the user "unselect" any previous selection.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 * @type {WidgetFactory}
 * @devNovel Menu
 * @category filter
 * @param {MenuWidgetOptions} $0 The Menu widget options.
 * @return {Widget} Creates a new instance of the Menu widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.menu({
 *     container: '#categories',
 *     attribute: 'hierarchicalCategories.lvl0',
 *     limit: 10,
 *   })
 * );
 */
export default function menu({
  container,
  attribute,
  sortBy,
  limit = 10,
  showMore = false,
  showMoreLimit,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformItems,
}) {
  if (!container) {
    throw new Error(usage);
  }

  if (!showMore && showMoreLimit) {
    throw new Error(
      '`showMoreLimit` must be used with `showMore` set to `true`.'
    );
  }

  if (showMore && showMoreLimit < limit) {
    throw new Error('`showMoreLimit` should be greater than `limit`.');
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    selectedItem: cx(
      suit({ descendantName: 'item', modifierName: 'selected' }),
      userCssClasses.selectedItem
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    count: cx(suit({ descendantName: 'count' }), userCssClasses.count),
    showMore: cx(suit({ descendantName: 'showMore' }), userCssClasses.showMore),
    disabledShowMore: cx(
      suit({ descendantName: 'showMore', modifierName: 'disabled' }),
      userCssClasses.disabledShowMore
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
    showMore,
  });

  try {
    const makeWidget = connectMenu(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({
      attribute,
      limit,
      sortBy,
      showMoreLimit,
      transformItems,
    });
  } catch (error) {
    throw new Error(usage);
  }
}
