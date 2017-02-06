import React from 'react';
import ReactDOM from 'react-dom';
import ClearAllWithHOCs from '../../components/ClearAll/ClearAll.js';

import connectClearAll from '../../connectors/clear-all/connectClearAll.js';

/**
 * Allows to clear all refinements at once
 * @function clearAll
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string[]} [options.excludeAttributes] List of attributes names to exclude from clear actions
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.link] Link template
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there's no refinement to clear
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to the link element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
export default connectClearAll(defaultRendering);

function defaultRendering({
  clearAll,
  collapsible,
  cssClasses,
  hasRefinements,
  shouldAutoHideContainer,
  templateProps,
  url,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;

  ReactDOM.render(
    <ClearAllWithHOCs
      clearAll={clearAll}
      collapsible={collapsible}
      cssClasses={cssClasses}
      hasRefinements={hasRefinements}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={templateProps}
      url={url}
    />,
    containerNode
  );
}
