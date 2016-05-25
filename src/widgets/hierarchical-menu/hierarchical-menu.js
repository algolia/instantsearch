import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode
} from '../../lib/utils.js';
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import defaultTemplates from './defaultTemplates.js';
import RefinementListComponent from '../../components/RefinementList/RefinementList.js';

let bem = bemHelper('ais-hierarchical-menu');
/**
 * Create a hierarchical menu using multiple attributes
 * @function hierarchicalMenu
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string[]} options.attributes Array of attributes to use to generate the hierarchy of the menu.
 * Refer to [the readme](https://github.com/algolia/algoliasearch-helper-js#hierarchical-facets) for the convention to follow.
 * @param  {string} [options.separator=' > '] Separator used in the attributes to separate level values.
 * @param  {string} [options.rootPath] Prefix path to use if the first level is not the root level.
 * @param  {string} [options.showParentLevel=false] Show the parent level of the current refined value
 * @param  {number} [options.limit=10] How much facet values to get
 * @param  {string[]|Function} [options.sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template (root level only)
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer=''] Footer template (root level only)
 * @param  {Function} [options.transformData.item] Method to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.depth] CSS class to add to each item element to denote its depth. The actual level will be appended to the given class name (ie. if `depth` is given, the widget will add `depth0`, `depth1`, ... according to the level of each item).
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
hierarchicalMenu({
  container,
  attributes,
  [ separator=' > ' ],
  [ rootPath ],
  [ showParentLevel=true ],
  [ limit=10 ],
  [ sortBy=['name:asc'] ],
  [ cssClasses.{root , header, body, footer, list, depth, item, active, link}={} ],
  [ templates.{header, item, footer} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;
function hierarchicalMenu({
    container,
    attributes,
    separator = ' > ',
    rootPath = null,
    showParentLevel = true,
    limit = 10,
    sortBy = ['name:asc'],
    cssClasses: userCssClasses = {},
    autoHideContainer = true,
    templates = defaultTemplates,
    collapsible = false,
    transformData
  } = {}) {
  if (!container || !attributes || !attributes.length) {
    throw new Error(usage);
  }

  let containerNode = getContainerNode(container);

  let RefinementList = headerFooterHOC(RefinementListComponent);
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  // we need to provide a hierarchicalFacet name for the search state
  // so that we can always map $hierarchicalFacetName => real attributes
  // we use the first attribute name
  let hierarchicalFacetName = attributes[0];

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    depth: bem('list', 'lvl'),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    link: cx(bem('link'), userCssClasses.link),
    count: cx(bem('count'), userCssClasses.count)
  };

  return {
    getConfiguration: (currentConfiguration) => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes,
        separator,
        rootPath,
        showParentLevel
      }],
      maxValuesPerFacet: currentConfiguration.maxValuesPerFacet !== undefined ?
        Math.max(currentConfiguration.maxValuesPerFacet, limit) :
        limit
    }),
    init({helper, templatesConfig}) {
      this._toggleRefinement = facetValue => helper
        .toggleRefinement(hierarchicalFacetName, facetValue)
        .search();

      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });
    },
    _prepareFacetValues(facetValues, state) {
      return facetValues
        .slice(0, limit)
        .map(subValue => {
          if (Array.isArray(subValue.data)) {
            subValue.data = this._prepareFacetValues(subValue.data, state);
          }

          return subValue;
        });
    },
    render: function({results, state, createURL}) {
      let facetValues = results.getFacetValues(hierarchicalFacetName, {sortBy: sortBy}).data || [];
      facetValues = this._prepareFacetValues(facetValues, state);

      // Bind createURL to this specific attribute
      function _createURL(facetValue) {
        return createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
      }

      ReactDOM.render(
        <RefinementList
          attributeNameKey="path"
          collapsible={collapsible}
          createURL={_createURL}
          cssClasses={cssClasses}
          facetValues={facetValues}
          shouldAutoHideContainer={facetValues.length === 0}
          templateProps={this._templateProps}
          toggleRefinement={this._toggleRefinement}
        />,
        containerNode
      );
    }
  };
}

export default hierarchicalMenu;
