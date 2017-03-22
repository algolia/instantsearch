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
  // }
});
search.addWidget(customStats());
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectStats.html`;

/**
 * @typedef {Object} StatsRenderingOptions
 * @property {InstantSearch} instantSearchInstance
 * @property {number} hitsPerPage
 * @property {number} nbHits
 * @property {number} nbPages
 * @property {number} page
 * @property {number} processingTimeMS
 * @property {string} query
 */

/**
 * Connects a rendering function with the stats business logic.
 * @param {function(StatsRenderingOptions)} renderFn function that renders the stats widget
 * @return {function} a widget factory for stats widget
 */
export default function connectStats(renderFn) {
  checkRendering(renderFn, usage);

  return () => ({
    init({helper, instantSearchInstance}) {
      renderFn({
        instantSearchInstance,
        hitsPerPage: helper.state.hitsPerPage,
        nbHits: 0,
        nbPages: 0,
        page: helper.state.page,
        processingTimeMS: -1,
        query: helper.state.query,
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
      }, false);
    },
  });
}
