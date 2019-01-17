import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import find from 'lodash/find';
import Selector from '../../components/Selector/Selector';
import connectHitsPerPage from '../../connectors/hits-per-page/connectHitsPerPage';
import { getContainerNode } from '../../lib/utils';
import { component } from '../../lib/suit';

const suit = component('HitsPerPage');

const renderer = ({ containerNode, cssClasses }) => (
  { items, refine },
  isFirstRendering
) => {
  if (isFirstRendering) return;

  const { value: currentValue } =
    find(items, ({ isRefined }) => isRefined) || {};

  render(
    <div className={cssClasses.root}>
      <Selector
        cssClasses={cssClasses}
        currentValue={currentValue}
        options={items}
        setValue={refine}
      />
    </div>,
    containerNode
  );
};

const usage = `Usage:
hitsPerPage({
  container,
  items,
  [ cssClasses.{root, select, option} ],
  [ transformItems ]
})`;

/**
 * @typedef {Object} HitsPerPageCSSClasses
 * @property {string|string[]} [root] CSS classes added to the outer `<div>`.
 * @property {string|string[]} [select] CSS classes added to the parent `<select>`.
 * @property {string|string[]} [option] CSS classes added to each `<option>`.
 */

/**
 * @typedef {Object} HitsPerPageItems
 * @property {number} value number of hits to display per page.
 * @property {string} label Label to display in the option.
 * @property {boolean} default The default hits per page on first search.
 */

/**
 * @typedef {Object} HitsPerPageWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {HitsPerPageItems[]} items Array of objects defining the different values and labels.
 * @property {HitsPerPageCSSClasses} [cssClasses] CSS classes to be added.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * The hitsPerPage widget gives the user the ability to change the number of results
 * displayed in the hits widget.
 *
 * You can specify the default hits per page using a boolean in the items[] array. If none is specified, this first hits per page option will be picked.
 * @type {WidgetFactory}
 * @devNovel HitsPerPage
 * @category basic
 * @param {HitsPerPageWidgetOptions} $0 The options of the HitPerPageSelector widget.
 * @return {Widget} A new instance of the HitPerPageSelector widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.hitsPerPage({
 *     container: '#hits-per-page',
 *     items: [
 *       {value: 3, label: '3 per page', default: true},
 *       {value: 6, label: '6 per page'},
 *       {value: 12, label: '12 per page'},
 *     ]
 *   })
 * );
 */
export default function hitsPerPage({
  container,
  items,
  cssClasses: userCssClasses = {},
  transformItems,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    select: cx(suit({ descendantName: 'select' }), userCssClasses.select),
    option: cx(suit({ descendantName: 'option' }), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  try {
    const makeHitsPerPage = connectHitsPerPage(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeHitsPerPage({ items, transformItems });
  } catch (error) {
    throw new Error(usage);
  }
}
