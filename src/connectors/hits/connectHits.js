import escapeHighlight from '../../lib/escape-highlight.js';
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
search.addWidget(
  customHits({
    [ escapeHits = false ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHits.html
`;

const config = {
  highlightPreTag: '__ais-highlight__',
  highlightPostTag: '__/ais-highlight__',
};

/**
 * @typedef {Object} CustomHitsWidgetOptions
 * @property {boolean} [escapeHits = false] Escape HTML entities from hits string values.
 */

/**
 * @typedef {Object} HitsRenderingOptions
 * @property {Object[]} hits The matched hits from Algolia API.
 * @property {Object} results The complete results response from Algolia API.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * **Hits** connector provides the logic to create custom widgets that will render the results retrieved from Algolia.
 * @type {Connector}
 * @param {function(HitsRenderingOptions, boolean)} renderFn Rendering function for the custom **Hits** widget.
 * @return {function(CustomHitsWidgetOptions)} Re-usable widget factory for a custom **Hits** widget.
 * @example
 * // custom `renderFn` to render the custom Hits widget
 * function renderFn(HitsRenderingOptions) {
 *   HitsRenderingOptions.widgetParams.containerNode.html(
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

  return (widgetParams = {}) => {
    const {escapeHits = false} = widgetParams;

    return {
      getConfiguration() {
        return config;
      },

      init({instantSearchInstance}) {
        renderFn({
          hits: [],
          results: undefined,
          instantSearchInstance,
          widgetParams,
        }, true);
      },

      render({results, instantSearchInstance}) {
        if (escapeHits === true) {
          results.hits = results.hits.map(escapeHighlight);
        }

        renderFn({
          hits: results.hits,
          results,
          instantSearchInstance,
          widgetParams,
        }, false);
      },
    };
  };
}
