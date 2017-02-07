import React from 'react';
import ReactDOM from 'react-dom';
import Hits from '../../components/Hits.js';

import connectHits from '../../connectors/hits/connectHits.js';

/**
 * Display the list of results (hits) from the current search
 * @function hits
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {number} [options.hitsPerPage=20] The number of hits to display per page [*]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.empty=''] Template to use when there are no results.
 * @param  {string|Function} [options.templates.item=''] Template to use for each result. This template will receive an object containing a single record.
 * @param  {string|Function} [options.templates.allItems=''] Template to use for the list of all results. (Can't be used with `item` template). This template will receive a complete SearchResults result object, this object contains the key hits that contains all the records retrieved.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty] Method used to change the object passed to the `empty` template
 * @param  {Function} [options.transformData.item] Method used to change the object passed to the `item` template
 * @param  {Function} [options.transformData.allItems] Method used to change the object passed to the `allItems` template
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the wrapping element
 * @param  {string|string[]} [options.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each result
 * @return {Object}
 */
export default connectHits(defaultRendering);

function defaultRendering({
  cssClasses,
  hits,
  results,
  templateProps,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;
  ReactDOM.render(
    <Hits
      cssClasses={cssClasses}
      hits={hits}
      results={results}
      templateProps={templateProps}
    />,
    containerNode
  );
}
