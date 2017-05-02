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
})`;

/**
 * @typedef {Object} InfiniteHitsTemplates
 * @property  {string|function} [empty=""] Template used when there are no results.
 * @property  {string|function} [item=""] Template used for each result. This template will receive an object containing a single record.
 */

/**
 * @typedef {Object} InfiniteHitsTransforms
 * @property  {function} [empty] Method used to change the object passed to the `empty` template.
 * @property  {function} [item] Method used to change the object passed to the `item` template.
 */

/**
 * @typedef {object} InfiniteHitsCSSClasses
 * @property  {string|string[]} [root] CSS class to add to the wrapping element.
 * @property  {string|string[]} [empty] CSS class to add to the wrapping element when no results.
 * @property  {string|string[]} [item] CSS class to add to each result.
 */

/**
 * @typedef {Object} InfiniteHitsWidgetOptions
 * @property  {string|DOMElement} container CSS Selector or DOMElement to insert the widget
 * @property  {InfiniteHitsTemplates} [templates] Templates to use for the widget
 * @property  {string} [showMoreLabel="Show more results"] label used on the show more button
 * @property  {InfiniteHitsTransforms} [transformData] Method to change the object passed to the templates
 * @property  {InfiniteHitsCSSClasses} [cssClasses] CSS classes to add
 */

/**
 * Display the list of results (hits) from the current search
 * @type {WidgetFactory}
 * @param {InfiniteHitsWidgetOptions} $0 The options for the infinite hits widget.
 * @return {Object} widget
 */
export default function infiniteHits({
  container,
  cssClasses: userCssClasses = {},
  showMoreLabel = 'Show more results',
  templates = defaultTemplates,
  transformData,
} = {}) {
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
    return makeInfiniteHits();
  } catch (e) {
    throw new Error(usage);
  }
}
