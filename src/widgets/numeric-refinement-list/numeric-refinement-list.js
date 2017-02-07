import React from 'react';
import ReactDOM from 'react-dom';
import RefinementList from '../../components/RefinementList/RefinementList.js';

import connectNumericRefinementList from '../../connectors/numeric-refinement-list/connectNumericRefinementList.js';

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
export default connectNumericRefinementList(defaultRendering);

function defaultRendering({
  collapsible,
  createURL,
  cssClasses,
  facetValues,
  shouldAutoHideContainer,
  templateProps,
  toggleRefinement,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;
  ReactDOM.render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={facetValues}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={templateProps}
      toggleRefinement={toggleRefinement}
    />,
    containerNode
  );
}
