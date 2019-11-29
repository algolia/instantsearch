import {
  checkRendering,
  createDocumentationMessageGenerator,
  find,
  warning,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'sort-by',
  connector: true,
});

/**
 * @typedef {Object} SortByItem
 * @property {string} value The name of the index to target.
 * @property {string} label The label of the index to display.
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
 * search.addWidgets([
 *   customSortBy({
 *     containerNode: $('#custom-sort-by-container'),
 *     items: [
 *       { value: 'instant_search', label: 'Most relevant' },
 *       { value: 'instant_search_price_asc', label: 'Lowest price' },
 *       { value: 'instant_search_price_desc', label: 'Highest price' },
 *     ],
 *   })
 * ]);
 */
export default function connectSortBy(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { items, transformItems = x => x } = widgetParams;

    if (!Array.isArray(items)) {
      throw new Error(
        withUsage('The `items` option expects an array of objects.')
      );
    }

    return {
      $$type: 'ais.sortBy',

      init({ helper, instantSearchInstance, parent }) {
        const currentIndex = helper.state.index;
        const isCurrentIndexInItems = find(
          items,
          item => item.value === currentIndex
        );

        this.initialIndex = parent.getIndexName();
        this.setIndex = indexName => {
          helper.setIndex(indexName).search();
        };

        warning(
          isCurrentIndexInItems,
          `The index named "${currentIndex}" is not listed in the \`items\` of \`sortBy\`.`
        );

        renderFn(
          {
            currentRefinement: currentIndex,
            options: transformItems(items),
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
            currentRefinement: helper.state.index,
            options: transformItems(items),
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
        const currentIndex = searchParameters.index;
        const isInitialIndex = currentIndex === this.initialIndex;

        if (isInitialIndex) {
          return uiState;
        }

        return {
          ...uiState,
          sortBy: currentIndex,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameter(
          'index',
          uiState.sortBy || this.initialIndex || searchParameters.index
        );
      },
    };
  };
}
