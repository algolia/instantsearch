import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
  prefixKeys,
} from '../../lib/utils.js';
import cx from 'classnames';
import filter from 'lodash/filter';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import getShowMoreConfig from '../../lib/show-more/getShowMoreConfig.js';
import defaultTemplates from './defaultTemplates.js';
import RefinementListComponent from '../../components/RefinementList/RefinementList.js';

const bem = bemHelper('ais-refinement-list');
/**
 * Instantiate a list of refinements based on a facet
 * @function refinementList
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {string} [options.operator='or'] How to apply refinements. Possible values: `or`, `and` [*]
 * @param  {string[]|Function} [options.sortBy=['count:desc', 'name:asc']] How to sort refinements. Possible values: `count:asc|count:desc|name:asc|name:desc|isRefined`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 * @param  {string} [options.limit=10] How much facet values to get. When the show more feature is activated this is the minimum number of facets requested (the show more button is not in active state). [*]
 * @param  {object|boolean} [options.searchForFacetValues=false] Add a search input to let the user search for more facet values
 * @param  {string} [options.searchForFacetValues.placeholder] Value of the search field placeholder
 * @param  {string} [options.searchForFacetValues.templates] Templates to use for search for facet values
 * @param  {string} [options.searchForFacetValues.templates.noResults] Templates to use for search for facet values
 * @param  {object|boolean} [options.showMore=false] Limit the number of results and display a showMore button
 * @param  {object} [options.showMore.templates] Templates to use for showMore
 * @param  {object} [options.showMore.templates.active] Template used when showMore was clicked
 * @param  {object} [options.showMore.templates.inactive] Template used when showMore not clicked
 * @param  {object} [options.showMore.limit] Max number of facets values to display when showMore is clicked
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template, provided with `refinedFacetsCount` data property
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no items in the refinement list
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each label element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.checkbox] CSS class to add to each checkbox element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
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
function refinementList({
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
  const showMoreConfig = getShowMoreConfig(showMore);
  if (showMoreConfig && showMoreConfig.limit < limit) {
    throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
  }
  const widgetMaxValuesPerFacet = showMoreConfig && showMoreConfig.limit || limit;

  let RefinementList = RefinementListComponent;
  if (!container || !attributeName) {
    throw new Error(usage);
  }

  RefinementList = headerFooterHOC(RefinementList);
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  const containerNode = getContainerNode(container);

  if (operator) {
    operator = operator.toLowerCase();
    if (operator !== 'and' && operator !== 'or') {
      throw new Error(usage);
    }
  }

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

  /* eslint-disable max-params */
  const render = (facetValues, state, createURL,
                  helperSpecializedSearchFacetValues, templateProps, toggleRefinement, isFromSearch) => {
    // Bind createURL to this specific attribute
    function _createURL(facetValue) {
      return createURL(state.toggleRefinement(attributeName, facetValue));
    }

    // Pass count of currently selected items to the header template
    const refinedFacetsCount = filter(facetValues, {isRefined: true}).length;
    const headerFooterData = {
      header: {refinedFacetsCount},
    };

    // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
    // function
    const searchFacetValues = helperSpecializedSearchFacetValues &&
      helperSpecializedSearchFacetValues(
        state,
        createURL,
        helperSpecializedSearchFacetValues,
        templateProps,
        toggleRefinement);

    ReactDOM.render(
      <RefinementList
        collapsible={collapsible}
        createURL={_createURL}
        cssClasses={cssClasses}
        facetValues={facetValues}
        headerFooterData={headerFooterData}
        limitMax={widgetMaxValuesPerFacet}
        limitMin={limit}
        shouldAutoHideContainer={!isFromSearch && facetValues.length === 0}
        showMore={showMoreConfig !== null}
        templateProps={templateProps}
        toggleRefinement={toggleRefinement}
        searchFacetValues={searchFacetValues}
        searchPlaceholder={searchForFacetValues.placeholder || 'Search for other...'}
        isFromSearch={isFromSearch}
      />,
      containerNode
    );
  };

  let lastResultsFromMainSearch = null;

  // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
  // function
  const searchFacetValues = helper =>
    (state, createURL, helperSpecializedSearchFacetValues, templateProps, toggleRefinement) =>
    query => {
      if (query === '' && lastResultsFromMainSearch) {
        // render with previous data from the helper.
        render(
          lastResultsFromMainSearch, state, createURL,
          helperSpecializedSearchFacetValues, templateProps, toggleRefinement, false);
      } else {
        helper.searchForFacetValues(attributeName, query).then(results => {
          const facetValues = results.facetHits.map(h => {
            h.name = h.value;
            return h;
          });
          render(
            facetValues, state, createURL,
            helperSpecializedSearchFacetValues, templateProps, toggleRefinement, true);
        });
      }
    };

  return {
    getConfiguration: configuration => {
      const widgetConfiguration = {
        [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [attributeName],
      };

      const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
      widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, widgetMaxValuesPerFacet);

      return widgetConfiguration;
    },
    init({templatesConfig, helper}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates: allTemplates,
      });

      this.toggleRefinement = facetValue => helper
        .toggleRefinement(attributeName, facetValue)
        .search();

      this.searchFacetValues = searchForFacetValues ? searchFacetValues(helper) : null;
    },
    render({results, state, createURL}) {
      const facetValues = results
        .getFacetValues(attributeName, {sortBy})
        .map(h => {
          h.highlighted = h.name;
          return h;
        });

      lastResultsFromMainSearch = facetValues;

      render(facetValues, state, createURL, this.searchFacetValues, this._templateProps, this.toggleRefinement, false);
    },
  };
}

export default refinementList;
