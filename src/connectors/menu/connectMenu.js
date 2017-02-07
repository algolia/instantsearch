import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
  prefixKeys,
} from '../../lib/utils.js';
import cx from 'classnames';
import getShowMoreConfig from '../../lib/show-more/getShowMoreConfig.js';
import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-menu');

/**
 * Create a menu out of a facet
 * @function menu
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {string[]|Function} [options.sortBy=['count:desc', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 * @param  {string} [options.limit=10] How many facets values to retrieve [*]
 * @param  {object|boolean} [options.showMore=false] Limit the number of results and display a showMore button
 * @param  {object} [options.showMore.templates] Templates to use for showMore
 * @param  {object} [options.showMore.templates.active] Template used when showMore was clicked
 * @param  {object} [options.showMore.templates.inactive] Template used when showMore not clicked
 * @param  {object} [options.showMore.limit] Max number of facets values to display when showMore is clicked
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Method to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
menu({
  container,
  attributeName,
  [ sortBy=['count:desc', 'name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root,list,item} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer ],
  [ showMore.{templates: {active, inactive}, limit} ],
  [ collapsible=false ]
})`;
const menu = menuRendering => ({
    container,
    attributeName,
    sortBy = ['count:desc', 'name:asc'],
    limit = 10,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    collapsible = false,
    transformData,
    autoHideContainer = true,
    showMore = false,
  } = {}) => {
  const showMoreConfig = getShowMoreConfig(showMore);
  if (showMoreConfig && showMoreConfig.limit < limit) {
    throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
  }
  const widgetMaxValuesPerFacet = showMoreConfig && showMoreConfig.limit || limit;

  if (!container || !attributeName) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  // we use a hierarchicalFacet for the menu because that's one of the use cases
  // of hierarchicalFacet: a flat menu
  const hierarchicalFacetName = attributeName;

  const showMoreTemplates = showMoreConfig && prefixKeys('show-more-', showMoreConfig.templates);
  const allTemplates =
    showMoreTemplates ?
      {...templates, ...showMoreTemplates} :
      templates;

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    link: cx(bem('link'), userCssClasses.link),
    count: cx(bem('count'), userCssClasses.count),
  };

  return {
    getConfiguration: configuration => {
      const widgetConfiguration = {
        hierarchicalFacets: [{
          name: hierarchicalFacetName,
          attributes: [attributeName],
        }],
      };

      const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
      widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, widgetMaxValuesPerFacet);

      return widgetConfiguration;
    },
    init({templatesConfig, helper, createURL}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates: allTemplates,
      });
      this._createURL = state => facetValue => createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
      this._toggleRefinement = facetValue => helper
        .toggleRefinement(hierarchicalFacetName, facetValue)
        .search();

      menuRendering({
        collapsible,
        createURL: this._createURL(helper.state),
        cssClasses,
        facetValues: [],
        limitMax: widgetMaxValuesPerFacet,
        limitMin: limit,
        shouldAutoHideContainer: autoHideContainer,
        showMore: showMoreConfig !== null,
        templateProps: this._templateProps,
        toggleRefinement: this._toggleRefinement,
        containerNode,
      }, true);
    },
    _prepareFacetValues(facetValues, state) {
      const createURL = this._createURL(state);
      return facetValues
        .map(facetValue => {
          facetValue.url = createURL(facetValue);
          return facetValue;
        });
    },
    render({results, state}) {
      let facetValues = results.getFacetValues(hierarchicalFacetName, {sortBy}).data || [];
      facetValues = this._prepareFacetValues(facetValues, state);

      menuRendering({
        collapsible,
        createURL: this._createURL(state),
        cssClasses,
        facetValues,
        limitMax: widgetMaxValuesPerFacet,
        limitMin: limit,
        shouldAutoHideContainer: autoHideContainer && facetValues.length === 0,
        showMore: showMoreConfig !== null,
        templateProps: this._templateProps,
        toggleRefinement: this._toggleRefinement,
        containerNode,
      }, false);
    },
  };
};

export default menu;
