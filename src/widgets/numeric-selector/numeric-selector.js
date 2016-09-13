import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  getContainerNode
} from '../../lib/utils.js';
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import SelectorComponent from '../../components/Selector.js';

const bem = bemHelper('ais-numeric-selector');

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
  const containerNode = getContainerNode(container);
  const usage = `Usage: numericSelector({
    container,
    attributeName,
    options,
    cssClasses.{root,item},
    autoHideContainer
  })`;

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
    getConfiguration(currentSearchParameters, searchParametersFromUrl) {
      return {
        numericRefinements: {
          [attributeName]: {
            [operator]: [this._getRefinedValue(searchParametersFromUrl)]
          }
        }
      };
    },
    init({helper}) {
      this._refine = value => {
        helper.clearRefinements(attributeName);
        if (value !== undefined) {
          helper.addNumericRefinement(attributeName, operator, value);
        }
        helper.search();
      };
    },

    render({helper, results}) {
      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={this._getRefinedValue(helper.state)}
          options={options}
          setValue={this._refine}
          shouldAutoHideContainer={results.nbHits === 0}
        />,
        containerNode
      );
    },

    _getRefinedValue(state) {
      // This is reimplementing state.getNumericRefinement
      // But searchParametersFromUrl is not an actual SearchParameters object
      // It's only the object structure without the methods, because getStateFromQueryString
      // is not sending a SearchParameters. There's no way given how web built the helper
      // to initialize a true partial state where only the refinements are present
      return state &&
        state.numericRefinements &&
        state.numericRefinements[attributeName] !== undefined &&
        state.numericRefinements[attributeName][operator] !== undefined &&
        state.numericRefinements[attributeName][operator][0] !== undefined ? // could be 0
        state.numericRefinements[attributeName][operator][0] :
        options[0].value;
    }
  };
}

export default numericSelector;
