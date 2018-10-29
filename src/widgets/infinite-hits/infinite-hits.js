import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import InfiniteHits from '../../components/InfiniteHits/InfiniteHits.js';
import defaultTemplates from './defaultTemplates.js';
import connectInfiniteHits from '../../connectors/infinite-hits/connectInfiniteHits.js';
import { prepareTemplateProps, getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('InfiniteHits');

const renderer = ({
  cssClasses,
  containerNode,
  renderState,
  templates,
  loadMoreLabel,
}) => (
  { hits, results, showMore, isLastPage, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
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
      loadMoreLabel={loadMoreLabel}
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
  [ escapeHTML = true ],
  [ transformItems ],
  [ loadMoreLabel = "Show more results" ],
  [ cssClasses.{root, emptyRoot, list, item, loadMore, disabledLoadMore} ],
  [ templates.{empty,item} | templates.{empty} ],
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
 * @property {string|string[]} [emptyRoot] CSS class to add to the wrapping element when no results.
 * @property {string|string[]} [list] CSS class to add to the list of results.
 * @property {string|string[]} [item] CSS class to add to each result.
 * @property {string|string[]} [loadMore] CSS class to add to the load more button.
 * @property {string|string[]} [disabledLoadMore] CSS class to add to the load more button when disabled.
 */

/**
 * @typedef {Object} InfiniteHitsWidgetOptions
 * @property  {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property  {InfiniteHitsTemplates} [templates] Templates to use for the widget.
 * @property  {string} [loadMoreLabel="Show more results"] label used on the load more button.
 * @property  {InfiniteHitsCSSClasses} [cssClasses] CSS classes to add.
 * @property {boolean} [escapeHTML = true] Escape HTML entities from hits string values.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
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
 *     transformItems: items => items.map(item => item),
 *   })
 * );
 */
export default function infiniteHits({
  container,
  cssClasses: userCssClasses = {},
  loadMoreLabel = 'Show more results',
  templates = defaultTemplates,
  escapeHTML = true,
  transformItems,
} = {}) {
  if (!container) {
    throw new Error(`Must provide a container.${usage}`);
  }

  // We have this specific check because unlike the hits, infiniteHits does not support this template.
  // This can be misleading as they are very similar.
  if (templates.allItems !== undefined) {
    throw new Error(
      'allItems is not a valid template for the infiniteHits widget'
    );
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    loadMore: cx(suit({ descendantName: 'loadMore' }), userCssClasses.loadMore),
    disabledLoadMore: cx(
      suit({ descendantName: 'loadMore', modifierName: 'disabled' }),
      userCssClasses.disabledLoadMore
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    loadMoreLabel,
    renderState: {},
  });

  try {
    const makeInfiniteHits = connectInfiniteHits(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeInfiniteHits({ escapeHTML, transformItems });
  } catch (error) {
    throw new Error(usage);
  }
}
