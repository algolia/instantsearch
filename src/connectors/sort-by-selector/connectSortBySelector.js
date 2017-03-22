import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customSortBySelector = connectSortBySelector(function render(params, isFirstRendering) {
  // params = {
  //   currentValue,
  //   options,
  //   setValue,
  //   hasNoResults,
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
 * @property {string} currentValue
 * @property {Object[]} options
 * @property {function} setValue
 * @property {boolean} hasNoResults
 */

 /**
  * Connects a rendering function with the sort by selector business logic.
  * @param {function(SortBySelectorRenderingOptions)} renderFn function that renders the sort by selector widget
  * @return {function(CustomSortBySelectorWidgetOptions)} a widget factory for sort by selector widget
  */
export default function connectSortBySelector(renderFn) {
  checkRendering(renderFn, usage);

  return ({indices}) => {
    if (!indices) {
      throw new Error(usage);
    }

    const selectorOptions = indices.map(({label, name}) => ({label, value: name}));

    return {
      init({helper}) {
        const currentIndex = helper.getIndex();
        const isIndexInList = indices.find(({name}) => name === currentIndex);

        if (!isIndexInList) {
          throw new Error(`[sortBySelector]: Index ${currentIndex} not present in \`indices\``);
        }

        this.setIndex = indexName => helper
          .setIndex(indexName)
          .search();

        renderFn({
          currentValue: currentIndex,
          options: selectorOptions,
          setValue: this.setIndex,
          hasNoResults: true,
        }, true);
      },

      render({helper, results}) {
        renderFn({
          currentValue: helper.getIndex(),
          options: selectorOptions,
          setValue: this.setIndex,
          hasNoResults: results.nbHits === 0,
        }, false);
      },
    };
  };
}
