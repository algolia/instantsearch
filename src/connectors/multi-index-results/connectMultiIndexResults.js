import find from 'lodash/find';

import escapeHits, { tagConfig } from '../../lib/escape-highlight';
import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customMultiIndexResults = connectMultiIndexResults(function render(params, isFirstRendering) {
  // params = {
  //   indices,
  //   instantSearchInstance,
  //   widgetParams
  // }
});
search.addWidget(
  customMultiIndexResults({
    indices,
    [ escapeHits = false ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectMultiIndexResults.html
`;

/**
 * @typedef {Object} CustomMultiIndexResultsOptions
 * @property {MultiIndexResultsIndices[]} indices Additional indices to display results from.
 * @property {boolean} [escapeHits = false] If true, escape HTML tags from `hits[i]._highlightResult`.
 */

/**
 * **MultiIndexResults connector provides the logic to create custom widgets that will render results from different Algolia indices.
 * @type {Connector}
 * @param {function(MultiIndexResultsRenderingOptions, boolean)} renderFn Rendering function for the custom **MultiIndexResults** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomMultiIndexResultsOptions)} Re-usable widget factory for a custom **MultiIndexResults** widget.
 * @example
 * // custom `renderFn` to render the custom MultiIndexResults widget
 * function renderFn(MultiIndexResultsOptions) {
 *   MultiIndexResultsOptions.widgetParams.containerNode.html(
 *     MultiIndexResultsOptions.indices.map(function(index) {
 *       if (index.hits) {
 *         return index.hits.map(function(hit) {
 *           return '<div>' + hit._highlightResult.name.value + '</div>';
 *         })
 *       }
 *
 *       return 'No results for index ' + '<strong>' + index.label + '</strong>';
 *     })
 *   )
 * }
 *
 * // connect `renderFn` to Hits logic
 * var customMultiIndexResults = instantsearch
 *   .connectors.connectMultiIndexResults(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customMultiIndexResults({
 *     containerNode: $('#custom-multi-index-results-container'),
 *   })
 * );
 */
export default function connectMultiIndexResults(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { indices } = widgetParams;

    if (
      !indices ||
      !Array.isArray(indices) ||
      (Array.isArray(indices) && indices.length < 1)
    ) {
      throw new Error(usage);
    }

    return {
      getConfiguration() {
        return widgetParams.escapeHits ? tagConfig : undefined;
      },

      init({ instantSearchInstance, helper }) {
        // init `this.indices` with the default index
        this.indices = [
          {
            helper,
            label: 'default',
            index: helper.getIndex(),
            results: undefined,
          },
        ];

        // add additionnal indices intto `this.indices`
        indices.forEach(({ label, value }) => {
          const derivedHelper = helper.derive(searchParameters =>
            searchParameters.setIndex(value)
          );
          this.indices.push({
            label,
            index: value,
            helper: derivedHelper,
            results: undefined,
          });

          // after a derived index got results, update `this.indices[x].results`
          // and trigger a new render
          derivedHelper.on('result', results =>
            this.saveResults({ results, index: value })
          );
        });

        this.instantSearchInstance = instantSearchInstance;
        this.renderWithAllIndices({ isFirstRendering: true });
      },

      saveResults({ results, index }) {
        const derivedIndex = find(this.indices, { index });

        if (
          widgetParams.escapeHits &&
          results.hits &&
          results.hits.length > 0
        ) {
          results.hits = escapeHits(results.hits);
        }

        derivedIndex.results = results;
        derivedIndex.hits = results ? results.hits : undefined;

        this.renderWithAllIndices();
      },

      render({ results, instantSearchInstance }) {
        this.instantSearchInstance = instantSearchInstance;
        this.saveResults({ results, index: this.indices[0].index });
      },

      renderWithAllIndices({ isFirstRendering = false } = {}) {
        renderFn(
          {
            widgetParams,
            indices: this.indices,
            instantSearchInstance: this.instantSearchInstance,
          },
          isFirstRendering
        );
      },

      dispose() {
        unmountFn();
      },
    };
  };
}
