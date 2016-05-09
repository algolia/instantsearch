import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  isDomElement,
  getContainerNode,
  prepareTemplateProps,
  getRefinements,
  clearRefinementsFromState,
  clearRefinementsAndSearch
} from '../../lib/utils.js';
import cx from 'classnames';
import isUndefined from 'lodash/lang/isUndefined';
import isBoolean from 'lodash/lang/isBoolean';
import isString from 'lodash/lang/isString';
import isArray from 'lodash/lang/isArray';
import isPlainObject from 'lodash/lang/isPlainObject';
import isFunction from 'lodash/lang/isFunction';
import isEmpty from 'lodash/lang/isEmpty';
import map from 'lodash/collection/map';
import reduce from 'lodash/collection/reduce';
import filter from 'lodash/collection/filter';
import headerFooterHOC from '../../decorators/headerFooter.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer';
import defaultTemplates from './defaultTemplates';
import CurrentRefinedValuesComponent from '../../components/CurrentRefinedValues/CurrentRefinedValues.js';

let bem = bemHelper('ais-current-refined-values');

/**
 * Instantiate a list of current refinements with the possibility to clear them
 * @function currentRefinedValues
 * @param  {string|DOMElement}  options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array}             [option.attributes] Attributes configuration
 * @param  {string}            [option.attributes[].name] Required attribute name
 * @param  {string}            [option.attributes[].label] Attribute label (passed to the item template)
 * @param  {string|Function}   [option.attributes[].template] Attribute specific template
 * @param  {Function}          [option.attributes[].transformData] Attribute specific transformData
 * @param  {boolean|string}    [option.clearAll='before'] Clear all position (one of ('before', 'after', false))
 * @param  {boolean}           [options.onlyListedAttributes=false] Only use declared attributes
 * @param  {Object}            [options.templates] Templates to use for the widget
 * @param  {string|Function}   [options.templates.header] Header template
 * @param  {string|Function}   [options.templates.item] Item template
 * @param  {string|Function}   [options.templates.clearAll] Clear all template
 * @param  {string|Function}   [options.templates.footer] Footer template
 * @param  {Function}          [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean}           [options.autoHideContainer=true] Hide the container when no current refinements
 * @param  {Object}            [options.cssClasses] CSS classes to be added
 * @param  {string}            [options.cssClasses.root] CSS classes added to the root element
 * @param  {string}            [options.cssClasses.header] CSS classes added to the header element
 * @param  {string}            [options.cssClasses.body] CSS classes added to the body element
 * @param  {string}            [options.cssClasses.clearAll] CSS classes added to the clearAll element
 * @param  {string}            [options.cssClasses.list] CSS classes added to the list element
 * @param  {string}            [options.cssClasses.item] CSS classes added to the item element
 * @param  {string}            [options.cssClasses.link] CSS classes added to the link element
 * @param  {string}            [options.cssClasses.count] CSS classes added to the count element
 * @param  {string}            [options.cssClasses.footer] CSS classes added to the footer element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
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
function currentRefinedValues({
    container,
    attributes = [],
    onlyListedAttributes = false,
    clearAll = 'before',
    templates = defaultTemplates,
    collapsible = false,
    transformData,
    autoHideContainer = true,
    cssClasses: userCssClasses = {}
  }) {
  const attributesOK = isArray(attributes) &&
    reduce(attributes, (res, val) => {
      return res &&
        isPlainObject(val) &&
        isString(val.name) &&
        (isUndefined(val.label) || isString(val.label)) &&
        (isUndefined(val.template) || isString(val.template) || isFunction(val.template)) &&
        (isUndefined(val.transformData) || isFunction(val.transformData));
    }, true);

  const templatesKeys = ['header', 'item', 'clearAll', 'footer'];
  const templatesOK = isPlainObject(templates) &&
    reduce(templates, (res, val, key) => {
      return res &&
        templatesKeys.indexOf(key) !== -1 &&
        (isString(val) || isFunction(val));
    }, true);

  const userCssClassesKeys = ['root', 'header', 'body', 'clearAll', 'list', 'item', 'link', 'count', 'footer'];
  const userCssClassesOK = isPlainObject(userCssClasses) &&
    reduce(userCssClasses, (res, val, key) => {
      return res &&
       userCssClassesKeys.indexOf(key) !== -1 &&
       isString(val) || isArray(val);
    }, true);

  const transformDataOK = isUndefined(transformData) ||
    isFunction(transformData) ||
    (isPlainObject(transformData) && isFunction(transformData.item));

  const showUsage = false ||
    !(isString(container) || isDomElement(container)) ||
    !isArray(attributes) ||
    !attributesOK ||
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

  let containerNode = getContainerNode(container);
  let CurrentRefinedValues = headerFooterHOC(CurrentRefinedValuesComponent);
  if (autoHideContainer === true) {
    CurrentRefinedValues = autoHideContainerHOC(CurrentRefinedValues);
  }

  let attributeNames = map(attributes, (attribute) => attribute.name);
  let restrictedTo = onlyListedAttributes ? attributeNames : [];

  let attributesObj = reduce(attributes, (res, attribute) => {
    res[attribute.name] = attribute;
    return res;
  }, {});

  return {
    init({helper}) {
      this._clearRefinementsAndSearch = clearRefinementsAndSearch.bind(null, helper, restrictedTo);
    },

    render: function({results, helper, state, templatesConfig, createURL}) {
      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        header: cx(bem('header'), userCssClasses.header),
        body: cx(bem('body'), userCssClasses.body),
        clearAll: cx(bem('clear-all'), userCssClasses.clearAll),
        list: cx(bem('list'), userCssClasses.list),
        item: cx(bem('item'), userCssClasses.item),
        link: cx(bem('link'), userCssClasses.link),
        count: cx(bem('count'), userCssClasses.count),
        footer: cx(bem('footer'), userCssClasses.footer)
      };

      let templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      const clearAllURL = createURL(clearRefinementsFromState(state, restrictedTo));

      const refinements = getFilteredRefinements(results, state, attributeNames, onlyListedAttributes);
      let clearRefinementURLs = refinements.map((refinement) => createURL(clearRefinementFromState(state, refinement)));
      let clearRefinementClicks = refinements.map((refinement) => clearRefinement.bind(null, helper, refinement));

      const shouldAutoHideContainer = refinements.length === 0;

      ReactDOM.render(
        <CurrentRefinedValues
          attributes={attributesObj}
          clearAllClick={this._clearRefinementsAndSearch}
          clearAllPosition={clearAll}
          clearAllURL={clearAllURL}
          clearRefinementClicks={clearRefinementClicks}
          clearRefinementURLs={clearRefinementURLs}
          collapsible={collapsible}
          cssClasses={cssClasses}
          refinements={refinements}
          shouldAutoHideContainer={shouldAutoHideContainer}
          templateProps={templateProps}
        />,
        containerNode
      );
    }
  };
}

function getRestrictedIndexForSort(attributeNames, otherAttributeNames, attributeName) {
  let idx = attributeNames.indexOf(attributeName);
  if (idx !== -1) {
    return idx;
  }
  return attributeNames.length + otherAttributeNames.indexOf(attributeName);
}

function compareRefinements(attributeNames, otherAttributeNames, a, b) {
  const idxa = getRestrictedIndexForSort(attributeNames, otherAttributeNames, a.attributeName);
  const idxb = getRestrictedIndexForSort(attributeNames, otherAttributeNames, b.attributeName);
  if (idxa === idxb) {
    if (a.name === b.name) {
      return 0;
    }
    return (a.name < b.name) ? -1 : 1;
  }
  return (idxa < idxb) ? -1 : 1;
}

function getFilteredRefinements(results, state, attributeNames, onlyListedAttributes) {
  let refinements = getRefinements(results, state);
  let otherAttributeNames = reduce(refinements, (res, refinement) => {
    if (attributeNames.indexOf(refinement.attributeName) === -1 && res.indexOf(refinement.attributeName === -1)) {
      res.push(refinement.attributeName);
    }
    return res;
  }, []);
  refinements = refinements.sort(compareRefinements.bind(null, attributeNames, otherAttributeNames));
  if (onlyListedAttributes && !isEmpty(attributeNames)) {
    refinements = filter(refinements, refinement => attributeNames.indexOf(refinement.attributeName) !== -1);
  }
  return refinements;
}

function clearRefinementFromState(state, refinement) {
  switch (refinement.type) {
  case 'facet':
    return state.removeFacetRefinement(refinement.attributeName, refinement.name);
  case 'disjunctive':
    return state.removeDisjunctiveFacetRefinement(refinement.attributeName, refinement.name);
  case 'hierarchical':
    return state.clearRefinements(refinement.attributeName);
  case 'exclude':
    return state.removeExcludeRefinement(refinement.attributeName, refinement.name);
  case 'numeric':
    return state.removeNumericRefinement(refinement.attributeName, refinement.operator, refinement.numericValue);
  case 'tag':
    return state.removeTagRefinement(refinement.name);
  default:
    throw new Error('clearRefinement: type ' + refinement.type + 'isn\'t handled');
  }
}

function clearRefinement(helper, refinement) {
  helper.setState(clearRefinementFromState(helper.state, refinement)).search();
}

export default currentRefinedValues;
