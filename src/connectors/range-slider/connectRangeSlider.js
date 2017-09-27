import find from 'lodash/find';

import { checkRendering } from '../../lib/utils.js';

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
 * @property {function(Array<number, number>)} refine Sets a range to filter the results on. Both values
 * are optional, and will default to the higher and lower bounds.
 * @property {{min: number, max: number}} range Results bounds without the current range filter.
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
      min: minBounds,
      max: maxBounds,
      precision = 2,
    } = widgetParams;

    if (!attributeName) {
      throw new Error(usage);
    }

    const isMinBounds = minBounds !== undefined && minBounds !== null;
    const isMaxBounds = maxBounds !== undefined && maxBounds !== null;

    const formatToNumber = v => Number(Number(v).toFixed(precision));

    const sliderFormatter = {
      from: v => v,
      to: v => formatToNumber(v).toLocaleString(),
    };

    return {
      _isAbleToRefine: (min, max) => {
        const isMinValid = min !== undefined && min !== null;
        const isMaxValid = max !== undefined && max !== null;

        if (isMinValid && isMaxValid && min >= max) {
          return false;
        }

        return isMinValid || isMaxValid;
      },

      _getCurrentRange: (stats = {}) => {
        let min;
        if (isMinBounds) {
          min = minBounds;
        } else if (stats.min !== undefined && stats.min !== null) {
          min = stats.min;
        } else {
          min = 0;
        }

        let max;
        if (isMaxBounds) {
          max = maxBounds;
        } else if (stats.max !== undefined && stats.max !== null) {
          max = stats.max;
        } else {
          max = 0;
        }

        return {
          min: Math.floor(min),
          max: Math.ceil(max),
        };
      },

      _getCurrentRefinement: (helper, stats = {}) => {
        const [minValue] =
          helper.state.getNumericRefinement(attributeName, '>=') || [];

        const [maxValue] =
          helper.state.getNumericRefinement(attributeName, '<=') || [];

        let min;
        if (minValue !== undefined && minValue !== null) {
          min = minValue;
        } else if (stats.min !== undefined && stats.min !== null) {
          min = stats.min;
        } else {
          min = -Infinity;
        }

        let max;
        if (maxValue !== undefined && maxValue !== null) {
          max = maxValue;
        } else if (stats.max !== undefined && stats.max !== null) {
          max = stats.max;
        } else {
          max = Infinity;
        }

        return {
          min: Math.floor(min),
          max: Math.ceil(max),
        };
      },

      _refine: (helper, range = {}) => ([nextMin, nextMax] = []) => {
        const { min: rangeMin, max: rangeMax } = range;

        const [min] = helper.getNumericRefinement(attributeName, '>=') || [];
        const [max] = helper.getNumericRefinement(attributeName, '<=') || [];

        const newNextMin =
          !isMinBounds && rangeMin === nextMin ? undefined : nextMin;

        const newNextMax =
          !isMaxBounds && rangeMax === nextMax ? undefined : nextMax;

        if (min !== newNextMin || max !== newNextMax) {
          helper.clearRefinements();

          const isValidMinInput =
            newNextMin !== null && newNextMin !== undefined;
          const isGreatherThanBounds = isMinBounds && minBounds <= newNextMin;

          if (isValidMinInput && (!isMinBounds || isGreatherThanBounds)) {
            helper.addNumericRefinement(
              attributeName,
              '>=',
              formatToNumber(newNextMin)
            );
          }

          const isValidMaxInput =
            newNextMax !== null && newNextMax !== undefined;
          const isLowerThanBounds = isMaxBounds && maxBounds >= newNextMax;

          if (isValidMaxInput && (!isMaxBounds || isLowerThanBounds)) {
            helper.addNumericRefinement(
              attributeName,
              '<=',
              formatToNumber(newNextMax)
            );
          }

          helper.search();
        }
      },

      getConfiguration(currentConfiguration) {
        const configuration = {
          disjunctiveFacets: [attributeName],
        };

        const boundsAlreadyDefined =
          currentConfiguration &&
          currentConfiguration.numericRefinements &&
          currentConfiguration.numericRefinements[attributeName] !== undefined;

        const isBoundsDefined = isMinBounds || isMaxBounds;
        const isAbleToRefine = this._isAbleToRefine(minBounds, maxBounds);

        if (isBoundsDefined && !boundsAlreadyDefined && isAbleToRefine) {
          configuration.numericRefinements = { [attributeName]: {} };

          if (isMinBounds) {
            configuration.numericRefinements[attributeName]['>='] = [minBounds];
          }

          if (isMaxBounds) {
            configuration.numericRefinements[attributeName]['<='] = [maxBounds];
          }
        }

        return configuration;
      },

      init({ helper, instantSearchInstance }) {
        const stats = {};
        const currentRange = this._getCurrentRange(stats);
        const currentRefinement = this._getCurrentRefinement(helper, stats);

        renderFn(
          {
            refine: this._refine(helper, currentRange),
            range: currentRange,
            start: [currentRefinement.min, currentRefinement.max],
            format: sliderFormatter,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ results, helper, instantSearchInstance }) {
        const facetsFromResults = results.disjunctiveFacets || [];
        const facet = find(facetsFromResults, _ => _.name === attributeName);
        const stats = facet && facet.stats;

        const currentRange = this._getCurrentRange(stats);
        const currentRefinement = this._getCurrentRefinement(helper, stats);

        renderFn(
          {
            refine: this._refine(helper, currentRange),
            range: currentRange,
            start: [currentRefinement.min, currentRefinement.max],
            format: sliderFormatter,
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },
    };
  };
}
