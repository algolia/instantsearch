import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import find from 'lodash/find';

import Selector from '../../components/Selector.js';
import connectHitsPerPage from '../../connectors/hits-per-page/connectHitsPerPage.js';

import defaultTemplates from './defaultTemplates.js';

import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils.js';

const bem = bemHelper('ais-hits-per-page-selector');

const renderer = ({
  renderState = {},
  containerNode,
  cssClasses,
  autoHideContainer,
  templates,
}) => (
  { items, refine, hasNoResults, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData: {},
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const { value: currentValue } =
    find(items, ({ isRefined }) => isRefined) || {};

  render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentValue}
      options={items}
      setValue={refine}
      shouldAutoHideContainer={autoHideContainer && hasNoResults}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
hitsPerPageSelector({
  container,
  items,
  [ cssClasses.{select, item, panelRoot, panelHeader, panelBody, panelFooter}={} ],
  [ templates.{panelHeader, panelFooter}]
  [ autoHideContainer=false ]
})`;

/**
 * @typedef {Object} HitsPerPageSelectorCSSClasses
 * @property {string|string[]} [select] CSS classes added to the parent `<select>`.
 * @property {string|string[]} [item] CSS classes added to each `<option>`.
 * @property {string|string[]} [panelRoot] CSS class to add to the root panel element
 * @property {string|string[]} [panelHeader] CSS class to add to the header panel element
 * @property {string|string[]} [panelBody] CSS class to add to the body panel element
 * @property {string|string[]} [panelFooter] CSS class to add to the footer panel element
 */

/**
 * @typedef {Object} HitsPerPageTemplates
 * @property {string|function(object):string} [panelHeader=''] Template used for the header of the panel.
 * @property {string|function(object):string} [panelFooter=''] Template used for the footer of the panel.
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
 * @property {HitsPerPageTemplates} [templates] Templates used to customize the widget.
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
  templates = defaultTemplates,
  autoHideContainer = false,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    select: cx(bem(null), userCssClasses.select),
    item: cx(bem('item'), userCssClasses.item),
    panelRoot: userCssClasses.panelRoot,
    panelHeader: userCssClasses.panelHeader,
    panelBody: userCssClasses.panelBody,
    panelFooter: userCssClasses.panelFooter,
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    autoHideContainer,
    templates,
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
