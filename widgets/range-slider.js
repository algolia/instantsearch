var React = require('react');

var utils = require('../lib/utils.js');

/**
 * Instantiate a slider based on a numeric attribute
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {Boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}
 * So that you can format the tooltip display value as you want
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function rangeSlider({
    container = null,
    facetName = null,
    tooltips = true,
    hideWhenNoResults = true
  }) {
  var Slider = require('../components/Slider');

  var containerNode = utils.getContainerNode(container);

  return {
    getConfiguration: () => ({
      disjunctiveFacets: [facetName]
    }),
    _getCurrentRefinement(helper) {
      var min = helper.state.getNumericRefinement(facetName, '>=');
      var max = helper.state.getNumericRefinement(facetName, '<=');

      if (min && min.length) {
        min = min[0];
      } else {
        min = -Infinity;
      }

      if (max && max.length) {
        max = max[0];
      } else {
        max = Infinity;
      }

      return {
        min,
        max
      };
    },
    _refine(helper, newValues) {
      helper.clearRefinements(facetName);
      helper.addNumericRefinement(facetName, '>=', newValues[0]);
      helper.addNumericRefinement(facetName, '<=', newValues[1]);
      helper.search();
    },
    render({results, helper}) {
      var stats = results.getFacetStats(facetName);

      var currentRefinement = this._getCurrentRefinement(helper);

      if (stats === undefined) {
        stats = {
          min: null,
          max: null
        };
      }

      React.render(
        <Slider
          start={[currentRefinement.min, currentRefinement.max]}
          range={{min: stats.min, max: stats.max}}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={stats.min !== null && stats.max !== null}
          onChange={this._refine.bind(this, helper)}
          tooltips={tooltips}
        />,
        containerNode
      );
    }
  };
}

module.exports = rangeSlider;
