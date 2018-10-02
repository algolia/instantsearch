import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import connectHits from '../../connectors/hits/connectHits.js';
import Hits from '../../components/Hits.js';
import defaultTemplates from './defaultTemplates.js';
import { prepareTemplateProps, getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('Hits');

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
  [ transformItems ],
  [ cssClasses.{root, emptyRoot, item} ],
  [ templates.{empty, item} ],
  [ transformData.{empty, item} ],
})`;

/**
 * @typedef {Object} HitsCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapping element.
 * @property {string|string[]} [emptyRoot] CSS class to add to the wrapping element when no results.
 * @property {string|string[]} [list] CSS class to add to the list of results.
 * @property {string|string[]} [item] CSS class to add to each result.
 */

/**
 * @typedef {Object} HitsTemplates
 * @property {string|function(object):string} [empty=''] Template to use when there are no results.
 * @property {string|function(object):string} [item=''] Template to use for each result. This template will receive an object containing a single record. The record will have a new property `__hitIndex` for the position of the record in the list of displayed hits.
 */

/**
 * @typedef {Object} HitsTransforms
 * @property {function(object):object} [empty] Method used to change the object passed to the `empty` template.
 * @property {function(object):object} [item] Method used to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} HitsWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {HitsTemplates} [templates] Templates to use for the widget.
 * @property {HitsTransforms} [transformData] Method to change the object passed to the templates.
 * @property {HitsCSSClasses} [cssClasses] CSS classes to add.
 * @property {boolean} [escapeHTML = true] Escape HTML entities from hits string values.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
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
 *     transformItems: items => items.map(item => item),
 *   })
 * );
 */
export default function hits({
  container,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformData,
  escapeHTML = true,
  transformItems,
}) {
  if (!container) {
    throw new Error(`Must provide a container.${usage}`);
  }

  if (templates.item && templates.allItems) {
    throw new Error(`Must contain only allItems OR item template.${usage}`);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
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
    return makeHits({ escapeHTML, transformItems });
  } catch (error) {
    throw new Error(usage);
  }
}
