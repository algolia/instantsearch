import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import Hits from '../../components/Hits.js';
import connectHits from '../../connectors/hits/connectHits.js';
import defaultTemplates from './defaultTemplates.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-hits');

const renderer = ({
  renderState,
  cssClasses,
  containerNode,
  transformData,
  templates,
}) => (
  { hits: receivedHits, results, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  render(
    <Hits
      cssClasses={cssClasses}
      hits={receivedHits}
      results={results}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
hits({
  container,
  [ cssClasses.{root, empty, item, panelRoot, panelHeader, panelBody, panelFooter}={} ],
  [ templates.{empty, item, panelHeader, panelFooter} | templates.{empty, allItems, panelHeader, panelFooter} ],
  [ transformData.{empty,item} | transformData.{empty, allItems} ],
})`;
/**
 * @typedef {Object} HitsCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapping element.
 * @property {string|string[]} [empty] CSS class to add to the wrapping element when no results.
 * @property {string|string[]} [item] CSS class to add to each result.
 * @property {string|string[]} [panelRoot] CSS class to add to the root panel element
 * @property {string|string[]} [panelHeader] CSS class to add to the header panel element
 * @property {string|string[]} [panelBody] CSS class to add to the body panel element
 * @property {string|string[]} [panelFooter] CSS class to add to the footer panel element
 */

/**
 * @typedef {Object} HitsTemplates
 * @property {string|function(object):string} [empty=''] Template to use when there are no results.
 * @property {string|function(object):string} [item=''] Template to use for each result. This template will receive an object containing a single record. The record will have a new property `__hitIndex` for the position of the record in the list of displayed hits.
 * @property {string|function(object):string} [allItems=''] Template to use for the list of all results. (Can't be used with `item` template). This template will receive a complete SearchResults result object, this object contains the key hits that contains all the records retrieved.
 * @property {string|function(object):string} [panelHeader=''] Template used for the header of the panel
 * @property {string|function(object):string} [panelFooter=''] Template used for the footer of the panel
 */

/**
 * @typedef {Object} HitsTransforms
 * @property {function(object):object} [empty] Method used to change the object passed to the `empty` template.
 * @property {function(object):object} [item] Method used to change the object passed to the `item` template.
 * @property {function(object):object} [allItems] Method used to change the object passed to the `allItems` template.
 */

/**
 * @typedef {Object} HitsWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {HitsTemplates} [templates] Templates to use for the widget.
 * @property {HitsTransforms} [transformData] Method to change the object passed to the templates.
 * @property {HitsCSSClasses} [cssClasses] CSS classes to add.
 * @property {boolean} [escapeHits = false] Escape HTML entities from hits string values.
 */

/**
 * Display the list of results (hits) from the current search.
 *
 * This is a traditional display of the hits. It has to be implemented
 * together with a pagination widget, to let the user browse the results
 * beyond the first page.
 * @type {WidgetFactory}
 * @devNovel Hits
 * @category basic
 * @param {HitsWidgetOptions} $0 Options of the Hits widget.
 * @return {Widget} A new instance of Hits widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.hits({
 *     container: '#hits-container',
 *     templates: {
 *       empty: 'No results',
 *       item: '<strong>Hit {{objectID}}</strong>: {{{_highlightResult.name.value}}}'
 *     },
 *     escapeHits: true,
 *   })
 * );
 */
export default function hits({
  container,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformData,
  escapeHits = false,
}) {
  if (!container) {
    throw new Error(`Must provide a container.${usage}`);
  }

  if (templates.item && templates.allItems) {
    throw new Error(`Must contain only allItems OR item template.${usage}`);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    empty: cx(bem(null, 'empty'), userCssClasses.empty),
    panelRoot: userCssClasses.panelRoot,
    panelHeader: userCssClasses.panelHeader,
    panelBody: userCssClasses.panelBody,
    panelFooter: userCssClasses.panelFooter,
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    transformData,
    templates,
  });

  try {
    const makeHits = connectHits(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeHits({ escapeHits });
  } catch (e) {
    throw new Error(usage);
  }
}
