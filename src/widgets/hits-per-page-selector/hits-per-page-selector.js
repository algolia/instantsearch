import React from 'react';
import ReactDOM from 'react-dom';

import {
  bemHelper,
  getContainerNode,
} from '../../lib/utils.js';
import cx from 'classnames';

const bem = bemHelper('ais-hits-per-page-selector');

import Selector from '../../components/Selector.js';

import connectHitsPerPageSelector from '../../connectors/hits-per-page-selector/connectHitsPerPageSelector.js';

const renderer = ({
  containerNode,
  cssClasses,
  autoHideContainer,
}) => ({
  currentValue,
  options,
  setValue,
  hasNoResults,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  ReactDOM.render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentValue}
      options={options}
      setValue={setValue}
      shouldAutoHideContainer={autoHideContainer && hasNoResults}
    />,
    containerNode
  );
};

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function hitsPerPageSelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[0].value number of hits to display per page
 * @param  {string} options.options[0].label Label to display in the option
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<option>`
 * @return {Object}
 */

const usage = `Usage:
hitsPerPageSelector({
  container,
  options,
  [ cssClasses.{root,item}={} ],
  [ autoHideContainer=false ]
})`;

export default function hitsPerPageSelector({
  container,
  options,
  cssClasses: userCssClasses = {},
  autoHideContainer = false,
} = {}) {
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
    const makeHitsPerPageSelector = connectHitsPerPageSelector(specializedRenderer);
    return makeHitsPerPageSelector({
      options,
    });
  } catch (e) {
    throw new Error(usage);
  }
}
