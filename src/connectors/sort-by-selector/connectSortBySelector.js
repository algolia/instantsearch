import {checkRendering} from '../../lib/utils.js';

/**
 * Instantiate a dropdown element to choose the current targeted index
 * @function connectSortBySelector
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {string} options.indices[0].name Name of the index to target
 * @param  {string} options.indices[0].label Label displayed in the dropdown
 * @return {Object}
 */
const usage = `Usage:
var customSortBySelector = connectSortBySelector(function render(params, isFirstRendering) {
  // params = {
  //   currentValue,
  //   options,
  //   setValue,
  //   nbHits,
  // }
});
search.addWidget(
  customSortBySelector({ indices })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectSortBySelector.html
`;
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
          nbHits: 0,
        }, true);
      },

      render({helper, results}) {
        renderFn({
          currentValue: helper.getIndex(),
          options: selectorOptions,
          setValue: this.setIndex,
          nbHits: results.nbHits,
        }, false);
      },
    };
  };
}
