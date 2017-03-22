import React from 'react';
import ReactDOM from 'react-dom';
import RefinementList from '../../components/RefinementList/RefinementList.js';

import connectNumericRefinementList from '../../connectors/numeric-refinement-list/connectNumericRefinementList.js';

import defaultTemplates from './defaultTemplates.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';
import cx from 'classnames';

const bem = bemHelper('ais-refinement-list');

const renderer = ({
  containerNode,
  collapsible,
  autoHideContainer,
  cssClasses,
  renderState,
  transformData,
  templates,
}) => ({
  createURL,
  instantSearchInstance,
  toggleRefinement,
  facetValues,
  noResults,
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

  ReactDOM.render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={facetValues}
      shouldAutoHideContainer={autoHideContainer && noResults}
      templateProps={renderState.templateProps}
      toggleRefinement={toggleRefinement}
    />,
    containerNode
  );
};

/**
 * Instantiate a list of refinements based on a facet
 * @function numericRefinementList
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for filtering
 * @param  {Object[]} options.options List of all the options
 * @param  {string} options.options[].name Name of the option
 * @param  {number} [options.options[].start] Low bound of the option (>=)
 * @param  {number} [options.options[].end] High bound of the option (<=)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.radio] CSS class to add to each radio element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
numericRefinementList({
  container,
  attributeName,
  options,
  [ cssClasses.{root,header,body,footer,list,item,active,label,radio,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer ],
  [ collapsible=false ]
})`;

export default function numericRefinementList({
  container,
  attributeName,
  options,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  collapsible = false,
  transformData,
  autoHideContainer = true,
}) {
  if (!container || !attributeName || !options) {
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
    label: cx(bem('label'), userCssClasses.label),
    radio: cx(bem('radio'), userCssClasses.radio),
    active: cx(bem('item', 'active'), userCssClasses.active),
  };

  const specializedRenderer = renderer({
    containerNode,
    collapsible,
    autoHideContainer,
    cssClasses,
    renderState: {},
    transformData,
    templates,
  });
  try {
    const makeNumericRefinementList = connectNumericRefinementList(specializedRenderer);
    return makeNumericRefinementList({
      attributeName,
      options,
    });
  } catch (e) {
    throw new Error(usage);
  }
}
