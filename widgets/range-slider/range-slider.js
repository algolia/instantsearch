let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils.js');
let autoHideContainerHOC = require('../../decorators/autoHideContainer');
let headerFooterHOC = require('../../decorators/headerFooter');

let defaultTemplates = {
  header: '',
  footer: ''
};

/**
 * Instantiate a slider based on a numeric attribute
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
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
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @return {Object}
 */
function rangeSlider({
    container = null,
    attributeName = null,
    tooltips = true,
    templates = defaultTemplates,
    cssClasses = {
      root: null,
      body: null
    },
    step = 1,
    pips = true,
    autoHideContainer = true
  }) {
  let containerNode = utils.getContainerNode(container);

  let Slider = headerFooterHOC(require('../../components/Slider/Slider'));
  if (autoHideContainer === true) {
    Slider = autoHideContainerHOC(Slider);
  }

  return {
    getConfiguration: () => ({
      disjunctiveFacets: [attributeName]
    }),
    _getCurrentRefinement(helper) {
      let min = helper.state.getNumericRefinement(attributeName, '>=');
      let max = helper.state.getNumericRefinement(attributeName, '<=');

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
      helper.clearRefinements(attributeName);
      if (newValues[0] > stats.min) {
        helper.addNumericRefinement(attributeName, '>=', Math.round(newValues[0]));
      }
      if (newValues[1] < stats.max) {
        helper.addNumericRefinement(attributeName, '<=', Math.round(newValues[1]));
      }
      helper.search();
    },
    render({results, helper, templatesConfig}) {
      let facet = results.disjunctiveFacets.find(
        function(f) { return f.name === attributeName; }
      );
      let stats = facet.stats;
      let currentRefinement = this._getCurrentRefinement(helper);

      if (stats === undefined) {
        stats = {
          min: null,
          max: null
        };
      }

      let hasNoRefinements = stats.min === null && stats.max === null;

      let templateProps = utils.prepareTemplateProps({
        defaultTemplates,
        templatesConfig,
        templates
      });

      ReactDOM.render(
        <Slider
          cssClasses={cssClasses}
          onChange={this._refine.bind(this, helper, stats)}
          pips={pips}
          range={{min: Math.floor(stats.min), max: Math.ceil(stats.max)}}
          shouldAutoHideContainer={hasNoRefinements}
          start={[currentRefinement.min, currentRefinement.max]}
          step={step}
          templateProps={templateProps}
          tooltips={tooltips}
        />,
        containerNode
      );
    }
  };
}

module.exports = rangeSlider;
