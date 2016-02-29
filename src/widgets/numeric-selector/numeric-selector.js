import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  getContainerNode
} from '../../lib/utils.js';
import cx from 'classnames';
import find from 'lodash/collection/find';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import SelectorComponent from '../../components/Selector.js';

let bem = bemHelper('ais-numeric-selector');

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function numericSelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the numeric attribute to use
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[i].value The numerical value to refine with
 * @param  {string} options.options[i].label Label to display in the option
 * @param  {string} [options.operator] The operator to use to refine
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<option>`
 * @return {Object}
 */

function numericSelector({
    container,
    operator = '=',
    attributeName,
    options,
    cssClasses: userCssClasses = {},
    autoHideContainer = false
  }) {
  let containerNode = getContainerNode(container);
  let usage = 'Usage: numericSelector({container, attributeName, options[, cssClasses.{root,item}, autoHideContainer]})';

  let Selector = SelectorComponent;
  if (autoHideContainer === true) {
    Selector = autoHideContainerHOC(Selector);
  }

  if (!container || !options || options.length === 0 || !attributeName) {
    throw new Error(usage);
  }

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item)
  };

  return {
    init: function({helper}) {
      const currentValue = this._getRefinedValue(helper) || options[0].value;
      if (currentValue !== undefined) {
        helper.addNumericRefinement(attributeName, operator, currentValue);
      }

      this._refine = value => {
        helper.clearRefinements(attributeName);
        if (value !== undefined) {
          helper.addNumericRefinement(attributeName, operator, value);
        }
        helper.search();
      };
    },

    render: function({helper, results}) {
      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={this._getRefinedValue(helper)}
          options={options}
          setValue={this._refine}
          shouldAutoHideContainer={results.nbHits === 0}
        />,
        containerNode
      );
    },

    _getRefinedValue: function(helper) {
      const refinements = helper.getRefinements(attributeName);
      const refinedValue = find(refinements, {operator});
      return refinedValue &&
        refinedValue.value !== undefined &&
        refinedValue.value[0] !== undefined ? refinedValue.value[0] : undefined;
    }
  };
}

export default numericSelector;
