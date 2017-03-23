import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import RefinementList from '../../components/RefinementList/RefinementList.js';
import connectStarRating from '../../connectors/star-rating/connectStarRating.js';
import defaultTemplates from './defaultTemplates.js';
import defaultLabels from './defaultLabels.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-star-rating');

const renderer = ({
  containerNode,
  cssClasses,
  templates,
  collapsible,
  transformData,
  autoHideContainer,
  renderState,
  labels,
}) => ({
  refine,
  items,
  createURL,
  instantSearchInstance,
  hasNoResults,
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

  const shouldAutoHideContainer = autoHideContainer && hasNoResults;

  ReactDOM.render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={items.map(item => ({...item, labels}))}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
    />,
    containerNode
  );
};

const usage = `Usage:
starRating({
  container,
  attributeName,
  [ max=5 ],
  [ cssClasses.{root,header,body,footer,list,item,active,link,disabledLink,star,emptyStar,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ labels.{andUp} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;

/**
 * Instantiate a list of refinements based on a rating attribute
 * The ratings must be integer values. You can still keep the precise float value in another attribute
 * to be used in the custom ranking configuration. So that the actual hits ranking is precise.
 * @function starRating
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {string} $0.attributeName Name of the attribute for filtering
 * @param  {number} [$0.max] The maximum rating value
 * @param  {Object} [$0.labels] Labels used by the default template
 * @param  {string} [$0.labels.andUp] The label suffixed after each line
 * @param  {Object} [$0.templates] Templates to use for the widget
 * @param  {string|Function} [$0.templates.header] Header template
 * @param  {string|Function} [$0.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [$0.templates.footer] Footer template
 * @param  {Function} [$0.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [$0.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [$0.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [$0.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [$0.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [$0.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [$0.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [$0.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [$0.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [$0.cssClasses.link] CSS class to add to each link element
 * @param  {string|string[]} [$0.cssClasses.disabledLink] CSS class to add to each disabled link (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.star] CSS class to add to each star element (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.emptyStar] CSS class to add to each empty star element (when using the default template)
 * @param  {string|string[]} [$0.cssClasses.active] CSS class to add to each active element
 * @param  {object|boolean} [$0.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [$0.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object} widget
 */
export default function starRating({
  container,
  attributeName,
  max = 5,
  cssClasses: userCssClasses = {},
  labels = defaultLabels,
  templates = defaultTemplates,
  collapsible = false,
  transformData,
  autoHideContainer = true,
}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    link: cx(bem('link'), userCssClasses.link),
    disabledLink: cx(bem('link', 'disabled'), userCssClasses.disabledLink),
    count: cx(bem('count'), userCssClasses.count),
    star: cx(bem('star'), userCssClasses.star),
    emptyStar: cx(bem('star', 'empty'), userCssClasses.emptyStar),
    active: cx(bem('item', 'active'), userCssClasses.active),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    autoHideContainer,
    renderState: {},
    templates,
    transformData,
    labels,
  });

  try {
    const makeWidget = connectStarRating(specializedRenderer);
    return makeWidget({attributeName, max});
  } catch (e) {
    throw new Error(usage);
  }
}
