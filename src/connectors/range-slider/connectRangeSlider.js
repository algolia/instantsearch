import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customRangeSlider = connectRangeSlider(function render(params, isFirstRendering) {
  // params = {
  //   refine,
  //   range,
  //   start,
  //   format,
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
 * @typedef {Object} CustomRangeSliderWidgetOptions
 * @param {string} attributeName Name of the attribute for faceting.
 * @param {number} [min] Minimal slider value, default to automatically computed from the result set
 * @param {number} [max] Maximal slider value, defaults to automatically computed from the result set
 * @param {number} [precision = 2]
 */

/**
 * @typedef {Object} RangeSliderRenderingOptions
 * @property {function} refine set the next search state setting the range of the widget
 * @property {{min: number, max: number}} numeric bounds without the current range filter
 * @property {[number, number]} start current numeric bounds of the search
 * @property {{from: function, to: function}} formatter functions
 * @property {Object} widgetParams all original options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 */

 /**
  * Connects a rendering function with the range slider business logic.
  * @param {function(RangeSliderRenderingOptions, boolean)} renderFn function that renders the range slider widget
  * @return {function(CustomRangeSliderWidgetOptions)} a widget factory for range slider widget
  */
export default function connectRangeSlider(renderFn) {
  checkRendering(renderFn, usage);

  return widgetParams => {
    const {
      attributeName,
      min: userMin,
      max: userMax,
      precision = 2,
    } = widgetParams;

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
          widgetParams,
          instantSearchInstance,
        }, true);
      },

      render({results, helper, instantSearchInstance}) {
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
          widgetParams,
          instantSearchInstance,
        }, false);
      },
    };
  };
}
