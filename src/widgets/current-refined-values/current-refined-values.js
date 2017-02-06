import React from 'react';
import ReactDOM from 'react-dom';
import CurrentRefinedValuesWithHOCs from '../../components/CurrentRefinedValues/CurrentRefinedValues.js';
import connectCurrentRefinedValues from '../../connectors/current-refined-values/connectCurrentRefinedValues.js';

/**
 * Instantiate a list of current refinements with the possibility to clear them
 * @function currentRefinedValues
 * @param  {string|DOMElement}  options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array}             [option.attributes] Attributes configuration
 * @param  {string}            [option.attributes[].name] Required attribute name
 * @param  {string}            [option.attributes[].label] Attribute label (passed to the item template)
 * @param  {string|Function}   [option.attributes[].template] Attribute specific template
 * @param  {Function}          [option.attributes[].transformData] Attribute specific transformData
 * @param  {boolean|string}    [option.clearAll='before'] Clear all position (one of ('before', 'after', false))
 * @param  {boolean}           [options.onlyListedAttributes=false] Only use declared attributes
 * @param  {Object}            [options.templates] Templates to use for the widget
 * @param  {string|Function}   [options.templates.header] Header template
 * @param  {string|Function}   [options.templates.item] Item template
 * @param  {string|Function}   [options.templates.clearAll] Clear all template
 * @param  {string|Function}   [options.templates.footer] Footer template
 * @param  {Function}          [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean}           [options.autoHideContainer=true] Hide the container when no current refinements
 * @param  {Object}            [options.cssClasses] CSS classes to be added
 * @param  {string}            [options.cssClasses.root] CSS classes added to the root element
 * @param  {string}            [options.cssClasses.header] CSS classes added to the header element
 * @param  {string}            [options.cssClasses.body] CSS classes added to the body element
 * @param  {string}            [options.cssClasses.clearAll] CSS classes added to the clearAll element
 * @param  {string}            [options.cssClasses.list] CSS classes added to the list element
 * @param  {string}            [options.cssClasses.item] CSS classes added to the item element
 * @param  {string}            [options.cssClasses.link] CSS classes added to the link element
 * @param  {string}            [options.cssClasses.count] CSS classes added to the count element
 * @param  {string}            [options.cssClasses.footer] CSS classes added to the footer element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const currentRefinedValues = connectCurrentRefinedValues(({
  attributes,
  clearAllClick,
  clearAllPosition,
  clearAllURL,
  clearRefinementClicks,
  clearRefinementURLs,
  collapsible,
  cssClasses,
  refinements,
  shouldAutoHideContainer,
  templateProps,
  containerNode,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  ReactDOM.render(
    <CurrentRefinedValuesWithHOCs
      attributes={attributes}
      clearAllClick={clearAllClick}
      clearAllPosition={clearAllPosition}
      clearAllURL={clearAllURL}
      clearRefinementClicks={clearRefinementClicks}
      clearRefinementURLs={clearRefinementURLs}
      collapsible={collapsible}
      cssClasses={cssClasses}
      refinements={refinements}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={templateProps}
    />,
    containerNode
  );
});

export default currentRefinedValues;
