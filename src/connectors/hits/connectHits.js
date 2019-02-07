import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  checkRendering,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator('hits', {
  connector: true,
});

/**
 * @typedef {Object} HitsRenderingOptions
 * @property {Object[]} hits The matched hits from Algolia API.
 * @property {Object} results The complete results response from Algolia API.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CustomHitsWidgetOptions
 * @property {boolean} [escapeHTML = true] Whether to escape HTML tags from `hits[i]._highlightResult`.
 * @property {function(Object[]):Object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * **Hits** connector provides the logic to create custom widgets that will render the results retrieved from Algolia.
 * @type {Connector}
 * @param {function(HitsRenderingOptions, boolean)} renderFn Rendering function for the custom **Hits** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
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
export default function connectHits(renderFn, unmountFn) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { escapeHTML = true, transformItems = items => items } = widgetParams;

    return {
      getConfiguration() {
        return escapeHTML ? TAG_PLACEHOLDER : undefined;
      },

      init({ instantSearchInstance }) {
        renderFn(
          {
            hits: [],
            results: undefined,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, instantSearchInstance }) {
        if (escapeHTML && results.hits && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        results.hits = transformItems(results.hits);

        renderFn(
          {
            hits: results.hits,
            results,
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
