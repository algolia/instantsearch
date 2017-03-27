import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import InfiniteHits from '../../components/InfiniteHits.js';
import defaultTemplates from './defaultTemplates.js';
import connectInfiniteHits from '../../connectors/infinite-hits/connectInfiniteHits.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-infinite-hits');

const renderer = ({
  cssClasses,
  containerNode,
  renderState,
  templates,
  transformData,
  showMoreLabel,
}) => ({
  hits,
  results,
  showMore,
  isLastPage,
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

  ReactDOM.render(
    <InfiniteHits
      cssClasses={cssClasses}
      hits={hits}
      results={results}
      showMore={showMore}
      showMoreLabel={showMoreLabel}
      templateProps={renderState.templateProps}
      isLastPage={isLastPage}
    />,
    containerNode
  );
};

const usage = `
Usage:
infiniteHits({
  container,
  [ showMoreLabel ],
  [ cssClasses.{root,empty,item}={} ],
  [ templates.{empty,item} | templates.{empty} ],
  [ transformData.{empty,item} | transformData.{empty} ],
  [ hitsPerPage=20 ]
})`;

/**
 * Display the list of results (hits) from the current search
 * @function infiniteHits
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {number} [$0.hitsPerPage=20] The number of hits to display per page [*]
 * @param  {Object} [$0.templates] Templates to use for the widget
 * @param  {string|Function} [$0.templates.empty=""] Template to use when there are no results.
 * @param  {string|Function} [$0.templates.item=""] Template to use for each result. This template will receive an object containing a single record.
 * @param  {string} [$0.showMoreLabel="Show more results"] label used on the show more button
 * @param  {Object} [$0.transformData] Method to change the object passed to the templates
 * @param  {Function} [$0.transformData.empty] Method used to change the object passed to the `empty` template
 * @param  {Function} [$0.transformData.item] Method used to change the object passed to the `item` template
 * @param  {Object} [$0.cssClasses] CSS classes to add
 * @param  {string|string[]} [$0.cssClasses.root] CSS class to add to the wrapping element
 * @param  {string|string[]} [$0.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {string|string[]} [$0.cssClasses.item] CSS class to add to each result
 * @return {Object} widget
 */
export default function infiniteHits({
  container,
  cssClasses: userCssClasses = {},
  showMoreLabel = 'Show more results',
  templates = defaultTemplates,
  transformData,
  hitsPerPage = 20,
}) {
  if (!container) {
    throw new Error(`Must provide a container.${usage}`);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    empty: cx(bem(null, 'empty'), userCssClasses.empty),
    showmore: cx(bem('showmore'), userCssClasses.showmore),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    transformData,
    templates,
    showMoreLabel,
    renderState: {},
  });

  try {
    const makeInfiniteHits = connectInfiniteHits(specializedRenderer);
    return makeInfiniteHits({hitsPerPage});
  } catch (e) {
    throw new Error(usage);
  }
}
