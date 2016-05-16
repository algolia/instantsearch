import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode
} from '../../lib/utils.js';
import cx from 'classnames';
import find from 'lodash/collection/find';
import includes from 'lodash/collection/includes';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import defaultTemplates from './defaultTemplates.js';
import RefinementListComponent from '../../components/RefinementList/RefinementList.js';

let bem = bemHelper('ais-refinement-list');

/**
 * Instantiate a list of refinements based on a facet
 * @function numericRefinementList
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for filtering
 * @param  {Object[]} options.options List of all the options
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.radio] CSS class to add to each radio element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
numericRefinementList({
  container,
  attributeName,
  options,
  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer ],
  [ collapsible=false ]
})`;
function numericRefinementList({
    container,
    attributeName,
    options,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    collapsible = false,
    transformData,
    autoHideContainer = true
  }) {
  if (!container || !attributeName || !options) {
    throw new Error(usage);
  }

  let containerNode = getContainerNode(container);
  let RefinementList = headerFooterHOC(RefinementListComponent);
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    label: cx(bem('label'), userCssClasses.label),
    radio: cx(bem('radio'), userCssClasses.radio),
    active: cx(bem('item', 'active'), userCssClasses.active)
  };

  return {
    init({templatesConfig, helper}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      this._toggleRefinement = (facetValue) => {
        let refinedState = refine(helper.state, attributeName, options, facetValue);
        helper.setState(refinedState).search();
      };
    },
    render: function({results, state, createURL}) {
      let facetValues = options.map((facetValue) => {
        return {
          ...facetValue,
          isRefined: isRefined(state, attributeName, facetValue),
          attributeName: attributeName
        };
      });

      // Bind createURL to this specific attribute
      function _createURL(facetValue) {
        return createURL(refine(state, attributeName, options, facetValue));
      }

      ReactDOM.render(
        <RefinementList
          collapsible={collapsible}
          createURL={_createURL}
          cssClasses={cssClasses}
          facetValues={facetValues}
          shouldAutoHideContainer={results.nbHits === 0}
          templateProps={this._templateProps}
          toggleRefinement={this._toggleRefinement}
        />,
        containerNode
      );
    }
  };
}

function isRefined(state, attributeName, option) {
  let currentRefinements = state.getNumericRefinements(attributeName);

  if (option.start !== undefined && option.end !== undefined) {
    if (option.start === option.end) {
      return hasNumericRefinement(currentRefinements, '=', option.start);
    }
  }

  if (option.start !== undefined) {
    return hasNumericRefinement(currentRefinements, '>=', option.start);
  }

  if (option.end !== undefined) {
    return hasNumericRefinement(currentRefinements, '<=', option.end);
  }

  if (option.start === undefined && option.end === undefined) {
    return Object.keys(currentRefinements).length === 0;
  }
}

function refine(state, attributeName, options, facetValue) {
  let refinedOption = find(options, {name: facetValue});

  let currentRefinements = state.getNumericRefinements(attributeName);

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return state.clearRefinements(attributeName);
  }

  if (!isRefined(state, attributeName, refinedOption)) {
    state = state.clearRefinements(attributeName);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        state = state.removeNumericRefinement(attributeName, '=', refinedOption.start);
      } else {
        state = state.addNumericRefinement(attributeName, '=', refinedOption.start);
      }
      return state;
    }
  }

  if (refinedOption.start !== undefined) {
    if (hasNumericRefinement(currentRefinements, '>=', refinedOption.start)) {
      state = state.removeNumericRefinement(attributeName, '>=', refinedOption.start);
    } else {
      state = state.addNumericRefinement(attributeName, '>=', refinedOption.start);
    }
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      state = state.removeNumericRefinement(attributeName, '<=', refinedOption.end);
    } else {
      state = state.addNumericRefinement(attributeName, '<=', refinedOption.end);
    }
  }

  return state;
}

function hasNumericRefinement(currentRefinements, operator, value) {
  let hasOperatorRefinements = currentRefinements[operator] !== undefined;
  let includesValue = includes(currentRefinements[operator], value);

  return hasOperatorRefinements && includesValue;
}

export default numericRefinementList;
