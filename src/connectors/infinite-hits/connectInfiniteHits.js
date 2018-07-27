import escapeHits, { tagConfig } from '../../lib/escape-highlight.js';
import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customInfiniteHits = connectInfiniteHits(function render(params, isFirstRendering) {
  // params = {
  //   hits,
  //   results,
  //   showMore,
  //   isLastPage,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customInfiniteHits({
    [ escapeHits: true ],
    [ transformItems ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectInfiniteHits.html
`;

/**
 * @typedef {Object} InfiniteHitsRenderingOptions
 * @property {Array<Object>} hits The aggregated matched hits from Algolia API of all pages.
 * @property {Object} results The complete results response from Algolia API.
 * @property {function} showMore Loads the next page of hits.
 * @property {boolean} isLastPage Indicates if the last page of hits has been reached.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CustomInfiniteHitsWidgetOptions
 * @property {boolean} [escapeHits = false] If true, escape HTML tags from `hits[i]._highlightResult`.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * **InfiniteHits** connector provides the logic to create custom widgets that will render an continuous list of results retrieved from Algolia.
 *
 * This connector provides a `InfiniteHitsRenderingOptions.showMore()` function to load next page of matched results.
 * @type {Connector}
 * @param {function(InfiniteHitsRenderingOptions, boolean)} renderFn Rendering function for the custom **InfiniteHits** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomInfiniteHitsWidgetOptions)} Re-usable widget factory for a custom **InfiniteHits** widget.
 * @example
 * // custom `renderFn` to render the custom InfiniteHits widget
 * function renderFn(InfiniteHitsRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     InfiniteHitsRenderingOptions.widgetParams.containerNode
 *       .html('<div id="hits"></div><button id="show-more">Load more</button>');
 *
 *     InfiniteHitsRenderingOptions.widgetParams.containerNode
 *       .find('#show-more')
 *       .on('click', function(event) {
 *         event.preventDefault();
 *         InfiniteHitsRenderingOptions.showMore();
 *       });
 *   }
 *
 *   InfiniteHitsRenderingOptions.widgetParams.containerNode.find('#hits').html(
 *     InfiniteHitsRenderingOptions.hits.map(function(hit) {
 *       return '<div>' + hit._highlightResult.name.value + '</div>';
 *     })
 *   );
 * };
 *
 * // connect `renderFn` to InfiniteHits logic
 * var customInfiniteHits = instantsearch.connectors.connectInfiniteHits(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customInfiniteHits({
 *     containerNode: $('#custom-infinite-hits-container'),
 *   })
 * );
 */
export default function connectInfiniteHits(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { transformItems = items => items } = widgetParams;
    let hitsCache = [];
    let lastReceivedPage = -1;

    const getShowMore = helper => () => helper.nextPage().search();

    return {
      getConfiguration() {
        return widgetParams.escapeHits ? tagConfig : undefined;
      },

      init({ instantSearchInstance, helper }) {
        this.showMore = getShowMore(helper);

        renderFn(
          {
            hits: hitsCache,
            results: undefined,
            showMore: this.showMore,
            isLastPage: true,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, instantSearchInstance }) {
        if (state.page === 0) {
          hitsCache = [];
          lastReceivedPage = -1;
        }

        results.hits = transformItems(results.hits);

        if (
          widgetParams.escapeHits &&
          results.hits &&
          results.hits.length > 0
        ) {
          results.hits = escapeHits(results.hits);
        }

        if (lastReceivedPage < state.page) {
          hitsCache = [...hitsCache, ...results.hits];
          lastReceivedPage = state.page;
        }

        const isLastPage = results.nbPages <= results.page + 1;

        renderFn(
          {
            hits: hitsCache,
            results,
            showMore: this.showMore,
            isLastPage,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },
    };
  };
}
