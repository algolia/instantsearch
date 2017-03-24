import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Selector from '../../components/Selector.js';
import connectSortBySelector from '../../connectors/sort-by-selector/connectSortBySelector.js';
import {bemHelper, getContainerNode} from '../../lib/utils.js';

const bem = bemHelper('ais-sort-by-selector');

const renderer = ({
  containerNode,
  cssClasses,
  autoHideContainer,
}) => ({
  currentValue,
  options,
  refine,
  hasNoResults,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  const shouldAutoHideContainer = autoHideContainer && hasNoResults;

  ReactDOM.render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentValue}
      options={options}
      setValue={refine}
      shouldAutoHideContainer={shouldAutoHideContainer}
    />,
    containerNode
  );
};

const usage = `Usage:
sortBySelector({
  container,
  indices,
  [cssClasses.{root,item}={}],
  [autoHideContainer=false]
})`;

/**
 * Instantiate a dropdown element to choose the current targeted index
 * @function sortBySelector
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} $0.indices Array of objects defining the different indices to choose from.
 * @param  {string} $0.indices[i].name Name of the index to target
 * @param  {string} $0.indices[i].label Label displayed in the dropdown
 * @param  {boolean} [$0.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [$0.cssClasses] CSS classes to be added
 * @param  {string|string[]} [$0.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string|string[]} [$0.cssClasses.item] CSS classes added to each <option>
 * @return {Object} widget
 */
export default function sortBySelector({
  container,
  indices,
  cssClasses: userCssClasses = {},
  autoHideContainer = false,
}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    autoHideContainer,
  });

  try {
    const makeWidget = connectSortBySelector(specializedRenderer);
    return makeWidget({indices});
  } catch (e) {
    throw new Error(usage);
  }
}
