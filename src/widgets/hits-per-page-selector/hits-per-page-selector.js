import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import find from 'lodash/find';

import Selector from '../../components/Selector';
import connectHitsPerPage from '../../connectors/hits-per-page/connectHitsPerPage';

import { bemHelper, getContainerNode } from '../../lib/utils';

const bem = bemHelper('ais-hits-per-page-selector');

const renderer = ({ containerNode, cssClasses, autoHideContainer }) => (
  { items, refine, hasNoResults },
  isFirstRendering
) => {
  if (isFirstRendering) return;

  const { value: currentValue } =
    find(items, ({ isRefined }) => isRefined) || {};

  render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentValue}
      options={items}
      setValue={refine}
      shouldAutoHideContainer={autoHideContainer && hasNoResults}
    />,
    containerNode
  );
};

const usage = `Usage:
hitsPerPageSelector({
  container,
  items,
  [ cssClasses.{root,select,item}={} ],
  [ autoHideContainer=false ]
})`;

/**
 * @typedef {Object} HitsPerPageSelectorCSSClasses
 * @property {string|string[]} [root] CSS classes added to the outer `<div>`.
 * @property {string|string[]} [select] CSS classes added to the parent `<select>`.
 * @property {string|string[]} [item] CSS classes added to each `<option>`.
 */

/**
 * @typedef {Object} HitsPerPageSelectorItems
 * @property {number} value number of hits to display per page.
 * @property {string} label Label to display in the option.
 * @property {boolean} default The default hits per page on first search.
 */

/**
 * @typedef {Object} HitsPerPageSelectorWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {HitsPerPageSelectorItems[]} items Array of objects defining the different values and labels.
 * @property {boolean} [autoHideContainer=false] Hide the container when no results match.
 * @property {HitsPerPageSelectorCSSClasses} [cssClasses] CSS classes to be added.
 */

/**
 * The hitsPerPageSelector widget gives the user the ability to change the number of results
 * displayed in the hits widget.
 *
 * You can specify the default hits per page using a boolean in the items[] array. If none is specified, this first hits per page option will be picked.
 * @type {WidgetFactory}
 * @devNovel HitsPerPageSelector
 * @category basic
 * @param {HitsPerPageSelectorWidgetOptions} $0 The options of the HitPerPageSelector widget.
 * @return {Widget} A new instance of the HitPerPageSelector widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.hitsPerPageSelector({
 *     container: '#hits-per-page-selector',
 *     items: [
 *       {value: 3, label: '3 per page', default: true},
 *       {value: 6, label: '6 per page'},
 *       {value: 12, label: '12 per page'},
 *     ]
 *   })
 * );
 */
export default function hitsPerPageSelector({
  container,
  items,
  cssClasses: userCssClasses = {},
  autoHideContainer = false,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    // We use the same class to avoid regression on existing website. It needs to be replaced
    // eventually by `bem('select')
    select: cx(bem(null), userCssClasses.select),
    item: cx(bem('item'), userCssClasses.item),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    autoHideContainer,
  });

  try {
    const makeHitsPerPageSelector = connectHitsPerPage(
      specializedRenderer,
      () => unmountComponentAtNode(containerNode)
    );
    return makeHitsPerPageSelector({ items });
  } catch (e) {
    throw new Error(usage);
  }
}
