let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils.js');
let cx = require('classnames');
let find = require('lodash/collection/find');
let autoHideContainerHOC = require('../../decorators/autoHideContainer');

let bem = utils.bemHelper('ais-numeric-selector');

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.label The optional label displayed before the select.
 * @param  {string} options.attributeName Name of the numeric attribute to use
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[i].value The numerical value to refine with
 * @param  {string} options.options[i].label Label to display in the option
 * @param  {string} [options.operator] The operator to use to refine
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string} [options.cssClasses.item] CSS classes added to each `<option>`
 * @param  {string} [options.cssClasses.label] CSS classes added to the `<label>`
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @return {Object}
 */

function numericSelector({
    container,
    operator = '=',
    label,
    attributeName,
    options,
    cssClasses: userCssClasses = {},
    autoHideContainer = false
  }) {
  let containerNode = utils.getContainerNode(container);
  let usage = 'Usage: numericSelector({container, attributeName, options[, cssClasses.{root,item,label}, label, autoHideContainer]})';

  let Selector = require('../../components/Selector');
  if (autoHideContainer === true) {
    Selector = autoHideContainerHOC(Selector);
  }

  if (!container || !options || options.length === 0 || !attributeName) {
    throw new Error(usage);
  }

  return {
    init: function({helper}) {
      const currentValue = this._getRefinedValue(helper) || options[0].value;
      if (currentValue !== undefined) {
        helper.addNumericRefinement(attributeName, operator, currentValue);
      }
    },

    render: function({helper, results}) {
      const currentValue = this._getRefinedValue(helper);
      const hasNoResults = results.nbHits === 0;

      const cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        item: cx(bem('item'), userCssClasses.item),
        label: cx(bem('label'), userCssClasses.label)
      };
      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={currentValue}
          label={label}
          options={options}
          setValue={this._refine.bind(this, helper)}
          shouldAutoHideContainer={hasNoResults}
        />,
        containerNode
      );
    },

    _refine: function(helper, value) {
      helper.clearRefinements(attributeName);
      if (value !== undefined) {
        helper.addNumericRefinement(attributeName, operator, value);
      }
      helper.search();
    },

    _getRefinedValue: function(helper) {
      const refinements = helper.getRefinements(attributeName);
      return find(refinements, {operator});
    }
  };
}

module.exports = numericSelector;
