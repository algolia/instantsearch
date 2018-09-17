import find from 'lodash/find';
import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customSortBy = connectSortBy(function render(params, isFirstRendering) {
  // params = {
  //   currentRefinement,
  //   options,
  //   refine,
  //   hasNoResults,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customSortBy({
    items,
    [ transformItems ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectSortBy.html
`;

/**
 * @typedef {Object} SortByItem
 * @property {string} name Name of the index to target.
 * @property {string} label Label to display for the targeted index.
 */

/**
 * @typedef {Object} CustomSortByWidgetOptions
 * @property {SortByItem[]} items Array of objects defining the different indices to choose from.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * @typedef {Object} SortByRenderingOptions
 * @property {string} currentRefinement The currently selected index.
 * @property {SortByItem[]} options All the available indices
 * @property {function(string)} refine Switches indices and triggers a new search.
 * @property {boolean} hasNoResults `true` if the last search contains no result.
 * @property {Object} widgetParams All original `CustomSortByWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * The **SortBy** connector provides the logic to build a custom widget that will display a
 * list of indices. With Algolia, this is most commonly used for changing ranking strategy. This allows
 * a user to change how the hits are being sorted.
 *
 * This connector provides the `refine` function that allows to switch indices.
 * The connector provides to the rendering: `refine()` to switch the current index and
 * `options` that are the values that can be selected. `refine` should be used
 * with `options.value`.
 * @type {Connector}
 * @param {function(SortByRenderingOptions, boolean)} renderFn Rendering function for the custom **SortBy** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomSortByWidgetOptions)} Re-usable widget factory for a custom **SortBy** widget.
 * @example
 * // custom `renderFn` to render the custom SortBy widget
 * function renderFn(SortByRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     SortByRenderingOptions.widgetParams.containerNode.html('<select></select>');
 *     SortByRenderingOptions.widgetParams.containerNode
 *       .find('select')
 *       .on('change', function(event) {
 *         SortByRenderingOptions.refine(event.target.value);
 *       });
 *   }
 *
 *   var optionsHTML = SortByRenderingOptions.options.map(function(option) {
 *     return `
 *       <option
 *         value="${option.value}"
 *         ${SortByRenderingOptions.currentRefinement === option.value ? 'selected' : ''}
 *       >
 *         ${option.label}
 *       </option>
 *     `;
 *   });
 *
 *   SortByRenderingOptions.widgetParams.containerNode
 *     .find('select')
 *     .html(optionsHTML);
 * }
 *
 * // connect `renderFn` to SortBy logic
 * var customSortBy = instantsearch.connectors.connectSortBy(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customSortBy({
 *     containerNode: $('#custom-sort-by-container'),
 *     items: [
 *       {name: 'instant_search', label: 'Most relevant'},
 *       {name: 'instant_search_price_asc', label: 'Lowest price'},
 *       {name: 'instant_search_price_desc', label: 'Highest price'},
 *     ],
 *   })
 * );
 */
export default function connectSortBy(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { items, transformItems = x => x } = widgetParams;

    if (!items) {
      throw new Error(usage);
    }

    const selectorOptions = items.map(({ label, name }) => ({
      label,
      value: name,
    }));

    return {
      init({ helper, instantSearchInstance }) {
        const currentIndex = helper.getIndex();
        const isIndexInList = find(items, ({ name }) => name === currentIndex);

        if (!isIndexInList) {
          throw new Error(
            `[sortBy]: Index ${currentIndex} not present in \`items\``
          );
        }

        this.initialIndex = instantSearchInstance.indexName;
        this.setIndex = indexName => helper.setIndex(indexName).search();

        renderFn(
          {
            currentRefinement: currentIndex,
            options: transformItems(selectorOptions),
            refine: this.setIndex,
            hasNoResults: true,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ helper, results, instantSearchInstance }) {
        renderFn(
          {
            currentRefinement: helper.getIndex(),
            options: transformItems(selectorOptions),
            refine: this.setIndex,
            hasNoResults: results.nbHits === 0,
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();
        return state.setIndex(this.initialIndex);
      },

      getWidgetState(uiState, { searchParameters }) {
        const currentIndex = searchParameters.getQueryParameter('index');
        const isInitialIndex = currentIndex === this.initialIndex;

        if (isInitialIndex || (uiState && uiState.sortBy === currentIndex)) {
          return uiState;
        }

        return {
          ...uiState,
          sortBy: searchParameters.getQueryParameter('index'),
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameter(
          'index',
          uiState.sortBy || this.initialIndex
        );
      },
    };
  };
}
