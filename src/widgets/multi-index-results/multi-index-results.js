import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import MultiIndexResults from '../../components/MultiIndexResults';
import connectMultiIndexResults from '../../connectors/multi-index-results/connectMultiIndexResults';
import defaultTemplates from './defaultTemplates';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils';

const bem = bemHelper('ais-multi-index-results');

const renderer = ({
  renderState,
  cssClasses,
  containerNode,
  transformData,
  templates,
}) => ({ derivedIndices, instantSearchInstance }, isFirstRendering) => {
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
    <MultiIndexResults
      cssClasses={cssClasses}
      derivedIndices={derivedIndices}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
multiIndexResults({
  container,
  indices,
  [ escapeHits = false ],
  [ cssClasses.{root,empty,item}={} ],
  [ templates.{empty,item} | templates.{empty, allItems} ],
})
`;

/**
 * @typedef {Object} MultiIndexResultsIndices
 * @property {string} label Label of the additional index.
 * @property {string} value Algolia index name.
 */

/**
 * @typedef {Object} MultiIndexResultsCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [empty] CSS class to add to the wrapping element when no results.
 * @property {string|string[]} [item] CSS class to add to each result.
 */

/**
 * @typedef {Object} MultiIndexResultsTemplates
 * @property {string|function(object):string} [empty=''] Template to use when there are no results.
 * @property {string|function(object):string} [item=''] Template to use for each result. This template will receive an object containing a single record. The record will have a new property `__hitIndex` for the position of the record in the list of displayed hits.
 * @property {string|function(object):string} [allItems=''] Template to use for the list of all results. (Can't be used with `item` template). This template will receive a complete SearchResults result object, this object contains the key hits that contains all the records retrieved.
 */

/**
 * @typedef {Object} MultiIndexResultsWidgetOptions
 * @property {string|HTMLElement} container CSS Selector of HTMLElement to insert the widget.
 * @property {MultiIndexResultsIndices[]} indices Additional indices to display results from.
 * @property {MultiIndexResultsCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {MultiIndexResultsTemplates} [templates] Templates to use for the widget.
 */

/**
 * Create a widget displaying results for different indices
 * @type {WidgetFactory}
 * @category basic
 * @param {MultiIndexResultsWidgetOptions} $0 The Multi index results widget options.
 * @return {Widget} Creates a new instance of the Multi index widget
 * @example
 * search.addWidget(
 *   instantsearch.widgets.multiIndexResults({
 *     conntainer: '#categories-multiIndexResults',
 *     indices: [{ label: 'Lowest price', value: 'instant_search_price_asc' }]
 *   })
 * )
 */
export default function multiIndexResults({
  container,
  cssClasses: userCssClasses = {},
  transformData,
  indices,
  escapeHits = false,
}) {
  if (!container) {
    throw new Error(`Must provide a container.${usage}`);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    empty: cx(bem(null, 'empty'), userCssClasses.empty),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    transformData,
  });

  try {
    const makeMultiIndexResults = connectMultiIndexResults(
      specializedRenderer,
      () => unmountComponentAtNode(containerNode)
    );
    return makeMultiIndexResults({ indices, escapeHits });
  } catch (e) {
    throw new Error(usage);
  }
}
