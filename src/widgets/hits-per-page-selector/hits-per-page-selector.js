import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Selector from '../../components/Selector.js';
import connectHitsPerPageSelector from '../../connectors/hits-per-page-selector/connectHitsPerPageSelector.js';

import {
  bemHelper,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-hits-per-page-selector');

const renderer = ({
  containerNode,
  cssClasses,
  autoHideContainer,
}) => ({
  currentRefinement,
  options,
  refine,
  hasNoResults,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  ReactDOM.render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentRefinement}
      options={options}
      setValue={refine}
      shouldAutoHideContainer={autoHideContainer && hasNoResults}
    />,
    containerNode
  );
};

const usage = `Usage:
hitsPerPageSelector({
  container,
  options,
  [ cssClasses.{root,item}={} ],
  [ autoHideContainer=false ]
})`;

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @type {WidgetFactory}
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {Object[]} $0.options Array of objects defining the different values and labels
 * @param  {number} $0.options[0].value number of hits to display per page
 * @param  {string} $0.options[0].label Label to display in the option
 * @param  {boolean} [$0.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [$0.cssClasses] CSS classes to be added
 * @param  {string|string[]} [$0.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [$0.cssClasses.item] CSS classes added to each `<option>`
 * @return {Object} widget
 */
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
    return makeHitsPerPageSelector({options});
  } catch (e) {
    throw new Error(usage);
  }
}
