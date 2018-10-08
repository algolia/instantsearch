import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import isArray from 'lodash/isArray';
import CurrentRefinedValues from '../../components/CurrentRefinedValues/CurrentRefinedValues.js';
import connectCurrentRefinedValues from '../../connectors/current-refined-values/connectCurrentRefinedValues.js';
import defaultTemplates from './defaultTemplates';
import { getContainerNode, prepareTemplateProps } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('CurrentRefinements');

const renderer = ({ containerNode, cssClasses, renderState, templates }) => (
  { attributes, refine, createURL, refinements, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const clearRefinementClicks = refinements.map(refinement =>
    refine.bind(null, refinement)
  );
  const clearRefinementURLs = refinements.map(refinement =>
    createURL(refinement)
  );

  render(
    <CurrentRefinedValues
      attributes={attributes}
      clearRefinementClicks={clearRefinementClicks}
      clearRefinementURLs={clearRefinementURLs}
      cssClasses={cssClasses}
      refinements={refinements}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
currentRefinedValues({
  container,
  [ includedAttributes: [{name[, label]}] ],
  [ excludedAttributes: [{name[, label]}] ],
  [ templates.{item} ],
  [ cssClasses.{root, list, item, label, category, categoryLabel, delete, reset} = {} ],
  [ transformItems ]
})`;

/**
 * @typedef {Object} CurrentRefinedValuesCSSClasses
 * @property {string} [root] CSS classes added to the root element.
 * @property {string} [list] CSS classes added to the list element.
 * @property {string} [item] CSS classes added to the item element.
 * @property {string} [label] CSS classes added to the label element.
 * @property {string} [category] CSS classes added to the category element.
 * @property {string} [categoryLabel] CSS classes added to the categoryLabel element.
 * @property {string} [delete] CSS classes added to the delete element.
 * @property {string} [reset] CSS classes added to the reset element.
 */

/**
 * @typedef {Object} CurrentRefinedValuesAttributes
 * @property {string} name Required attribute name.
 * @property {string} label Attribute label (passed to the item template).
 * @property {string|function(object):string} template Attribute specific template.
 */

/**
 * @typedef {Object} CurrentRefinedValuesTemplates
 * @property {string|function(object):string} [item] Item template.
 */

/**
 * @typedef {Object} CurrentRefinedValuesWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget
 * @property {CurrentRefinedValuesAttributes[]} [includedAttributes = []] Label definitions for the different filters to include.
 * @property {CurrentRefinedValuesAttributes[]} [excludedAttributes = []] Label definitions for the different filters to exclude.
 * @property {CurrentRefinedValuesTemplates} [templates] Templates to use for the widget.
 * @property {CurrentRefinedValuesCSSClasses} [cssClasses] CSS classes to be added.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * The current refined values widget has two purposes:
 *
 *  - give the user a synthetic view of the current filters.
 *  - give the user the ability to remove a filter.
 *
 * This widget is usually in the top part of the search UI.
 * @type {WidgetFactory}
 * @devNovel CurrentRefinedValues
 * @category clear-filter
 * @param {CurrentRefinedValuesWidgetOptions} $0 The CurrentRefinedValues widget options.
 * @returns {Object} A new CurrentRefinedValues widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.currentRefinedValues({
 *     container: '#current-refined-values',
 *     includedAttributes: [
 *       { name: 'free_shipping', label: 'Free shipping' },
 *       { name: 'price', label: 'Price' },
 *       { name: 'brand', label: 'Brand' },
 *       { name: 'category', label: 'Category' },
 *     ],
 *   })
 * );
 */
export default function currentRefinedValues({
  container,
  includedAttributes = [],
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
  transformItems,
}) {
  if (!container || !isArray(includedAttributes)) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    category: cx(suit({ descendantName: 'category' }), userCssClasses.category),
    categoryLabel: cx(
      suit({ descendantName: 'categoryLabel' }),
      userCssClasses.categoryLabel
    ),
    delete: cx(suit({ descendantName: 'delete' }), userCssClasses.delete),
    reset: cx(suit({ descendantName: 'reset' }), userCssClasses.reset),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  try {
    const makeWidget = connectCurrentRefinedValues(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({
      includedAttributes,
      transformItems,
    });
  } catch (error) {
    throw new Error(usage);
  }
}
