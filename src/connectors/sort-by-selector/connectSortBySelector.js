import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import {
  bemHelper,
  getContainerNode,
} from '../../lib/utils.js';
import cx from 'classnames';

const bem = bemHelper('ais-sort-by-selector');
/**
 * Instantiate a dropdown element to choose the current targeted index
 * @function sortBySelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {string} options.indices[0].name Name of the index to target
 * @param  {string} options.indices[0].label Label displayed in the dropdown
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each <option>
 * @return {Object}
 */
const usage = `Usage:
sortBySelector({
  container,
  indices,
  [cssClasses.{root,item}={}],
  [autoHideContainer=false]
})`;
const connectSortBySelector = sortBySelectorRendering => ({
    container,
    indices,
    cssClasses: userCssClasses = {},
    autoHideContainer = false,
  } = {}) => {
  if (!container || !indices) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const selectorOptions = map(
    indices,
    index => ({label: index.label, value: index.name})
  );

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
  };

  return {
    init({helper}) {
      const currentIndex = helper.getIndex();
      const isIndexInList = findIndex(indices, {name: currentIndex}) !== -1;
      if (!isIndexInList) {
        throw new Error(`[sortBySelector]: Index ${currentIndex} not present in \`indices\``);
      }
      this.setIndex = indexName => helper
        .setIndex(indexName)
        .search();

      sortBySelectorRendering({
        cssClasses,
        currentValue: helper.getIndex(),
        options: selectorOptions,
        setValue: this.setIndex,
        shouldAutoHideContainer: autoHideContainer,
        containerNode,
      }, true);
    },

    render({helper, results}) {
      sortBySelectorRendering({
        cssClasses,
        currentValue: helper.getIndex(),
        options: selectorOptions,
        setValue: this.setIndex,
        shouldAutoHideContainer: autoHideContainer && results.nbHits === 0,
        containerNode,
      }, false);
    },
  };
};

export default connectSortBySelector;
