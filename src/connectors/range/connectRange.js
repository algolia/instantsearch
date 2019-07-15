import {
  checkRendering,
  createDocumentationMessageGenerator,
  isFiniteNumber,
  find,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator(
  { name: 'range-input', connector: true },
  { name: 'range-slider', connector: true }
);

/**
 * @typedef {Object} CustomRangeWidgetOptions
 * @property {string} attribute Name of the attribute for faceting.
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
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const {
      attribute,
      min: minBound,
      max: maxBound,
      precision = 0,
    } = widgetParams;

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    const hasMinBound = isFiniteNumber(minBound);
    const hasMaxBound = isFiniteNumber(maxBound);

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
        } else if (isFiniteNumber(stats.min)) {
          min = stats.min;
        } else {
          min = 0;
        }

        let max;
        if (hasMaxBound) {
          max = maxBound;
        } else if (isFiniteNumber(stats.max)) {
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
        const [minValue] = helper.getNumericRefinement(attribute, '>=') || [];

        const [maxValue] = helper.getNumericRefinement(attribute, '<=') || [];

        const min = isFiniteNumber(minValue) ? minValue : -Infinity;
        const max = isFiniteNumber(maxValue) ? maxValue : Infinity;

        return [min, max];
      },

      _refine(helper, currentRange) {
        // eslint-disable-next-line complexity
        return ([nextMin, nextMax] = []) => {
          const { min: currentRangeMin, max: currentRangeMax } = currentRange;

          const [min] = helper.getNumericRefinement(attribute, '>=') || [];
          const [max] = helper.getNumericRefinement(attribute, '<=') || [];

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
          const isValidNewNextMin = isFiniteNumber(newNextMin);
          const isValidMinCurrentRange = isFiniteNumber(currentRangeMin);
          const isGreaterThanCurrentRange =
            isValidMinCurrentRange && currentRangeMin <= newNextMin;
          const isMinValid =
            isResetNewNextMin ||
            (isValidNewNextMin &&
              (!isValidMinCurrentRange || isGreaterThanCurrentRange));

          const isResetNewNextMax = newNextMax === undefined;
          const isValidNewNextMax = isFiniteNumber(newNextMax);
          const isValidMaxCurrentRange = isFiniteNumber(currentRangeMax);
          const isLowerThanRange =
            isValidMaxCurrentRange && currentRangeMax >= newNextMax;
          const isMaxValid =
            isResetNewNextMax ||
            (isValidNewNextMax &&
              (!isValidMaxCurrentRange || isLowerThanRange));

          const hasMinChange = min !== newNextMin;
          const hasMaxChange = max !== newNextMax;

          if ((hasMinChange || hasMaxChange) && (isMinValid && isMaxValid)) {
            helper.clearRefinements(attribute);

            if (isValidNewNextMin) {
              helper.addNumericRefinement(
                attribute,
                '>=',
                formatToNumber(newNextMin)
              );
            }

            if (isValidNewNextMax) {
              helper.addNumericRefinement(
                attribute,
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
          disjunctiveFacets: [attribute],
        };

        const isBoundsDefined = hasMinBound || hasMaxBound;

        const boundsAlreadyDefined =
          currentConfiguration &&
          currentConfiguration.numericRefinements &&
          currentConfiguration.numericRefinements[attribute] !== undefined;

        const isMinBoundValid = isFiniteNumber(minBound);
        const isMaxBoundValid = isFiniteNumber(maxBound);
        const isAbleToRefine =
          isMinBoundValid && isMaxBoundValid
            ? minBound < maxBound
            : isMinBoundValid || isMaxBoundValid;

        if (isBoundsDefined && !boundsAlreadyDefined && isAbleToRefine) {
          configuration.numericRefinements = { [attribute]: {} };

          if (hasMinBound) {
            configuration.numericRefinements[attribute]['>='] = [minBound];
          }

          if (hasMaxBound) {
            configuration.numericRefinements[attribute]['<='] = [maxBound];
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
        const facet = find(
          facetsFromResults,
          facetResult => facetResult.name === attribute
        );
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
          .removeNumericRefinement(attribute)
          .removeDisjunctiveFacet(attribute);

        return nextState;
      },

      getWidgetState(uiState, { searchParameters }) {
        const {
          '>=': min = '',
          '<=': max = '',
        } = searchParameters.getNumericRefinements(attribute);

        if (
          (min === '' && max === '') ||
          (uiState &&
            uiState.range &&
            uiState.range[attribute] === `${min}:${max}`)
        ) {
          return uiState;
        }

        return {
          ...uiState,
          range: {
            ...uiState.range,
            [attribute]: `${min}:${max}`,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const value = uiState && uiState.range && uiState.range[attribute];

        if (!value || value.indexOf(':') === -1) {
          return searchParameters;
        }

        const {
          '>=': previousMin = [NaN],
          '<=': previousMax = [NaN],
        } = searchParameters.getNumericRefinements(attribute);
        let clearedParams = searchParameters.clearRefinements(attribute);
        const [lowerBound, upperBound] = value.split(':').map(parseFloat);

        if (
          previousMin.includes(lowerBound) &&
          previousMax.includes(upperBound)
        ) {
          return searchParameters;
        }

        if (isFiniteNumber(lowerBound)) {
          clearedParams = clearedParams.addNumericRefinement(
            attribute,
            '>=',
            lowerBound
          );
        }

        if (isFiniteNumber(upperBound)) {
          clearedParams = clearedParams.addNumericRefinement(
            attribute,
            '<=',
            upperBound
          );
        }

        return clearedParams;
      },
    };
  };
}
