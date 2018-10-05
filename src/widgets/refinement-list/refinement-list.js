import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList.js';
import connectRefinementList from '../../connectors/refinement-list/connectRefinementList.js';
import defaultTemplates from './defaultTemplates.js';
import { prepareTemplateProps, getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('RefinementList');

const renderer = ({
  containerNode,
  cssClasses,
  templates,
  renderState,
  showMore,
  searchable,
  searchablePlaceholder,
  searchableIsAlwaysActive,
}) => (
  {
    refine,
    items,
    createURL,
    searchForItems,
    isFromSearch,
    instantSearchInstance,
    toggleShowMore,
    isShowingMore,
    hasExhaustiveItems,
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

  render(
    <RefinementList
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={items}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
      searchFacetValues={searchable ? searchForItems : undefined}
      searchPlaceholder={searchablePlaceholder}
      searchIsAlwaysActive={searchableIsAlwaysActive}
      isFromSearch={isFromSearch}
      showMore={showMore}
      toggleShowMore={toggleShowMore}
      isShowingMore={isShowingMore}
      hasExhaustiveItems={hasExhaustiveItems}
      canToggleShowMore={canToggleShowMore}
    />,
    containerNode
  );
};

const usage = `Usage:
refinementList({
  container,
  attribute,
  [ operator='or' ],
  [ sortBy = ['isRefined', 'count:desc', 'name:asc'] ],
  [ limit = 10 ],
  [ showMore = false],
  [ showMoreLimit = 10 ],
  [ cssClasses.{root, noRefinementRoot, searchBox, list, item, selectedItem, label, checkbox, labelText, count, noResults, showMore, disabledShowMore}],
  [ templates.{item, searchableNoResults, showMoreActive, showMoreInactive} ],
  [ searchablePlaceholder ],
  [ searchableIsAlwaysActive = true ],
  [ searchableEscapeFacetValues = true ],
  [ transformItems ],
})`;

/**
 * @typedef {Object} RefinementListTemplates
 * @property  {string|function(RefinementListItemData):string} [item] Item template, provided with `label`, `highlighted`, `value`, `count`, `isRefined`, `url` data properties.
 * @property {string|function} [searchableNoResults] Templates to use for search for facet values.
 * @property {string|function} [showMoreActive] Template used when showMore was clicked.
 * @property {string|function} [showMoreInactive] Template used when showMore not clicked.
 */

/**
 * @typedef {Object} RefinementListItemData
 * @property {number} count The number of occurrences of the facet in the result set.
 * @property {boolean} isRefined True if the value is selected.
 * @property {string} label The label to display.
 * @property {string} value The value used for refining.
 * @property {string} highlighted The label highlighted (when using search for facet values). This value is displayed in the default template.
 * @property {string} url The url with this refinement selected.
 * @property {object} cssClasses Object containing all the classes computed for the item.
 */

/**
 * @typedef {Object} RefinementListTransforms
 * @property {function} [item] Function to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} RefinementListCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [noRefinementRoot] CSS class to add to the root element when no refinements.
 * @property {string|string[]} [noResults] CSS class to add to the root element with no results.
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to each item element.
 * @property {string|string[]} [selectedItem] CSS class to add to each selected element.
 * @property {string|string[]} [label] CSS class to add to each label element (when using the default template).
 * @property {string|string[]} [checkbox] CSS class to add to each checkbox element (when using the default template).
 * @property {string|string[]} [labelText] CSS class to add to each label text element.
 * @property {string|string[]} [showMore] CSS class to add to the show more element
 * @property {string|string[]} [disabledShowMore] CSS class to add to the disabledshow more element
 * @property {string|string[]} [count] CSS class to add to each count element (when using the default template).
 */

/**
 * @typedef {Object} RefinementListWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attribute Name of the attribute for faceting.
 * @property {"and"|"or"} [operator="or"] How to apply refinements. Possible values: `or`, `and`
 * @property {string[]|function} [sortBy=["isRefined", "count:desc", "name:asc"]] How to sort refinements. Possible values: `count:asc` `count:desc` `name:asc` `name:desc` `isRefined`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 * @property {number} [limit=10] How much facet values to get. When the show more feature is activated this is the minimum number of facets requested (the show more button is not in active state).
 * @property {SearchForFacetOptions|boolean} [searchable=false] Add a search input to let the user search for more facet values. In order to make this feature work, you need to make the attribute searchable [using the API](https://www.algolia.com/doc/guides/searching/faceting/?language=js#declaring-a-searchable-attribute-for-faceting) or [the dashboard](https://www.algolia.com/explorer/display/).
 * @property {RefinementListShowMoreOptions|boolean} [showMore=false] Limit the number of results and display a showMore button.
 * @property {string} [searchablePlaceholder] Value of the search field placeholder.
 * @property {boolean} [searchableIsAlwaysActive=true] When `false` the search field will become disabled if
 * there are less items to display than the `options.limit`, otherwise the search field is always usable.
 * @property {boolean} [searchableEscapeFacetValues=true] When activated, it will escape the facet values that are returned
 * from Algolia. In this case, the surrounding tags will always be `<mark></mark>`.
 * @property {RefinementListTemplates} [templates] Templates to use for the widget.
 * @property {RefinementListCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 */

/**
 * The refinement list widget is one of the most common widget that you can find
 * in a search UI. With this widget, the user can filter the dataset based on facets.
 *
 * The refinement list displays only the most relevant facets for the current search
 * context. The sort option only affects the facet that are returned by the engine,
 * not which facets are returned.
 *
 * This widget also implements search for facet values, which is a mini search inside the
 * values of the facets. This makes easy to deal with uncommon facet values.
 *
 * @requirements
 *
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * If you also want to use search for facet values on this attribute, you need to make it searchable using the [dashboard](https://www.algolia.com/explorer/display/) or using the [API](https://www.algolia.com/doc/guides/searching/faceting/#search-for-facet-values).
 *
 * @type {WidgetFactory}
 * @devNovel RefinementList
 * @category filter
 * @param {RefinementListWidgetOptions} $0 The RefinementList widget options that you use to customize the widget.
 * @return {Widget} Creates a new instance of the RefinementList widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.refinementList({
 *     container: '#brands',
 *     attribute: 'brand',
 *     operator: 'or',
 *     limit: 10,
 *   })
 * );
 */
export default function refinementList({
  container,
  attribute,
  operator = 'or',
  sortBy = ['isRefined', 'count:desc', 'name:asc'],
  limit = 10,
  showMore = false,
  showMoreLimit,
  searchable = false,
  searchablePlaceholder = 'Search...',
  searchableEscapeFacetValues = true,
  searchableIsAlwaysActive = true,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformItems,
} = {}) {
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

  const escapeFacetValues = searchable
    ? Boolean(searchableEscapeFacetValues)
    : false;
  const containerNode = getContainerNode(container);
  const allTemplates = {
    ...defaultTemplates,
    ...templates,
  };

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
    searchBox: cx(
      suit({ descendantName: 'searchBox' }),
      userCssClasses.searchBox
    ),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    checkbox: cx(suit({ descendantName: 'checkbox' }), userCssClasses.checkbox),
    labelText: cx(
      suit({ descendantName: 'labelText' }),
      userCssClasses.labelText
    ),
    count: cx(suit({ descendantName: 'count' }), userCssClasses.count),
    noResults: cx(
      suit({ descendantName: 'noResults' }),
      userCssClasses.noResults
    ),
    showMore: cx(suit({ descendantName: 'showMore' }), userCssClasses.showMore),
    disabledShowMore: cx(
      suit({ descendantName: 'showMore', modifierName: 'disabled' }),
      userCssClasses.disabledShowMore
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates: allTemplates,
    renderState: {},
    searchable,
    searchablePlaceholder,
    searchableIsAlwaysActive,
    showMore,
  });

  try {
    const makeWidget = connectRefinementList(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({
      attribute,
      operator,
      limit,
      showMoreLimit,
      sortBy,
      escapeFacetValues,
      transformItems,
    });
  } catch (error) {
    throw new Error(usage);
  }
}
