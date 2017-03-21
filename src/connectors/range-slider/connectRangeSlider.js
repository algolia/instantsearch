import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customRangeSlider = connectRangeSlider(function render(params, isFirstRendering) {
  // params = {
  //   refine,
  //   range,
  //   start,
  //   instantSearchInstance,
  // }
});
search.addWidget(
  customRangeSlider({
    attributeName,
    min,
    max,
    precision
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectRangeSlider.html
`;

/**
 * Instantiate a slider based on a numeric attribute.
 * This is a wrapper around [noUiSlider](http://refreshless.com/nouislider/)
 * @function rangeSlider
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the raw value.
 * You can also provide
 * `tooltips: {format: function(rawValue) {return '$' + Math.round(rawValue).toLocaleString()}}`
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {boolean|object} [options.pips=true] Show slider pips.
 * @param  {boolean|object} [options.step=1] Every handle move will jump that number of steps.
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @param  {number} [options.min] Minimal slider value, default to automatically computed from the result set
 * @param  {number} [options.max] Maximal slider value, defaults to automatically computed from the result set
 * @return {Object}
 */

export default function connectRangeSlider(renderFn) {
  checkRendering(renderFn, usage);

  return ({
    attributeName,
    min: userMin,
    max: userMax,
    precision = 2,
  }) => {
    if (!attributeName) {
      throw new Error(usage);
    }

    const formatToNumber = v => Number(Number(v).toFixed(precision));

    const sliderFormatter = {
      from: v => v,
      to: v => formatToNumber(v).toLocaleString(),
    };

    return {
      getConfiguration: originalConf => {
        const conf = {
          disjunctiveFacets: [attributeName],
        };

        const hasUserBounds = userMin !== undefined || userMax !== undefined;
        const boundsNotAlreadyDefined = !originalConf ||
          originalConf.numericRefinements &&
          originalConf.numericRefinements[attributeName] === undefined;

        if (hasUserBounds && boundsNotAlreadyDefined) {
          conf.numericRefinements = {[attributeName]: {}};
          if (userMin !== undefined) conf.numericRefinements[attributeName]['>='] = [userMin];
          if (userMax !== undefined) conf.numericRefinements[attributeName]['<='] = [userMax];
        }

        return conf;
      },

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
          max,
        };
      },

      init({helper, instantSearchInstance}) {
        this._instantSearchInstance = instantSearchInstance;

        this._refine = bounds => newValues => {
          helper.clearRefinements(attributeName);
          if (!bounds.min || newValues[0] > bounds.min) {
            helper.addNumericRefinement(attributeName, '>=', formatToNumber(newValues[0]));
          }
          if (!bounds.max || newValues[1] < bounds.max) {
            helper.addNumericRefinement(attributeName, '<=', formatToNumber(newValues[1]));
          }
          helper.search();
        };

        const stats = {
          min: userMin || null,
          max: userMax || null,
        };
        const currentRefinement = this._getCurrentRefinement(helper);

        renderFn({
          refine: this._refine(stats),
          range: {min: Math.floor(stats.min), max: Math.ceil(stats.max)},
          start: [currentRefinement.min, currentRefinement.max],
          format: sliderFormatter,
          instantSearchInstance: this._instantSearchInstance,
        }, true);
      },

      render({results, helper}) {
        const facet = (results.disjunctiveFacets || []).find(({name}) => name === attributeName);
        const stats = facet !== undefined && facet.stats !== undefined ? facet.stats : {
          min: null,
          max: null,
        };

        if (userMin !== undefined) stats.min = userMin;
        if (userMax !== undefined) stats.max = userMax;

        const currentRefinement = this._getCurrentRefinement(helper);

        renderFn({
          refine: this._refine(stats),
          range: {min: Math.floor(stats.min), max: Math.ceil(stats.max)},
          start: [currentRefinement.min, currentRefinement.max],
          format: sliderFormatter,
          instantSearchInstance: this._instantSearchInstance,
        }, false);
      },
    };
  };
}
