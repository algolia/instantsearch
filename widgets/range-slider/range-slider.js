var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var autoHideContainer = require('../../decorators/autoHideContainer');
var headerFooter = require('../../decorators/headerFooter');

var defaultTemplates = {
  header: '',
  footer: ''
};

/**
 * Instantiate a slider based on a numeric attribute
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.facetName Name of the attribute for faceting
 * @param  {boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, body
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function rangeSlider({
    container = null,
    facetName = null,
    tooltips = true,
    templates = defaultTemplates,
    cssClasses = {
      root: null,
      body: null
    },
    hideContainerWhenNoResults = true
  }) {
  var containerNode = utils.getContainerNode(container);

  var Slider = headerFooter(require('../../components/Slider/Slider'));
  if (hideContainerWhenNoResults === true) {
    Slider = autoHideContainer(Slider);
  }

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
    _refine(helper, stats, newValues) {
      helper.clearRefinements(facetName);
      if (newValues[0] > stats.min) {
        helper.addNumericRefinement(facetName, '>=', newValues[0]);
      }
      if (newValues[1] < stats.max) {
        helper.addNumericRefinement(facetName, '<=', newValues[1]);
      }
      helper.search();
    },
    render({results, helper, templatesConfig}) {
      var stats = results.getFacetStats(facetName);

      var currentRefinement = this._getCurrentRefinement(helper);

      if (stats === undefined) {
        stats = {
          min: null,
          max: null
        };
      }

      var hasNoRefinements = stats.min === null && stats.max === null;

      var templateProps = utils.prepareTemplateProps({
        defaultTemplates,
        templatesConfig,
        templates
      });

      ReactDOM.render(
        <Slider
          cssClasses={cssClasses}
          onChange={this._refine.bind(this, helper, stats)}
          range={{min: stats.min, max: stats.max}}
          shouldAutoHideContainer={hasNoRefinements}
          start={[currentRefinement.min, currentRefinement.max]}
          templateProps={templateProps}
          tooltips={tooltips}
        />,
        containerNode
      );
    }
  };
}

module.exports = rangeSlider;
