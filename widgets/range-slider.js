var React = require('react');

var utils = require('../lib/utils.js');

/**
 * Instantiate a slider based on a numeric attribute
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {Boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}
 * So that you can format the tooltip display value as you want
 * @return {Object}
 */
function rangeSlider({
    container = null,
    facetName = null,
    tooltips = true
  }) {
  var Slider = require('../components/Slider');

  var containerNode = utils.getContainerNode(container);
  var currentValues = {
    min: -Infinity,
    max: Infinity
  };

  return {
    getConfiguration: () => ({
      disjunctiveFacets: [facetName]
    }),
    _refine(helper, stats, newValues) {
      var min = helper.state.getNumericRefinement(facetName, '>=');
      var max = helper.state.getNumericRefinement(facetName, '<=');

      currentValues = {
        // min: Math.max(min && min.length && min[0] || -Infinity, stats.min),
        min: min && min.length ? Math.max.apply(Math, min.concat(stats.min)) : stats.min,
        // max: Math.min(max && max.length && max[0] || Infinity, stats.max)
        max: max && max.length ? Math.max.apply(Math, max.concat(stats.max)) : stats.max
      };

      if (currentValues.min !== newValues[0] || currentValues.max !== newValues[1]) {
        currentValues = {
          min: newValues[0],
          max: newValues[1]
        };

        helper.clearRefinements(facetName);
        helper.addNumericRefinement(facetName, '>=', currentValues.min);
        helper.addNumericRefinement(facetName, '<=', currentValues.max);
        helper.search();
      }
    },
    render(results, state, helper) {
      var stats = results.getFacetStats(facetName);

      React.render(
        <Slider
          start={[currentValues.min, currentValues.max]}
          range={{min: stats.min, max: stats.max}}
          onChange={this._refine.bind(this, helper, stats)}
          tooltips={tooltips}
        />,
        containerNode
      );
    }
  };
}

module.exports = rangeSlider;
