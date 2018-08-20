import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import isUndefined from 'lodash/isUndefined';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';
import reduce from 'lodash/reduce';

import CurrentRefinedValuesWithHOCs from '../../components/CurrentRefinedValues/CurrentRefinedValues';
import connectCurrentRefinedValues from '../../connectors/current-refined-values/connectCurrentRefinedValues';
import defaultTemplates from './defaultTemplates';

import {
  isDomElement,
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils';

const bem = bemHelper('ais-current-refined-values');

const renderer = ({
  autoHideContainer,
  clearAllPosition,
  collapsible,
  containerNode,
  cssClasses,
  renderState,
  transformData,
  templates,
}) => (
  {
    attributes,
    clearAllClick,
    clearAllURL,
    refine,
    createURL,
    refinements,
    instantSearchInstance,
  },
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

  const shouldAutoHideContainer =
    autoHideContainer && refinements && refinements.length === 0;

  const clearRefinementClicks = refinements.map(refinement =>
    refine.bind(null, refinement)
  );
  const clearRefinementURLs = refinements.map(refinement =>
    createURL(refinement)
  );

  render(
    <CurrentRefinedValuesWithHOCs
      attributes={attributes}
      clearAllClick={clearAllClick}
      clearAllPosition={clearAllPosition}
      clearAllURL={clearAllURL}
      clearRefinementClicks={clearRefinementClicks}
      clearRefinementURLs={clearRefinementURLs}
      collapsible={collapsible}
      cssClasses={cssClasses}
      refinements={refinements}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
currentRefinedValues({
  container,
  [ attributes: [{name[, label, template, transformData]}] ],
  [ onlyListedAttributes = false ],
  [ clearAll = 'before' ] // One of ['before', 'after', false]
  [ templates.{header,item,clearAll,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer = true ],
  [ cssClasses.{root, header, body, clearAll, list, item, link, count, footer} = {} ],
  [ collapsible = false ],
  [ clearsQuery = false ],
  [ transformItems ]
})`;

/**
 * @typedef {Object} CurrentRefinedValuesCSSClasses
 * @property {string} [root] CSS classes added to the root element.
 * @property {string} [header] CSS classes added to the header element.
 * @property {string} [body] CSS classes added to the body element.
 * @property {string} [clearAll] CSS classes added to the clearAll element.
 * @property {string} [list] CSS classes added to the list element.
 * @property {string} [item] CSS classes added to the item element.
 * @property {string} [link] CSS classes added to the link element.
 * @property {string} [count] CSS classes added to the count element.
 * @property {string} [footer] CSS classes added to the footer element.
 */

/**
 * @typedef {Object} CurrentRefinedValuesAttributes
 * @property {string} name Required attribute name.
 * @property {string} label Attribute label (passed to the item template).
 * @property {string|function(object):string} template Attribute specific template.
 * @property {function(object):object} transformData Attribute specific transformData.
 */

/**
 * @typedef {Object} CurrentRefinedValuesTemplates
 * @property {string|function(object):string} [header] Header template.
 * @property {string|function(object):string} [item] Item template.
 * @property {string|function(object):string} [clearAll] Clear all template.
 * @property {string|function(object):string} [footer] Footer template.
 */

/**
 * @typedef {Object} CurrentRefinedValuesTransforms
 * @property {function(object):object} [item] Method to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} CurrentRefinedValuesWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget
 * @property {CurrentRefinedValuesAttributes[]} [attributes = []] Label definitions for the
 * different filters.
 * @property {boolean} [onlyListedAttributes=false] Only use the declared attributes. By default, the widget
 * displays the refinements for the whole search state. If true, the list of attributes in `attributes` is used.
 * @property {'before'|'after'|boolean} [clearAll='before'] Defines the clear all button position.
 * By default, it is placed before the set of current filters. If the value is false, the button
 * won't be added in the widget.
 * @property {CurrentRefinedValuesTemplates} [templates] Templates to use for the widget.
 * @property {CurrentRefinedValuesTransforms} [transformData] Set of functions to transform
 * the data passed to the templates.
 * @property {boolean} [autoHideContainer=true] Hides the widget when there are no current refinements.
 * @property {CurrentRefinedValuesCSSClasses} [cssClasses] CSS classes to be added.
 * @property {boolean|{collapsed: boolean}} [collapsible=false] Makes the widget collapsible. The user can then
 * choose to hide the content of the widget. This option can also be an object with the property collapsed. If this
 * property is `true`, then the widget is hidden during the first rendering.
 * @property {boolean} [clearsQuery=false] If true, the clear all button also clears the active search query.
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
 *     clearAll: 'after',
 *     clearsQuery: true,
 *     attributes: [
 *       {name: 'free_shipping', label: 'Free shipping'},
 *       {name: 'price', label: 'Price'},
 *       {name: 'brand', label: 'Brand'},
 *       {name: 'category', label: 'Category'},
 *     ],
 *     onlyListedAttributes: true,
 *   })
 * );
 */
export default function currentRefinedValues({
  container,
  attributes = [],
  onlyListedAttributes = false,
  clearAll = 'before',
  templates = defaultTemplates,
  transformData,
  autoHideContainer = true,
  cssClasses: userCssClasses = {},
  collapsible = false,
  clearsQuery = false,
  transformItems,
}) {
  const transformDataOK =
    isUndefined(transformData) ||
    isFunction(transformData) ||
    (isPlainObject(transformData) && isFunction(transformData.item));

  const templatesKeys = ['header', 'item', 'clearAll', 'footer'];
  const templatesOK =
    isPlainObject(templates) &&
    reduce(
      templates,
      (res, val, key) =>
        res &&
        templatesKeys.indexOf(key) !== -1 &&
        (isString(val) || isFunction(val)),
      true
    );

  const userCssClassesKeys = [
    'root',
    'header',
    'body',
    'clearAll',
    'list',
    'item',
    'link',
    'count',
    'footer',
  ];
  const userCssClassesOK =
    isPlainObject(userCssClasses) &&
    reduce(
      userCssClasses,
      (res, val, key) =>
        (res && userCssClassesKeys.indexOf(key) !== -1 && isString(val)) ||
        isArray(val),
      true
    );

  const showUsage =
    false ||
    !(isString(container) || isDomElement(container)) ||
    !isArray(attributes) ||
    !isBoolean(onlyListedAttributes) ||
    [false, 'before', 'after'].indexOf(clearAll) === -1 ||
    !isPlainObject(templates) ||
    !templatesOK ||
    !transformDataOK ||
    !isBoolean(autoHideContainer) ||
    !userCssClassesOK;

  if (showUsage) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    clearAll: cx(bem('clear-all'), userCssClasses.clearAll),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    link: cx(bem('link'), userCssClasses.link),
    count: cx(bem('count'), userCssClasses.count),
    footer: cx(bem('footer'), userCssClasses.footer),
  };

  const specializedRenderer = renderer({
    containerNode,
    clearAllPosition: clearAll,
    collapsible,
    cssClasses,
    autoHideContainer,
    renderState: {},
    templates,
    transformData,
  });

  try {
    const makeCurrentRefinedValues = connectCurrentRefinedValues(
      specializedRenderer,
      () => unmountComponentAtNode(containerNode)
    );
    return makeCurrentRefinedValues({
      attributes,
      onlyListedAttributes,
      clearAll,
      clearsQuery,
      transformItems,
    });
  } catch (e) {
    throw new Error(usage);
  }
}
