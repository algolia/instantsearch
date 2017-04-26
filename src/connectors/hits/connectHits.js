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
 * @property {Object[]} hits The matched hits from Algolia API.
 * @property {Object} results The complete results response from Algolia API.
 * @property {InstantSearch} instantSearchInstance The instance of instantsearch on which the widget is attached.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * **Hits** connector provides the logic to create connected components that will render the results retrieved from Algolia.
 * @type {Connector}
 * @param {function(HitsRenderingOptions, boolean)} renderFn function that renders the hits widget
 * @return {function} a widget factory for hits widget
 * @example
 * var $ = window.$;
 * var instantsearch = window.instantsearch;
 *
 * // custom `renderFn` to render the custom ClearAll widget
 * function renderFn(HitsRenderingOptions) {
 *   HitsRenderingOptions.containerNode.html(
 *     HitsRenderingOptions.hits.map(function(hit) {
 *       return '<div>' + hit._highlightResult.name.value + '</div>';
 *     })
 *   );
 * }
 *
 * // connect `renderFn` to Hits logic
 * var customHits = instantsearch.connectors.connectHits(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customHits({
 *     containerNode: $('#custom-hits-container'),
 *   })
 * );
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
