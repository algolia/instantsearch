import find from 'lodash/find';
import _isFinite from 'lodash/isFinite';

import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customRange = connectRange(function render(params, isFirstRendering) {
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
  customRange({
    attributeName,
    [ min ],
    [ max ],
    [ precision = 2 ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectRange.html
`;

/**
 * @typedef {Object} CustomRangeWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting.
 * @property {number} [min = undefined] Minimal range value, default to automatically computed from the result set.
 * @property {number} [max = undefined] Maximal range value, default to automatically computed from the result set.
 * @property {number} [precision = 2] Number of digits after decimal point to use.
 */

/**
 * @typedef {Object} RangeRenderingOptions
 * @property {function(Array<number, number>)} refine Sets a range to filter the results on. Both values
 * are optional, and will default to the higher and lower bounds. You can use `undefined` to remove a
 * previously set bound or to set an infinite bound.
 * @property {{min: number, max: number}} range Results bounds without the current range filter.
 * @property {Array<number, number>} start Current numeric bounds of the search.
 * @property {{from: function, to: function}} formatter Transform for the rendering `from` and/or `to` values.
 * Both functions take a `number` as input and should output a `string`.
 * @property {Object} widgetParams All original `CustomRangeWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **Range** connector provides the logic to create custom widget that will let
 * the user refine results using a numeric range.
 *
 * This connectors provides a `refine()` function that accepts bounds. It will also provide
 * information about the min and max bounds for the current result set.
 * @type {Connector}
 * @param {function(RangeRenderingOptions, boolean)} renderFn Rendering function for the custom **Range** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomRangeWidgetOptions)} Re-usable widget factory for a custom **Range** widget.
 */
export default function connectRange(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      min: minBound,
      max: maxBound,
      precision = 2,
    } = widgetParams;

    if (!attributeName) {
      throw new Error(usage);
    }

    const hasMinBound = _isFinite(minBound);
    const hasMaxBound = _isFinite(maxBound);

    const formatToNumber = v => Number(Number(v).toFixed(precision));

    const rangeFormatter = {
      from: v => v,
      to: v => formatToNumber(v).toLocaleString(),
    };

    return {
      _getCurrentRange(stats) {
        const pow = Math.pow(10, precision);

        let min;
        if (hasMinBound) {
          min = minBound;
        } else if (_isFinite(stats.min)) {
          min = stats.min;
        } else {
          min = 0;
        }

        let max;
        if (hasMaxBound) {
          max = maxBound;
        } else if (_isFinite(stats.max)) {
          max = stats.max;
        } else {
          max = 0;
        }

        return {
          min: Math.floor(min * pow) / pow,
          max: Math.ceil(max * pow) / pow,
        };
      },

      _getCurrentRefinement(helper) {
        const [minValue] =
          helper.getNumericRefinement(attributeName, '>=') || [];

        const [maxValue] =
          helper.getNumericRefinement(attributeName, '<=') || [];

        const min = _isFinite(minValue) ? minValue : -Infinity;
        const max = _isFinite(maxValue) ? maxValue : Infinity;

        return [min, max];
      },

      _refine(helper, currentRange) {
        // eslint-disable-next-line complexity
        return ([nextMin, nextMax] = []) => {
          const { min: currentRangeMin, max: currentRangeMax } = currentRange;

          const [min] = helper.getNumericRefinement(attributeName, '>=') || [];
          const [max] = helper.getNumericRefinement(attributeName, '<=') || [];

          const isResetMin = nextMin === undefined || nextMin === '';
          const isResetMax = nextMax === undefined || nextMax === '';

          const nextMinAsNumber = !isResetMin ? parseFloat(nextMin) : undefined;
          const nextMaxAsNumber = !isResetMax ? parseFloat(nextMax) : undefined;

          let newNextMin;
          if (!hasMinBound && currentRangeMin === nextMinAsNumber) {
            newNextMin = undefined;
          } else if (hasMinBound && isResetMin) {
            newNextMin = minBound;
          } else {
            newNextMin = nextMinAsNumber;
          }

          let newNextMax;
          if (!hasMaxBound && currentRangeMax === nextMaxAsNumber) {
            newNextMax = undefined;
          } else if (hasMaxBound && isResetMax) {
            newNextMax = maxBound;
          } else {
            newNextMax = nextMaxAsNumber;
          }

          const isResetNewNextMin = newNextMin === undefined;
          const isValidNewNextMin = _isFinite(newNextMin);
          const isValidMinCurrentRange = _isFinite(currentRangeMin);
          const isGreaterThanCurrentRange =
            isValidMinCurrentRange && currentRangeMin <= newNextMin;
          const isMinValid =
            isResetNewNextMin ||
            (isValidNewNextMin &&
              (!isValidMinCurrentRange || isGreaterThanCurrentRange));

          const isResetNewNextMax = newNextMax === undefined;
          const isValidNewNextMax = _isFinite(newNextMax);
          const isValidMaxCurrentRange = _isFinite(currentRangeMax);
          const isLowerThanRange =
            isValidMaxCurrentRange && currentRangeMax >= newNextMax;
          const isMaxValid =
            isResetNewNextMax ||
            (isValidNewNextMax &&
              (!isValidMaxCurrentRange || isLowerThanRange));

          const hasMinChange = min !== newNextMin;
          const hasMaxChange = max !== newNextMax;

          if ((hasMinChange || hasMaxChange) && (isMinValid && isMaxValid)) {
            helper.clearRefinements(attributeName);

            if (isValidNewNextMin) {
              helper.addNumericRefinement(
                attributeName,
                '>=',
                formatToNumber(newNextMin)
              );
            }

            if (isValidNewNextMax) {
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

        const isBoundsDefined = hasMinBound || hasMaxBound;

        const boundsAlreadyDefined =
          currentConfiguration &&
          currentConfiguration.numericRefinements &&
          currentConfiguration.numericRefinements[attributeName] !== undefined;

        const isMinBoundValid = _isFinite(minBound);
        const isMaxBoundValid = _isFinite(maxBound);
        const isAbleToRefine =
          isMinBoundValid && isMaxBoundValid
            ? minBound < maxBound
            : isMinBoundValid || isMaxBoundValid;

        if (isBoundsDefined && !boundsAlreadyDefined && isAbleToRefine) {
          configuration.numericRefinements = { [attributeName]: {} };

          if (hasMinBound) {
            configuration.numericRefinements[attributeName]['>='] = [minBound];
          }

          if (hasMaxBound) {
            configuration.numericRefinements[attributeName]['<='] = [maxBound];
          }
        }

        return configuration;
      },

      init({ helper, instantSearchInstance }) {
        const stats = {};
        const currentRange = this._getCurrentRange(stats);
        const start = this._getCurrentRefinement(helper);

        renderFn(
          {
            // On first render pass an empty range
            // to be able to bypass the validation
            // related to it
            refine: this._refine(helper, {}),
            format: rangeFormatter,
            range: currentRange,
            widgetParams: {
              ...widgetParams,
              precision,
            },
            start,
            instantSearchInstance,
          },
          true
        );
      },

      render({ results, helper, instantSearchInstance }) {
        const facetsFromResults = results.disjunctiveFacets || [];
        const facet = find(facetsFromResults, { name: attributeName });
        const stats = (facet && facet.stats) || {};

        const currentRange = this._getCurrentRange(stats);
        const start = this._getCurrentRefinement(helper);

        renderFn(
          {
            refine: this._refine(helper, currentRange),
            format: rangeFormatter,
            range: currentRange,
            widgetParams: {
              ...widgetParams,
              precision,
            },
            start,
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        const nextState = state
          .removeNumericRefinement(attributeName)
          .removeDisjunctiveFacet(attributeName);

        return nextState;
      },

      getWidgetState(uiState, { searchParameters }) {
        const {
          '>=': min = '',
          '<=': max = '',
        } = searchParameters.getNumericRefinements(attributeName);

        if (
          (min === '' && max === '') ||
          (uiState &&
            uiState.range &&
            uiState.range[attributeName] === `${min}:${max}`)
        ) {
          return uiState;
        }

        return {
          ...uiState,
          range: {
            ...uiState.range,
            [attributeName]: `${min}:${max}`,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const value = uiState && uiState.range && uiState.range[attributeName];

        if (!value || value.indexOf(':') === -1) {
          return searchParameters;
        }

        const {
          '>=': previousMin = [NaN],
          '<=': previousMax = [NaN],
        } = searchParameters.getNumericRefinements(attributeName);
        let clearedParams = searchParameters.clearRefinements(attributeName);
        const [lowerBound, upperBound] = value.split(':').map(parseFloat);

        if (
          previousMin.includes(lowerBound) &&
          previousMax.includes(upperBound)
        ) {
          return searchParameters;
        }

        if (_isFinite(lowerBound)) {
          clearedParams = clearedParams.addNumericRefinement(
            attributeName,
            '>=',
            lowerBound
          );
        }

        if (_isFinite(upperBound)) {
          clearedParams = clearedParams.addNumericRefinement(
            attributeName,
            '<=',
            upperBound
          );
        }

        return clearedParams;
      },
    };
  };
}
