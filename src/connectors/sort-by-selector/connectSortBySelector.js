import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customSortBySelector = connectSortBySelector(function render(params, isFirstRendering) {
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
  customSortBySelector({ indices })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectSortBySelector.html
`;

/**
 * @typedef {Object} SortBySelectorIndices
 * @property {string} name Name of the index to target.
 * @property {string} label Label to display for the targettded index.
 */

/**
 * @typedef {Object} CustomSortBySelectorWidgetOptions
 * @property {SortBySelectorIndices[]} indices Array of objects defining the different indices to choose from.
 */

/**
 * @typedef {Object} SortBySelectorRenderingOptions
 * @property {string} currentRefinement The currently selected index.
 * @property {SortBySelectorIndices[]} options All the available indices
 * @property {function(option.value)} refine Switch indices and trigger a new search.
 * @property {boolean} hasNoResults Indicates if there were no results during that last search.
 * @property {Object} widgetParams All original `CustomSortBySelectorWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * The **SortBySelector** connector provides the logic to build a custom widget that will display a list of indices. This allows a user to change how the hits are being sorted.
 * @type {Connector}
 * @param {function(SortBySelectorRenderingOptions, boolean)} renderFn Rendering function for the custom **SortBySelector** widget.
 * @return {function(CustomSortBySelectorWidgetOptions)} Re-usable widget factory for a custom **SortBySelector** widget.
 * @example
 * // custom `renderFn` to render the custom SortBySelector widget
 * function renderFn(SortBySelectorRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     SortBySelectorRenderingOptions.widgetParams.containerNode.html('<select></select>');
 *     SortBySelectorRenderingOptions.widgetParams.containerNode
 *       .find('select')
 *       .on('change', function(event) {
 *         SortBySelectorRenderingOptions.refine(event.target.value);
 *       });
 *   }
 *
 *   var optionsHTML = SortBySelectorRenderingOptions.options.map(function(option) {
 *     return '<option value="' + option.value + '"' +
 *       SortBySelectorRenderingOptions.currentRefinement === option.value ? ' selected' : '' +
 *       '>' + option.label + '</option>';
 *   });
 *
 *   SortBySelectorRenderingOptions.widgetParams.containerNode
 *     .find('select')
 *     .html(optionsHTML);
 * }
 *
 * // connect `renderFn` to SortBySelector logic
 * var customSortBySelector = instantsearch.connectors.connectSortBySelector(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customSortBySelector({
 *     containerNode: $('#custom-sortby-selector-container'),
 *     indices: [
 *       {name: 'instant_search', label: 'Most relevant'},
 *       {name: 'instant_search_price_asc', label: 'Lowest price'},
 *       {name: 'instant_search_price_desc', label: 'Highest price'},
 *     ],
 *   })
 * );
 */
export default function connectSortBySelector(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {indices} = widgetParams;

    if (!indices) {
      throw new Error(usage);
    }

    const selectorOptions = indices.map(({label, name}) => ({label, value: name}));

    return {
      init({helper, instantSearchInstance}) {
        const currentIndex = helper.getIndex();
        const isIndexInList = indices.find(({name}) => name === currentIndex);

        if (!isIndexInList) {
          throw new Error(`[sortBySelector]: Index ${currentIndex} not present in \`indices\``);
        }

        this.setIndex = indexName => helper
          .setIndex(indexName)
          .search();

        renderFn({
          currentRefinement: currentIndex,
          options: selectorOptions,
          refine: this.setIndex,
          hasNoResults: true,
          widgetParams,
          instantSearchInstance,
        }, true);
      },

      render({helper, results, instantSearchInstance}) {
        renderFn({
          currentRefinement: helper.getIndex(),
          options: selectorOptions,
          refine: this.setIndex,
          hasNoResults: results.nbHits === 0,
          widgetParams,
          instantSearchInstance,
        }, false);
      },
    };
  };
}
