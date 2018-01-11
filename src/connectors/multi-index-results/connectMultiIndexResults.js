import find from 'lodash/find';

import escapeHits, { tagConfig } from '../../lib/escape-highlight';
import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customMultiIndexResults = connectMultiIndexResults(function render(params, isFirstRendering) {
  // params = {
  //   derivedIndices,
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
        // init `this.derivedIndices` with the default index
        this.derivedIndices = [
          {
            helper,
            label: 'default',
            index: helper.getIndex(),
            results: undefined,
          },
        ];

        // add additionnal indices intto `this.derivedIndices`
        indices.forEach(({ label, value }) => {
          const derivedHelper = helper.derive(searchParameters =>
            searchParameters.setIndex(value)
          );
          this.derivedIndices.push({
            label,
            index: value,
            helper: derivedHelper,
            results: undefined,
          });

          // after a derived index got results, update `this.derivedIndices[x].results`
          // and trigger a new render
          derivedHelper.on('result', results =>
            this.saveResults({ results, index: value })
          );
        });

        this.instantSearchInstance = instantSearchInstance;
        this.renderWithAllIndices({ isFirstRendering: true });
      },

      saveResults({ results, index }) {
        const derivedIndex = find(this.derivedIndices, { index });

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
        this.saveResults({ results, index: this.derivedIndices[0].index });
      },

      renderWithAllIndices({ isFirstRendering = false } = {}) {
        renderFn(
          {
            widgetParams,
            derivedIndices: this.derivedIndices,
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
