let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils.js');
let bem = utils.bemHelper('ais-menu');
let cx = require('classnames');
let autoHideContainerHOC = require('../../decorators/autoHideContainer');
let headerFooterHOC = require('../../decorators/headerFooter');

let defaultTemplates = require('./defaultTemplates.js');

/**
 * Create a menu out of a facet
 * @function menu
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {string[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {string} [options.limit=100] How many facets values to retrieve
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @return {Object}
 */
const usage = `Usage:
menu({
  container,
  facetName,
  [sortBy],
  [limit],
  [cssClasses.{root,list,item}],
  [templates.{header,item,footer}],
  [transformData],
  [autoHideContainer]
})`;
function menu({
    container,
    facetName,
    sortBy = ['count:desc'],
    limit = 100,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    transformData,
    autoHideContainer = true
  } = {}) {
  if (!container || !facetName) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);
  let RefinementList = headerFooterHOC(require('../../components/RefinementList/RefinementList.js'));
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  // we use a hierarchicalFacet for the menu because that's one of the use cases
  // of hierarchicalFacet: a flat menu
  let hierarchicalFacetName = facetName;

  return {
    getConfiguration: () => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes: [facetName]
      }]
    }),
    render: function({results, helper, templatesConfig, state, createURL}) {
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
        item: cx(bem('item'), userCssClasses.item),
        active: cx(bem('item', 'active'), userCssClasses.active),
        link: cx(bem('link'), userCssClasses.link),
        count: cx(bem('count'), userCssClasses.count)
      };

      ReactDOM.render(
        <RefinementList
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

function toggleRefinement(helper, facetName, facetValue) {
  helper
    .toggleRefinement(facetName, facetValue)
    .search();
}

function getFacetValues(results, hierarchicalFacetName, sortBy, limit) {
  let values = results
    .getFacetValues(hierarchicalFacetName, {sortBy: sortBy});

  return values.data && values.data.slice(0, limit) || [];
}

module.exports = menu;
