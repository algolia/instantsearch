import React from 'react';
import ReactDOM from 'react-dom';
import InfiniteHits from '../../components/InfiniteHits.js';

import connectInfiniteHits from '../../connectors/infinite-hits/connectInfiniteHits.js';

/**
 * Display the list of results (hits) from the current search
 * @function infiniteHits
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {number} [options.hitsPerPage=20] The number of hits to display per page [*]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.empty=""] Template to use when there are no results.
 * @param  {string|Function} [options.templates.item=""] Template to use for each result. This template will receive an object containing a single record.
 * @param  {string} [options.showMoreLabel="Show more results"] label used on the show more button
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty] Method used to change the object passed to the `empty` template
 * @param  {Function} [options.transformData.item] Method used to change the object passed to the `item` template
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the wrapping element
 * @param  {string|string[]} [options.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each result
 * @return {Object}
 */
export default connectInfiniteHits(defaultRendering);

function defaultRendering({
  cssClasses,
  hits,
  results,
  showMore,
  showMoreLabel,
  templateProps,
  isLastPage,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;

  ReactDOM.render(
    <InfiniteHits
      cssClasses={cssClasses}
      hits={hits}
      results={results}
      showMore={showMore}
      showMoreLabel={showMoreLabel}
      templateProps={templateProps}
      isLastPage={isLastPage}
    />,
    containerNode
  );
}
