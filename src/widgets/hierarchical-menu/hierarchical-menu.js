import React from 'react';
import ReactDOM from 'react-dom';

import utils from '../../lib/utils.js';
let bem = utils.bemHelper('ais-hierarchical-menu');
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

import defaultTemplates from './defaultTemplates.js';

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
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.depth] CSS class to add to the depth element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
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
  [ transformData ],
  [ autoHideContainer=true ]
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
    transformData
  } = {}) {
  if (!container || !attributes || !attributes.length) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);

  let RefinementList = headerFooterHOC(require('../../components/RefinementList/RefinementList.js'));
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  // we need to provide a hierarchicalFacet name for the search state
  // so that we can always map $hierarchicalFacetName => real attributes
  // we use the first attribute name
  let hierarchicalFacetName = attributes[0];

  return {
    getConfiguration: () => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes,
        separator,
        rootPath,
        showParentLevel
      }]
    }),
    render: function({results, helper, templatesConfig, createURL, state}) {
      let facetValues = getFacetValues(results, hierarchicalFacetName, sortBy, limit);
      let hasNoFacetValues = facetValues.length === 0;

      let templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

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

      ReactDOM.render(
        <RefinementList
          attributeNameKey="path"
          createURL={(facetValue) => createURL(state.toggleRefinement(hierarchicalFacetName, facetValue))}
          cssClasses={cssClasses}
          facetValues={facetValues}
          shouldAutoHideContainer={hasNoFacetValues}
          templateProps={templateProps}
          toggleRefinement={toggleRefinement.bind(null, helper, hierarchicalFacetName)}
        />,
        containerNode
      );
    }
  };
}

function toggleRefinement(helper, attributeName, facetValue) {
  helper
    .toggleRefinement(attributeName, facetValue)
    .search();
}

function getFacetValues(results, hierarchicalFacetName, sortBy, limit) {
  let values = results
    .getFacetValues(hierarchicalFacetName, {sortBy: sortBy}).data || [];

  return sliceFacetValues(values, limit);
}

function sliceFacetValues(values, limit) {
  return values
    .slice(0, limit)
    .map(function(subValue) {
      if (Array.isArray(subValue.data)) {
        subValue.data = sliceFacetValues(subValue.data, limit);
      }

      return subValue;
    });
}

export default hierarchicalMenu;
