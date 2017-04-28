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
 * @typedef {Object} SearchForFacetTemplates
 * @property {string} [noResults] Templates to use for search for facet values
 */

/**
 * @typedef {Object} SearchForFacetOptions
 * @property {string} [placeholder] Value of the search field placeholder
 * @property {SearchForFacetTemplates} [templates] Templates to use for search for facet values
 */

/**
 * @typedef {Object} RefinementListShowMoreTemplates
 * @property {string} [active] Template used when showMore was clicked
 * @property {string} [inactive] Template used when showMore not clicked
 */

/**
 * @typedef {Object} RefinementListShowMoreOptions
 * @property {RefinementListShowMoreTemplates} [templates] Templates to use for showMore
 * @property {number} [limit] Max number of facets values to display when showMore is clicked
 */

/**
 * @typedef {Object} RefinementListTemplates
 * @property  {string|Function} [header] Header template, provided with `refinedFacetsCount` data property
 * @property  {string|Function} [item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @property  {string|Function} [footer] Footer template
 */

/**
 * @typedef {Object} RefinementListTransforms
 * @property {function} [transformData.item] Function to change the object passed to the `item` template
 */

/**
 * @typedef {Object} RefinementListCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element
 * @property {string|string[]} [header] CSS class to add to the header element
 * @property {string|string[]} [body] CSS class to add to the body element
 * @property {string|string[]} [footer] CSS class to add to the footer element
 * @property {string|string[]} [list] CSS class to add to the list element
 * @property {string|string[]} [item] CSS class to add to each item element
 * @property {string|string[]} [active] CSS class to add to each active element
 * @property {string|string[]} [label] CSS class to add to each label element (when using the default template)
 * @property {string|string[]} [checkbox] CSS class to add to each checkbox element (when using the default template)
 * @property {string|string[]} [count] CSS class to add to each count element (when using the default template)
 */

/**
 * @typedef {Object} RefinementListCollapsibleOptions
 * @property {boolean} [collapsed] Initial collapsed state of a collapsible widget
 */

/**
 * @typedef {Object} RefinementListWidgetOptions
 * @property {string|DOMElement} container CSS Selector or DOMElement to insert the widget
 * @property {string} attributeName Name of the attribute for faceting
 * @property {"and"|"or"} [operator="or"] How to apply refinements. Possible values: `or`, `and`
 * @property {("isRefined"|"count:asc"|"count:desc"|"name:asc"|"name:desc")[]|function} [sortBy=["count:desc", "name:asc"]] How to sort refinements. Possible values: `count:asc|count:desc|name:asc|name:desc|isRefined`.
 *   You can lso use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {number} [limit=10] How much facet values to get. When the show more feature is activated this is the minimum number of facets requested (the show more button is not in active state).
 * @property {SearchForFacetOptions|boolean} [searchForFacetValues=false] Add a search input to let the user search for more facet values
 * @property {RefinementListShowMoreOptions|boolean} [showMore=false] Limit the number of results and display a showMore button
 * @property {RefinementListTemplates} [templates] Templates to use for the widget
 * @property {RefinementListTransforms} [transformData] Functions to update the values before applying the templates.
 * @property {boolean} [autoHideContainer=true] Hide the container when no items in the refinement list.
 * @property {RefinementListCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {RefinementListCollapsibleOptions|boolean} [collapsible=false] If true, the user can collapse the widget. If the use clicks on the header, itwill hide the content and the footer.
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
 * @type {WidgetFactory}
 * @param {RefinementListWidgetOptions} $0 The widget options that you use to customize the widget.
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
} = {}) {
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
