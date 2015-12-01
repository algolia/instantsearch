let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils');
let bem = utils.bemHelper('ais-refinement-list');
let cx = require('classnames');

let autoHideContainerHOC = require('../../decorators/autoHideContainer');
let headerFooterHOC = require('../../decorators/headerFooter');

let defaultTemplates = require('./defaultTemplates');

/**
 * Instantiate a list of refinements based on a facet
 * @function refinementList
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {string} [options.operator='or'] How to apply refinements. Possible values: `or`, `and`
 * @param  {string[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {string} [options.limit=1000] How much facet values to get
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no items in the refinement list
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
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
 * @return {Object}
 */
const usage = `Usage:
refinementList({
  container,
  attributeName,
  [ operator='or' ],
  [ sortBy=['count:desc'] ],
  [ limit=1000 ],
  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count}],
  [ templates.{header,item,footer} ],
  [ transformData ],
  [ autoHideContainer=true ]
})`;
function refinementList({
    container,
    attributeName,
    operator = 'or',
    sortBy = ['count:desc'],
    limit = 1000,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    transformData,
    autoHideContainer = true
  }) {
  let RefinementList = require('../../components/RefinementList/RefinementList');

  if (!container || !attributeName) {
    throw new Error(usage);
  }

  RefinementList = headerFooterHOC(RefinementList);
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  let containerNode = utils.getContainerNode(container);

  if (operator) {
    operator = operator.toLowerCase();
    if (operator !== 'and' && operator !== 'or') {
      throw new Error(usage);
    }
  }

  return {
    getConfiguration: (configuration) => {
      let widgetConfiguration = {
        [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [attributeName]
      };

      let currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
      widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, limit);

      return widgetConfiguration;
    },
    toggleRefinement: (helper, facetValue) => {
      helper
        .toggleRefinement(attributeName, facetValue)
        .search();
    },
    render: function({results, helper, templatesConfig, state, createURL}) {
      let templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      let facetValues = results.getFacetValues(attributeName, {sortBy: sortBy}).slice(0, limit);

      let hasNoFacetValues = facetValues.length === 0;

      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        header: cx(bem('header'), userCssClasses.header),
        body: cx(bem('body'), userCssClasses.body),
        footer: cx(bem('footer'), userCssClasses.footer),
        list: cx(bem('list'), userCssClasses.list),
        item: cx(bem('item'), userCssClasses.item),
        active: cx(bem('item', 'active'), userCssClasses.active),
        label: cx(bem('label'), userCssClasses.label),
        checkbox: cx(bem('checkbox'), userCssClasses.checkbox),
        count: cx(bem('count'), userCssClasses.count)
      };

      let toggleRefinement = this.toggleRefinement.bind(this, helper);

      ReactDOM.render(
        <RefinementList
          createURL={(facetValue) => createURL(state.toggleRefinement(attributeName, facetValue))}
          cssClasses={cssClasses}
          facetValues={facetValues}
          shouldAutoHideContainer={hasNoFacetValues}
          templateProps={templateProps}
          toggleRefinement={toggleRefinement}
        />,
        containerNode
      );
    }
  };
}

module.exports = refinementList;
