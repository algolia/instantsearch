import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import InfiniteHits from '../../components/InfiniteHits/InfiniteHits';
import defaultTemplates from './defaultTemplates';
import connectInfiniteHits from '../../connectors/infinite-hits/connectInfiniteHits';
import {
  prepareTemplateProps,
  getContainerNode,
  warning,
  createDocumentationLink,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator('infinite-hits');
const suit = component('InfiniteHits');

const renderer = ({ cssClasses, containerNode, renderState, templates }) => (
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
      templateProps={renderState.templateProps}
      isLastPage={isLastPage}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} InfiniteHitsTemplates
 * @property {string|function} [empty = "No results"] Template used when there are no results.
 * @property {string|function} [showMoreText = "Show more results"] Template used for the "load more" button.
 * @property {string|function} [item = ""] Template used for each result. This template will receive an object containing a single record.
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
 *       showMoreText: 'Show more results',
 *       item: '<strong>Hit {{objectID}}</strong>: {{{_highlightResult.name.value}}}'
 *     },
 *     transformItems: items => items.map(item => item),
 *   })
 * );
 */
export default function infiniteHits({
  container,
  escapeHTML,
  transformItems,
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
} = {}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  // We have this specific check because unlike `hits`, `infiniteHits` does not support
  // the `allItems` template. This can be misleading as they are very similar.
  warning(
    typeof templates.allItems === 'undefined',
    `The template \`allItems\` does not exist since InstantSearch.js 3.

 You may want to migrate using \`connectInfiniteHits\`: ${createDocumentationLink(
   'infinite-hits',
   { connector: true }
 )}.`
  );

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
    renderState: {},
  });

  const makeInfiniteHits = connectInfiniteHits(specializedRenderer, () =>
    unmountComponentAtNode(containerNode)
  );

  return makeInfiniteHits({ escapeHTML, transformItems });
}
