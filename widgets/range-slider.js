var React = require('react');

var utils = require('../lib/widget-utils.js');

/**
 * Instantiate a slider based on a numeric attribute
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @return {Object}
 */
function rangeSlider({
    container = null,
    facetName = null
  }) {
  var Slider = require('../components/Slider');

  var containerNode = utils.getContainerNode(container);

  return {
    getConfiguration: () => ({
      disjunctiveFacets: [facetName]
    }),
    _currentValues: {
      min: -Infinity,
      max: Infinity
    },
    _refine(helper, stats, newValues) {
      var min = helper.state.getNumericRefinement(facetName, '>=');
      var max = helper.state.getNumericRefinement(facetName, '<=');

      this._currentValues = {
        min: Math.max(min && min.length && min[0] || 0, stats.min),
        max: Math.min(max && max.length && max[0] || Infinity, stats.max)
      };

      if (this._currentValues.min !== newValues[0] || this._currentValues.max !== newValues[1]) {
        this._currentValues = {
          min: newValues[0],
          max: newValues[1]
        };

        helper.clearRefinements(facetName);
        helper.addNumericRefinement(facetName, '>=', this._currentValues.min);
        helper.addNumericRefinement(facetName, '<=', this._currentValues.max);
        helper.search();
      }
    },
    render(results, state, helper) {
      var stats = results.getFacetStats(facetName);

      React.render(
        <Slider
          start={[this._currentValues.min, this._currentValues.max]}
          range={{min: stats.min, max: stats.max}}
          onChange={this._refine.bind(this, helper, stats)}
        />,
        containerNode
      );
    }
  };
}

module.exports = rangeSlider;
