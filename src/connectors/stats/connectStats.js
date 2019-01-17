import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customStats = connectStats(function render(params, isFirstRendering) {
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
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectStats.html`;

/**
 * @typedef {Object} StatsRenderingOptions
 * @property {number} hitsPerPage The maximum number of hits per page returned by Algolia.
 * @property {number} nbHits The number of hits in the result set.
 * @property {number} nbPages The number of pages computed for the result set.
 * @property {number} page The current page.
 * @property {number} processingTimeMS The time taken to compute the results inside the Algolia engine.
 * @property {string} query The query used for the current search.
 * @property {object} widgetParams All original `CustomStatsWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **Stats** connector provides the logic to build a custom widget that will displays
 * search statistics (hits number and processing time).
 *
 * @type {Connector}
 * @param {function(StatsRenderingOptions, boolean)} renderFn Rendering function for the custom **Stats** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function} Re-usable widget factory for a custom **Stats** widget.
 * @example
 * // custom `renderFn` to render the custom Stats widget
 * function renderFn(StatsRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) return;
 *
 *   StatsRenderingOptions.widgetParams.containerNode
 *     .html(StatsRenderingOptions.nbHits + ' results found in ' + StatsRenderingOptions.processingTimeMS);
 * }
 *
 * // connect `renderFn` to Stats logic
 * var customStatsWidget = instantsearch.connectors.connectStats(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customStatsWidget({
 *     containerNode: $('#custom-stats-container'),
 *   })
 * );
 */
export default function connectStats(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => ({
    init({ helper, instantSearchInstance }) {
      renderFn(
        {
          instantSearchInstance,
          hitsPerPage: helper.state.hitsPerPage,
          nbHits: 0,
          nbPages: 0,
          page: helper.state.page,
          processingTimeMS: -1,
          query: helper.state.query,
          widgetParams,
        },
        true
      );
    },

    render({ results, instantSearchInstance }) {
      renderFn(
        {
          instantSearchInstance,
          hitsPerPage: results.hitsPerPage,
          nbHits: results.nbHits,
          nbPages: results.nbPages,
          page: results.page,
          processingTimeMS: results.processingTimeMS,
          query: results.query,
          widgetParams,
        },
        false
      );
    },

    dispose() {
      unmountFn();
    },
  });
}
