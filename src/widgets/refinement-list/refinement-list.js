import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import filter from 'lodash/filter';

import RefinementList from '../../components/RefinementList/RefinementList.js';
import connectRefinementList from '../../connectors/refinement-list/connectRefinementList.js';
import defaultTemplates from './defaultTemplates.js';
import getShowMoreConfig from '../../lib/show-more/getShowMoreConfig.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
  prefixKeys,
} from '../../lib/utils.js';

const bem = bemHelper('ais-refinement-list');

const renderer = ({
  containerNode,
  cssClasses,
  transformData,
  templates,
  renderState,
  collapsible,
  limitMax,
  limit,
  autoHideContainer,
  showMoreConfig,
  searchForFacetValues,
}) => ({
  refine,
  items,
  createURL,
  searchForItems,
  isFromSearch,
  instantSearchInstance,
  canRefine,
}, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  // Pass count of currently selected items to the header template
  const headerFooterData = {
    header: {refinedFacetsCount: filter(items, {isRefined: true}).length},
  };

  ReactDOM.render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={items}
      headerFooterData={headerFooterData}
      limitMax={limitMax}
      limitMin={limit}
      shouldAutoHideContainer={autoHideContainer && canRefine === false}
      showMore={showMoreConfig !== null}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
      searchFacetValues={searchForFacetValues ? searchForItems : undefined}
      searchPlaceholder={searchForFacetValues.placeholder || 'Search for other...'}
      isFromSearch={isFromSearch}
    />,
    containerNode
  );
};

const usage = `Usage:
refinementList({
  container,
  attributeName,
  [ operator='or' ],
  [ sortBy=['count:desc', 'name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root, header, body, footer, list, item, active, label, checkbox, count}],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ showMore.{templates: {active, inactive}, limit} ],
  [ collapsible=false ],
  [ searchForFacetValues.{placeholder, templates: {noResults}}],
})`;

/**
 * Instantiate a list of refinements based on a facet
 * @function refinementList
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {string} $0.attributeName Name of the attribute for faceting
 * @param  {string} [$0.operator='or'] How to apply refinements. Possible values: `or`, `and` [*]
 * @param  {string[]|Function} [$0.sortBy=['count:desc', 'name:asc']] How to sort refinements. Possible values: `count:asc|count:desc|name:asc|name:desc|isRefined`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 * @param  {string} [$0.limit=10] How much facet values to get. When the show more feature is activated this is the minimum number of facets requested (the show more button is not in active state). [*]
 * @param  {object|boolean} [$0.searchForFacetValues=false] Add a search input to let the user search for more facet values
 * @param  {string} [$0.searchForFacetValues.placeholder] Value of the search field placeholder
 * @param  {string} [$0.searchForFacetValues.templates] Templates to use for search for facet values
 * @param  {string} [$0.searchForFacetValues.templates.noResults] Templates to use for search for facet values
 * @param  {object|boolean} [$0.showMore=false] Limit the number of results and display a showMore button
 * @param  {object} [$0.showMore.templates] Templates to use for showMore
 * @param  {object} [$0.showMore.templates.active] Template used when showMore was clicked
 * @param  {object} [$0.showMore.templates.inactive] Template used when showMore not clicked
 * @param  {object} [$0.showMore.limit] Max number of facets values to display when showMore is clicked
 * @param  {Object} [$0.templates] Templates to use for the widget
 * @param  {string|Function} [$0.templates.header] Header template, provided with `refinedFacetsCount` data property
 * @param  {string|Function} [$0.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [$0.templates.footer] Footer template
 * @param  {Function} [$0.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [$0.autoHideContainer=true] Hide the container when no items in the refinement list
 * @param  {Object} [$0.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [$0.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [$0.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [$0.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [$0.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [$0.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [$0.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [$0.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [$0.cssClasses.label] CSS class to add to each label element (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.checkbox] CSS class to add to each checkbox element (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {object|boolean} [$0.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [$0.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object} Widget instance
 */
export default function refinementList({
  container,
  attributeName,
  operator = 'or',
  sortBy = ['count:desc', 'name:asc'],
  limit = 10,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  collapsible = false,
  transformData,
  autoHideContainer = true,
  showMore = false,
  searchForFacetValues = false,
}) {
  if (!container) {
    throw new Error(usage);
  }

  const showMoreConfig = getShowMoreConfig(showMore);
  if (showMoreConfig && showMoreConfig.limit < limit) {
    throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
  }

  const limitMax = showMoreConfig && showMoreConfig.limit || limit;
  const containerNode = getContainerNode(container);
  const showMoreTemplates = showMoreConfig ? prefixKeys('show-more-', showMoreConfig.templates) : {};
  const searchForValuesTemplates = searchForFacetValues ? searchForFacetValues.templates : {};
  const allTemplates = {...templates, ...showMoreTemplates, ...searchForValuesTemplates};

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    label: cx(bem('label'), userCssClasses.label),
    checkbox: cx(bem('checkbox'), userCssClasses.checkbox),
    count: cx(bem('count'), userCssClasses.count),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    transformData,
    templates: allTemplates,
    renderState: {},
    collapsible,
    limitMax,
    limit,
    autoHideContainer,
    showMoreConfig,
    searchForFacetValues,
  });

  try {
    const makeWidget = connectRefinementList(specializedRenderer);
    return makeWidget({
      attributeName,
      operator,
      limit: limitMax,
      sortBy,
    });
  } catch (e) {
    throw new Error(e);
  }
}
