import escapeHits, { tagConfig } from '../../lib/escape-highlight';
import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customAutcomplete = connectAutocomplete(function render(params, isFirstRendering) {
  // params = {
  //   indices,
  //   refine,
  //   currentRefinement
  // }
});
search.addWiget(customAutcomplete({
  [ indices ],
  [ escapeHits = false ]
}));
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectAutocomplete.html
`;

/**
 * @typedef {Object} Index
 * @property {string} index Name of the index.
 * @property {string} label Label of the index (for display purpose).
 * @property {Object} helper The helper instance used to search into this index.
 * @property {Object[]} hits The hits resolved from the index matching the query.
 * @property {Object} resuls The full results object from Algolia API.
 */

/**
 * @typedef {Object} AutocompleteRenderingOptions
 * @property {Index[]} indices The indices with their hits and results.
 * @property {function(string)} refine Search into the indices with the query provided.
 * @property {string} currentRefinement The actual value of the query.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CustomAutocompleteWidgetOptions
 * @property {string[]} [indices = []] Name of the others indices to search into.
 * @property {boolean} [escapeHits = false] If true, escape HTML tags from `hits[i]._highlightResult`.
 */

/**
 * **Autocomplete** connector provides the logic to build a widget that will give the user the ability to search into multiple indices.
 *
 * This connector provides a `refine()` function to search for a query and a `currentRefinement` as the current query used to search.
 *
 * THere's a complete example available on how to write a custom **Autocomplete** widget:
 * [autocomplete.js](https://github.com/algolia/instantsearch.js/blob/develop/dev/app/custom-widgets/jquery/autocomplete.js)
 * @type {Connector}
 * @param {function(AutocompleteRenderingOptions, boolean)} renderFn Rendering function for the custom **Autocomplete** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomAutocompleteWidgetOptions)} Re-usable widget factory for a custom **Autocomplete** widget.
 */
export default function connectAutocomplete(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { indices = [] } = widgetParams;

    // user passed a wrong `indices` option type
    if (!Array.isArray(indices)) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return widgetParams.escapeHits ? tagConfig : undefined;
      },

      init({ instantSearchInstance, helper }) {
        this._refine = this.refine(helper);

        this.indices = [
          {
            helper,
            label: 'primary',
            index: helper.getIndex(),
            results: undefined,
            hits: [],
          },
        ];

        // add additionnal indices into `this.indices`
        indices.forEach(({ label, value }) => {
          const derivedHelper = helper.derive(searchParameters =>
            searchParameters.setIndex(value)
          );

          this.indices.push({
            label,
            index: value,
            helper: derivedHelper,
            results: undefined,
            hits: [],
          });

          // update results then trigger render after a search from any helper
          derivedHelper.on('result', results =>
            this.saveResults({ results, label })
          );
        });

        this.instantSearchInstance = instantSearchInstance;
        this.renderWithAllIndices({ isFirstRendering: true });
      },

      saveResults({ results, label }) {
        const derivedIndex = this.indices.find(i => i.label === label);

        if (
          widgetParams.escapeHits &&
          results.hits &&
          results.hits.length > 0
        ) {
          results.hits = escapeHits(results.hits);
        }

        derivedIndex.results = results;
        derivedIndex.hits = Array.isArray(results.hits) ? results.hits : [];

        this.renderWithAllIndices();
      },

      refine(helper) {
        return query => helper.setQuery(query).search();
      },

      render({ results }) {
        this.saveResults({ results, label: this.indices[0].label });
      },

      renderWithAllIndices({ isFirstRendering = false } = {}) {
        renderFn(
          {
            widgetParams,
            indices: this.indices,
            instantSearchInstance: this.instantSearchInstance,
            refine: this._refine,
          },
          isFirstRendering
        );
      },

      dispose() {
        // detach every derived indices from the main helper instance
        this.indices.slice(1).forEach(({ helper }) => helper.detach());

        unmountFn();
      },
    };
  };
}
