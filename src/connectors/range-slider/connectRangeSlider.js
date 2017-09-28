import find from 'lodash/find';
import _isFinite from 'lodash/isFinite';

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

    const isMinBounds = _isFinite(minBounds);
    const isMaxBounds = _isFinite(maxBounds);

    const formatToNumber = v => Number(Number(v).toFixed(precision));

    const sliderFormatter = {
      from: v => v,
      to: v => formatToNumber(v).toLocaleString(),
    };

    return {
      _isAbleToRefine(min, max) {
        const isMinValid = _isFinite(min);
        const isMaxValid = _isFinite(max);

        if (isMinValid && isMaxValid && min >= max) {
          return false;
        }

        return isMinValid || isMaxValid;
      },

      _getCurrentRange(stats = {}) {
        let min;
        if (isMinBounds) {
          min = minBounds;
        } else if (_isFinite(stats.min)) {
          min = stats.min;
        } else {
          min = 0;
        }

        let max;
        if (isMaxBounds) {
          max = maxBounds;
        } else if (_isFinite(stats.max)) {
          max = stats.max;
        } else {
          max = 0;
        }

        return {
          min: Math.floor(min),
          max: Math.ceil(max),
        };
      },

      _getCurrentRefinement(helper) {
        const [minValue] =
          helper.state.getNumericRefinement(attributeName, '>=') || [];

        const [maxValue] =
          helper.state.getNumericRefinement(attributeName, '<=') || [];

        let min;
        if (_isFinite(minValue)) {
          min = minValue;
        } else {
          min = -Infinity;
        }

        let max;
        if (_isFinite(maxValue)) {
          max = maxValue;
        } else {
          max = Infinity;
        }

        return {
          min: Math.floor(min),
          max: Math.ceil(max),
        };
      },

      _refine(helper, range = {}) {
        return ([nextMin, nextMax] = []) => {
          const { min: rangeMin, max: rangeMax } = range;

          const [min] = helper.getNumericRefinement(attributeName, '>=') || [];
          const [max] = helper.getNumericRefinement(attributeName, '<=') || [];

          const newNextMin =
            !isMinBounds && rangeMin === nextMin ? undefined : nextMin;

          const newNextMax =
            !isMaxBounds && rangeMax === nextMax ? undefined : nextMax;

          if (min !== newNextMin || max !== newNextMax) {
            helper.clearRefinements();

            const isValidMinInput = _isFinite(newNextMin);
            const isValidMinRange = _isFinite(rangeMin);
            const isGreatherThanRange =
              isValidMinRange && rangeMin <= newNextMin;

            if (isValidMinInput && (!isValidMinRange || isGreatherThanRange)) {
              helper.addNumericRefinement(
                attributeName,
                '>=',
                formatToNumber(newNextMin)
              );
            }

            const isValidMaxInput = _isFinite(newNextMax);
            const isValidMaxRange = _isFinite(rangeMax);
            const isLowerThanRange = isValidMaxRange && rangeMax >= newNextMax;

            if (isValidMaxInput && (!isValidMaxRange || isLowerThanRange)) {
              helper.addNumericRefinement(
                attributeName,
                '<=',
                formatToNumber(newNextMax)
              );
            }

            helper.search();
          }
        };
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
        const range = this._getCurrentRange(stats);
        const { min, max } = this._getCurrentRefinement(helper);

        renderFn(
          {
            // On first render pass an empty range
            // to be able to bypass the validation
            // related to it
            refine: this._refine(helper, {}),
            start: [min, max],
            format: sliderFormatter,
            range,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ results, helper, instantSearchInstance }) {
        const facetsFromResults = results.disjunctiveFacets || [];
        const facet = find(facetsFromResults, { name: attributeName });
        const stats = facet && facet.stats;

        const range = this._getCurrentRange(stats);
        const { min, max } = this._getCurrentRefinement(helper);

        renderFn(
          {
            refine: this._refine(helper, range),
            start: [min, max],
            format: sliderFormatter,
            range,
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },
    };
  };
}
