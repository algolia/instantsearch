import {checkRendering} from '../../lib/utils.js';

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
  customInfiniteHits()
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectInfiniteHits.html
`;

/**
 * @typedef {Object} InfiniteHitsRenderingOptions
 * @property {Array<Object>} hits The aggregated matched hits from Algolia API of all pages.
 * @property {Object} results The complete results response from Algolia API.
 * @property {function} showMore Action to load next page of hits.
 * @property {boolean} isLastPage Indicate if the last page of hits has been reached.
 * @property {InstantSearch} instantSearchInstance The instance of instantsearch on which the widget is attached.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * **InfiniteHits** connector provides the logic to create custom widgets that will render an continuous list of results retrieved from Algolia. This connector provides a function to load more results.
 * @type {Connector}
 * @param {function(InfiniteHitsRenderingOptions, boolean)} renderFn Renders the infinite hits custom widget.
 * @return {function(object)} A widget factory for infinite hits widget.
 * @example
 * var $ = window.$;
 * var instantsearch = window.instantsearch;
 *
 * // custom `renderFn` to render the custom ClearAll widget
 * function renderFn(InfiniteHitsRenderingOptions) {
 *   if (isFirstRendering === true) {
 *     InfiniteHitsRenderingOptions.widgetParams.containerNode
 *       .html('<div id="hits"></div><button id="show-more"></button>');
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
 *
 * // connect `renderFn` to Hits logic
 * var customInfiniteHits = instantsearch.connectors.connectInfiniteHits(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customInfiniteHits({
 *     containerNode: $('#custom-infinite-hits-container'),
 *   })
 * );
 */
export default function connectInfiniteHits(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    let hitsCache = [];
    const getShowMore = helper => () => helper.nextPage().search();

    return {
      init({instantSearchInstance, helper}) {
        this.showMore = getShowMore(helper);

        renderFn({
          hits: hitsCache,
          results: undefined,
          showMore: this.showMore,
          isLastPage: true,
          instantSearchInstance,
          widgetParams,
        }, true);
      },

      render({results, state, instantSearchInstance}) {
        if (state.page === 0) {
          hitsCache = [];
        }

        hitsCache = [...hitsCache, ...results.hits];

        const isLastPage = results.nbPages <= results.page + 1;

        renderFn({
          hits: hitsCache,
          results,
          showMore: this.showMore,
          isLastPage,
          instantSearchInstance,
          widgetParams,
        }, false);
      },
    };
  };
}
