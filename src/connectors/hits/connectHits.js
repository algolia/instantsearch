import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customHits = connectHits(function render(params, isFirstRendering) {
  // params = {
  //   hits,
  //   results,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(customHits());
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHits.html
`;

/**
 * @typedef {Object} HitsRenderingOptions
 * @property {Object[]} hits the hits contained in the last results from Algolia
 * @property {Object} results the complete results from Algolia
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * Connects a rendering function with the hits business logic.
 * @type {Connector}
 * @param {function(HitsRenderingOptions, boolean)} renderFn function that renders the hits widget
 * @return {function} a widget factory for hits widget
 */
export default function connectHits(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => ({
    init({instantSearchInstance}) {
      renderFn({
        hits: [],
        results: undefined,
        instantSearchInstance,
        widgetParams,
      }, true);
    },

    render({results, instantSearchInstance}) {
      renderFn({
        hits: results.hits,
        results,
        instantSearchInstance,
        widgetParams,
      }, false);
    },
  });
}
