import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customStats = connectState(function render(params, isFirstRendering) {
  // params = {
  //   instantSearchInstance,
  //   hitsPerPage,
  //   nbHits,
  //   nbPages,
  //   page,
  //   processingTimeMS,
  //   query,
  //   widgetParams,
  // }
});
search.addWidget(customStats());
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectStats.html`;

/**
 * @typedef {Object} StatsRenderingOptions
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {number} hitsPerPage the number of hits per page
 * @property {number} nbHits the number of hits returned by the last search results
 * @property {number} nbPages the numbers of pages of results
 * @property {number} page the current page
 * @property {number} processingTimeMS the time taken in the Algolia engine to compute the results
 * @property {string} query the last query used
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * Connects a rendering function with the stats business logic.
 * @param {function(StatsRenderingOptions, boolean)} renderFn function that renders the stats widget
 * @return {function} a widget factory for stats widget
 */
export default function connectStats(renderFn) {
  checkRendering(renderFn, usage);

  return widgetParams => ({
    init({helper, instantSearchInstance}) {
      renderFn({
        instantSearchInstance,
        hitsPerPage: helper.state.hitsPerPage,
        nbHits: 0,
        nbPages: 0,
        page: helper.state.page,
        processingTimeMS: -1,
        query: helper.state.query,
        widgetParams,
      }, true);
    },

    render({results, instantSearchInstance}) {
      renderFn({
        instantSearchInstance,
        hitsPerPage: results.hitsPerPage,
        nbHits: results.nbHits,
        nbPages: results.nbPages,
        page: results.page,
        processingTimeMS: results.processingTimeMS,
        query: results.query,
        widgetParams,
      }, false);
    },
  });
}
