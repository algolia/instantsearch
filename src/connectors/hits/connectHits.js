import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits',
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
 * search.addWidgets([
 *   customHits({
 *     containerNode: $('#custom-hits-container'),
 *   })
 * ]);
 */
export default function connectHits(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { escapeHTML = true, transformItems = items => items } = widgetParams;

    return {
      $$type: 'ais.hits',

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
        if (escapeHTML && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        const initialEscaped = results.hits.__escaped;

        results.hits = addAbsolutePosition(
          results.hits,
          results.page,
          results.hitsPerPage
        );

        results.hits = addQueryID(results.hits, results.queryID);

        results.hits = transformItems(results.hits);

        // Make sure the escaped tag stays, even after mapping over the hits.
        // This prevents the hits from being double-escaped if there are multiple
        // hits widgets mounted on the page.
        results.hits.__escaped = initialEscaped;

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

      dispose({ state }) {
        unmountFn();

        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(
          Object.keys(TAG_PLACEHOLDER).reduce(
            (acc, key) => ({
              ...acc,
              [key]: undefined,
            }),
            {}
          )
        );
      },

      getWidgetSearchParameters(state) {
        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(TAG_PLACEHOLDER);
      },
    };
  };
}
