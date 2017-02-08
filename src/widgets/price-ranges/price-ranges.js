import React from 'react';
import ReactDOM from 'react-dom';
import PriceRanges from '../../components/PriceRanges/PriceRanges.js';
import connectPriceRanges from '../../connectors/price-ranges/connectPriceRanges.js';

/**
 * Instantiate a price ranges on a numerical facet
 * @function priceRanges
 * @param  {string|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.item] Item template. Template data: `from`, `to` and `currency`
 * @param  {string} [options.currency='$'] The currency to display
 * @param  {Object} [options.labels] Labels to use for the widget
 * @param  {string|Function} [options.labels.separator] Separator label, between min and max
 * @param  {string|Function} [options.labels.button] Button label
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the wrapping list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to the active item element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.form] CSS class to add to the form element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each wrapping label of the form
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to each input of the form
 * @param  {string|string[]} [options.cssClasses.currency] CSS class to add to each currency element of the form
 * @param  {string|string[]} [options.cssClasses.separator] CSS class to add to the separator of the form
 * @param  {string|string[]} [options.cssClasses.button] CSS class to add to the submit button of the form
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */

export default connectPriceRanges(defaultRendering);
function defaultRendering({
  collapsible,
  cssClasses,
  currency,
  facetValues,
  labels,
  refine,
  shouldAutoHideContainer,
  templateProps,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;
  ReactDOM.render(
    <PriceRanges
      collapsible={collapsible}
      cssClasses={cssClasses}
      currency={currency}
      facetValues={facetValues}
      labels={labels}
      refine={refine}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={templateProps}
    />,
    containerNode
  );
}
