import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import isUndefined from 'lodash/isUndefined';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';
import reduce from 'lodash/reduce';

import CurrentRefinedValuesWithHOCs from '../../components/CurrentRefinedValues/CurrentRefinedValues.js';
import connectCurrentRefinedValues from '../../connectors/current-refined-values/connectCurrentRefinedValues.js';
import defaultTemplates from './defaultTemplates';

import {
  isDomElement,
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils.js';

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
}) => ({
  attributes,
  clearAllClick,
  clearAllURL,
  clearRefinement,
  createURL,
  refinements,
  instantSearchInstance,
}, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && refinements && refinements.length === 0;

  const clearRefinementClicks = refinements.map(refinement => clearRefinement.bind(null, refinement));
  const clearRefinementURLs = refinements.map(refinement => createURL(refinement));

  ReactDOM.render(
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
  [ collapsible=false ]
})`;

/**
 * Instantiate a list of current refinements with the possibility to clear them.
 * @function currentRefinedValues
 * @param {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param {Array} [$0.attributes = []] Attributes configuration
 * @param {string} $0.attributes[].name Required attribute name
 * @param {string} $0.attributes[].label Attribute label (passed to the item template)
 * @param {string|Function} $0.attributes[].template Attribute specific template
 * @param {Function} $0.attributes[].transformData Attribute specific transformData
 * @param {boolean} $0.onlyListedAttributes=false] Only use declared attributes
 * @param {boolean|string} [$0.clearAll='before'] Clear all position (one of ('before', 'after', false))
 * @param {Object} [$0.templates] Templates to use for the widget
 * @param {string|Function} [$0.templates.header] Header template
 * @param {string|Function} [$0.templates.item] Item template
 * @param {string|Function} [$0.templates.clearAll] Clear all template
 * @param {string|Function} [$0.templates.footer] Footer template
 * @param {Function} [$0.transformData] Object containing the transformData functions
 * @param {Function} [$0.transformData.item] Function to change the object passed to the `item` template
 * @param {boolean} [$0.autoHideContainer=true] Hide the container when no current refinements
 * @param {Object} [$0.cssClasses] CSS classes to be added
 * @param {string} [$0.cssClasses.root] CSS classes added to the root element
 * @param {string} [$0.cssClasses.header] CSS classes added to the header element
 * @param {string} [$0.cssClasses.body] CSS classes added to the body element
 * @param {string} [$0.cssClasses.clearAll] CSS classes added to the clearAll element
 * @param {string} [$0.cssClasses.list] CSS classes added to the list element
 * @param {string} [$0.cssClasses.item] CSS classes added to the item element
 * @param {string} [$0.cssClasses.link] CSS classes added to the link element
 * @param {string} [$0.cssClasses.count] CSS classes added to the count element
 * @param {string} [$0.cssClasses.footer] CSS classes added to the footer element
 * @param {object|boolean} [$0.collapsible=false] Hide the widget body and footer when clicking on header
 * @param {boolean} [$0.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @returns {Object} A currentRefinedValues widget instance
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
}) {
  const transformDataOK = isUndefined(transformData) ||
    isFunction(transformData) ||
    isPlainObject(transformData) && isFunction(transformData.item);

  const templatesKeys = ['header', 'item', 'clearAll', 'footer'];
  const templatesOK = isPlainObject(templates) &&
    reduce(
      templates,
      (res, val, key) =>
        res &&
          templatesKeys.indexOf(key) !== -1 &&
          (isString(val) || isFunction(val)),
      true
    );

  const userCssClassesKeys = ['root', 'header', 'body', 'clearAll', 'list', 'item', 'link', 'count', 'footer'];
  const userCssClassesOK = isPlainObject(userCssClasses) &&
    reduce(
      userCssClasses,
      (res, val, key) =>
        res &&
         userCssClassesKeys.indexOf(key) !== -1 &&
         isString(val) || isArray(val),
      true);

  const showUsage = false ||
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
    const makeCurrentRefinedValues = connectCurrentRefinedValues(specializedRenderer);
    return makeCurrentRefinedValues({attributes, onlyListedAttributes, clearAll});
  } catch (e) {
    throw new Error(usage);
  }
}
