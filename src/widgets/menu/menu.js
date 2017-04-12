import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import defaultTemplates from './defaultTemplates.js';
import getShowMoreConfig from '../../lib/show-more/getShowMoreConfig.js';
import connectMenu from '../../connectors/menu/connectMenu.js';
import RefinementList from '../../components/RefinementList/RefinementList.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
  prefixKeys,
} from '../../lib/utils.js';

const bem = bemHelper('ais-menu');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
  renderState,
  templates,
  transformData,
  widgetMaxValuesPerFacet,
  limit,
  showMoreConfig,
}) => ({
  refine,
  items,
  createURL,
  canRefine,
  instantSearchInstance,
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

  const facetValues = items.map(facetValue => ({...facetValue, url: createURL(facetValue.name)}));
  const shouldAutoHideContainer = autoHideContainer && !canRefine;

  ReactDOM.render(
    <RefinementList
      collapsible={ collapsible }
      createURL={ createURL }
      cssClasses={ cssClasses }
      facetValues={ facetValues }
      limitMax={ widgetMaxValuesPerFacet }
      limitMin={ limit }
      shouldAutoHideContainer={ shouldAutoHideContainer }
      showMore={ showMoreConfig !== null }
      templateProps={ renderState.templateProps }
      toggleRefinement={ refine }
    />,
    containerNode
  );
};

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

/**
 * Create a menu out of a facet
 * @type {WidgetFactory}
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {string} $0.attributeName Name of the attribute for faceting
 * @param  {string[]|Function} [$0.sortBy=['count:desc', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 * @param  {string} [$0.limit=10] How many facets values to retrieve [*]
 * @param  {object|boolean} [$0.showMore=false] Limit the number of results and display a showMore button
 * @param  {object} [$0.showMore.templates] Templates to use for showMore
 * @param  {object} [$0.showMore.templates.active] Template used when showMore was clicked
 * @param  {object} [$0.showMore.templates.inactive] Template used when showMore not clicked
 * @param  {object} [$0.showMore.limit] Max number of facets values to display when showMore is clicked
 * @param  {Object} [$0.templates] Templates to use for the widget
 * @param  {string|Function} [$0.templates.header] Header template
 * @param  {string|Function} [$0.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [$0.templates.footer] Footer template
 * @param  {Function} [$0.transformData.item] Method to change the object passed to the `item` template
 * @param  {boolean} [$0.autoHideContainer=true] Hide the container when there are no items in the menu
 * @param  {Object} [$0.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [$0.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [$0.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [$0.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [$0.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [$0.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [$0.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [$0.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [$0.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {object|boolean} [$0.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [$0.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object} Widget instance
 */
export default function menu({
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
}) {
  if (!container) {
    throw new Error(usage);
  }

  const showMoreConfig = getShowMoreConfig(showMore);
  if (showMoreConfig && showMoreConfig.limit < limit) {
    throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
  }

  const widgetMaxValuesPerFacet = showMoreConfig && showMoreConfig.limit || limit;

  const containerNode = getContainerNode(container);

  const showMoreTemplates = showMoreConfig && prefixKeys('show-more-', showMoreConfig.templates);
  const allTemplates = showMoreTemplates ? {...templates, ...showMoreTemplates} : templates;

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

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    autoHideContainer,
    renderState: {},
    templates: allTemplates,
    transformData,
    widgetMaxValuesPerFacet,
    limit,
    showMoreConfig,
  });

  try {
    const makeWidget = connectMenu(specializedRenderer);
    return makeWidget({attributeName, limit, sortBy});
  } catch (e) {
    throw new Error(usage);
  }
}
