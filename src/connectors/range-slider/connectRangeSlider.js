import find from 'lodash/find';

import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customRangeSlider = connectRangeSlider(function render(params, isFirstRendering) {
  // params = {
  //   refine,
  //   range,
  //   start,
  //   format,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customRangeSlider({
    attributeName,
    [ min ],
    [ max ],
    [ precision = 2 ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectRangeSlider.html
`;

/**
 * @typedef {Object} CustomRangeSliderWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting.
 * @property {number} [min = undefined] Minimal slider value, default to automatically computed from the result set.
 * @property {number} [max = undefined] Maximal slider value, default to automatically computed from the result set.
 * @property {number} [precision = 2] Number of digits after decimal point to use.
 */

/**
 * @typedef {Object} RangeSliderRenderingOptions
 * @property {function({min: number, max: number})} refine Sets a range to filter the results on. Both values
 * are optional, and will default to the higher and lower bounds.
 * @property {{min: number, max: number}} numeric Results bounds without the current range filter.
 * @property {Array<number, number>} start Current numeric bounds of the search.
 * @property {{from: function, to: function}} formatter Transform for the rendering `from` and/or `to` values.
 * Both functions take a `number` as input and should output a `string`.
 * @property {Object} widgetParams All original `CustomRangeSliderWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **RangeSlider** connector provides the logic to create custom widget that will let
 * the user refine results using a numeric range.
 *
 * Thic connectors provides a `refine()` function that accepts bounds. It will also provide
 * information about the min and max bounds for the current result set.
 * @type {Connector}
 * @param {function(RangeSliderRenderingOptions, boolean)} renderFn Rendering function for the custom **RangeSlider** widget.
 * @return {function(CustomRangeSliderWidgetOptions)} Re-usable widget factory for a custom **RangeSlider** widget.
 */
export default function connectRangeSlider(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
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
          const currentValues = [
            helper.getNumericRefinement(attributeName, '>='),
            helper.getNumericRefinement(attributeName, '<='),
          ];

          if (currentValues[0] !== newValues[0] || currentValues[1] !== newValues[1]) {
            helper.clearRefinements(attributeName);
            if (!bounds.min || newValues[0] > bounds.min) {
              helper.addNumericRefinement(attributeName, '>=', formatToNumber(newValues[0]));
            }
            if (!bounds.max || newValues[1] < bounds.max) {
              helper.addNumericRefinement(attributeName, '<=', formatToNumber(newValues[1]));
            }
            helper.search();
          }
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
        const facetsFromResults = results.disjunctiveFacets || [];
        const facet = find(facetsFromResults, ({name}) => name === attributeName);
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
