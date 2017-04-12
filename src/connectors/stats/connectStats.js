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
 * @property {number} hitsPerPage the maximum number of hits per page returned by Algolia
 * @property {number} nbHits the number of hits in the result set
 * @property {number} nbPages the number of pages computed for the result set
 * @property {number} page the current page
 * @property {number} processingTimeMS the time taken to compute the results inside the Algolia engine
 * @property {string} query the query used for the current search
 * @property {object} widgetParams all widget options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 */

/**
 * Connects a rendering function with the stats business logic.
 * @type {Connector}
 * @param {function(StatsRenderingOptions, boolean)} renderFn function that renders the stats widget
 * @return {function} a widget factory for stats widget
 */
export default function connectStats(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => ({
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
