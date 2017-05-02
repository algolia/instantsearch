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
 * @property {Array} hits the aggregated hits of all the pages
 * @property {Object} results the last results
 * @property {function} showMore adds a new page and search
 * @property {boolean} isLastPage true if the last page has been reached
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * Connects a rendering function with the infinite hits business logic.
 * @type {Connector}
 * @param {function(InfiniteHitsRenderingOptions, boolean)} renderFn function that renders the infinite hits widget
 * @return {function(object)} a widget factory for infinite hits widget
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
