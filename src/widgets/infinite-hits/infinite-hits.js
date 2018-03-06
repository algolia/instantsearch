import React, { render, unmountComponentAtNode } from 'preact-compat';
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
}) => (
  { hits, results, showMore, isLastPage, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  render(
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
  [ escapeHits = false ],
  [ showMoreLabel ],
  [ cssClasses.{root,empty,item,showmore}={} ],
  [ templates.{empty,item} | templates.{empty} ],
  [ transformData.{empty,item} | transformData.{empty} ],
})`;

/**
 * @typedef {Object} InfiniteHitsTemplates
 * @property {string|function} [empty=""] Template used when there are no results.
 * @property {string|function} [item=""] Template used for each result. This template will receive an object containing a single record.
 */

/**
 * @typedef {Object} InfiniteHitsTransforms
 * @property {function} [empty] Method used to change the object passed to the `empty` template.
 * @property {function} [item] Method used to change the object passed to the `item` template.
 */

/**
 * @typedef {object} InfiniteHitsCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapping element.
 * @property {string|string[]} [empty] CSS class to add to the wrapping element when no results.
 * @property {string|string[]} [item] CSS class to add to each result.
 * @property {string|string[]} [showmore] CSS class to add to the show more button.
 */

/**
 * @typedef {Object} InfiniteHitsWidgetOptions
 * @property  {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property  {InfiniteHitsTemplates} [templates] Templates to use for the widget.
 * @property  {string} [showMoreLabel="Show more results"] label used on the show more button.
 * @property  {InfiniteHitsTransforms} [transformData] Method to change the object passed to the templates.
 * @property  {InfiniteHitsCSSClasses} [cssClasses] CSS classes to add.
 * @property {boolean} [escapeHits = false] Escape HTML entities from hits string values.
 */

/**
 * Display the list of results (hits) from the current search.
 *
 * This widget uses the infinite hits pattern. It contains a button that
 * will let the user load more results to the list. This is particularly
 * handy on mobile implementations.
 * @type {WidgetFactory}
 * @devNovel InfiniteHits
 * @category basic
 * @param {InfiniteHitsWidgetOptions} $0 The options for the InfiniteHits widget.
 * @return {Widget} Creates a new instance of the InfiniteHits widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.infiniteHits({
 *     container: '#infinite-hits-container',
 *     templates: {
 *       empty: 'No results',
 *       item: '<strong>Hit {{objectID}}</strong>: {{{_highlightResult.name.value}}}'
 *     },
 *     escapeHits: true,
 *   })
 * );
 */
export default function infiniteHits(
  {
    container,
    cssClasses: userCssClasses = {},
    showMoreLabel = 'Show more results',
    templates = defaultTemplates,
    transformData,
    escapeHits = false,
  } = {}
) {
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
    const makeInfiniteHits = connectInfiniteHits(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeInfiniteHits({ escapeHits });
  } catch (e) {
    throw new Error(usage);
  }
}
