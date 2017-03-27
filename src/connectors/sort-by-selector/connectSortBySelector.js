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
 * @typedef {Object} CustomSortBySelectorWidgetOptions
 * @param {Object[]} indices Array of objects defining the different indices to choose from.
 * @param {string} indices[].name Name of the index to target
 * @param {string} indices[].label Label displayed in the dropdown
 */

/**
 * @typedef {Object} SortBySelectorRenderingOptions
 * @property {string} currentRefinement the currently selected index
 * @property {Object[]} options all the available indices
 * @property {function} refine switch indices and do a new search
 * @property {boolean} hasNoResults a boolean that indicates if there were no results during that last search
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

 /**
  * Connects a rendering function with the sort by selector business logic.
  * @param {function(SortBySelectorRenderingOptions, boolean)} renderFn function that renders the sort by selector widget
  * @return {function(CustomSortBySelectorWidgetOptions)} a widget factory for sort by selector widget
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
