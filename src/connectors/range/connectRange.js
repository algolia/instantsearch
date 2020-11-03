import {
  checkRendering,
  createDocumentationMessageGenerator,
  convertNumericRefinementsToFilters,
  isFiniteNumber,
  find,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator(
  { name: 'range-input', connector: true },
  { name: 'range-slider', connector: true }
);

const $$type = 'ais.range';

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
export default function connectRange(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const {
      attribute,
      min: minBound,
      max: maxBound,
      precision = 0,
    } = widgetParams;

    const hasMinBound = isFiniteNumber(minBound);
    const hasMaxBound = isFiniteNumber(maxBound);

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    if (hasMinBound && hasMaxBound && minBound > maxBound) {
      throw new Error(withUsage("The `max` option can't be lower than `min`."));
    }

    const formatToNumber = v => Number(Number(v).toFixed(precision));

    const rangeFormatter = {
      from: v => v,
      to: v => formatToNumber(v).toLocaleString(),
    };

    // eslint-disable-next-line complexity
    const getRefinedState = (helper, currentRange, nextMin, nextMax) => {
      let resolvedState = helper.state;
      const { min: currentRangeMin, max: currentRangeMax } = currentRange;

      const [min] = resolvedState.getNumericRefinement(attribute, '>=') || [];
      const [max] = resolvedState.getNumericRefinement(attribute, '<=') || [];

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
        (isValidNewNextMax && (!isValidMaxCurrentRange || isLowerThanRange));

      const hasMinChange = min !== newNextMin;
      const hasMaxChange = max !== newNextMax;

      if ((hasMinChange || hasMaxChange) && isMinValid && isMaxValid) {
        resolvedState = resolvedState.removeNumericRefinement(attribute);

        if (isValidNewNextMin) {
          resolvedState = resolvedState.addNumericRefinement(
            attribute,
            '>=',
            formatToNumber(newNextMin)
          );
        }

        if (isValidNewNextMax) {
          resolvedState = resolvedState.addNumericRefinement(
            attribute,
            '<=',
            formatToNumber(newNextMax)
          );
        }

        return resolvedState;
      }

      return null;
    };

    const sendEventWithRefinedState = (
      refinedState,
      instantSearchInstance,
      helper,
      eventName = 'Filter Applied'
    ) => {
      const filters = convertNumericRefinementsToFilters(
        refinedState,
        attribute
      );
      if (filters && filters.length > 0) {
        instantSearchInstance.sendEventToInsights({
          insightsMethod: 'clickedFilters',
          widgetType: $$type,
          eventType: 'click',
          payload: {
            eventName,
            index: helper.getIndex(),
            filters,
          },
        });
      }
    };

    const createSendEvent = (instantSearchInstance, helper, currentRange) => (
      ...args
    ) => {
      if (args.length === 1) {
        instantSearchInstance.sendEventToInsights(args[0]);
        return;
      }

      const [eventType, facetValue, eventName] = args;
      if (eventType !== 'click') {
        return;
      }
      const [nextMin, nextMax] = facetValue;
      const refinedState = getRefinedState(
        helper,
        currentRange,
        nextMin,
        nextMax
      );
      sendEventWithRefinedState(
        refinedState,
        instantSearchInstance,
        helper,
        eventName
      );
    };

    return {
      $$type,

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

      _refine(instantSearchInstance, helper, currentRange) {
        // eslint-disable-next-line complexity
        return ([nextMin, nextMax] = []) => {
          const refinedState = getRefinedState(
            helper,
            currentRange,
            nextMin,
            nextMax
          );
          if (refinedState) {
            sendEventWithRefinedState(
              refinedState,
              instantSearchInstance,
              helper
            );
            helper.setState(refinedState).search();
          }
        };
      },

      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          range: {
            ...renderState.range,
            [attribute]: this.getWidgetRenderState(renderOptions),
          },
        };
      },

      getWidgetRenderState({ results, instantSearchInstance, helper }) {
        const facetsFromResults = (results && results.disjunctiveFacets) || [];
        const facet = find(
          facetsFromResults,
          facetResult => facetResult.name === attribute
        );
        const stats = (facet && facet.stats) || {};

        const currentRange = this._getCurrentRange(stats);
        const start = this._getCurrentRefinement(helper);

        let refine;

        if (!results) {
          // On first render pass an empty range
          // to be able to bypass the validation
          // related to it
          refine = this._refine(instantSearchInstance, helper, {});
        } else {
          refine = this._refine(instantSearchInstance, helper, currentRange);
        }

        return {
          refine,
          sendEvent: createSendEvent(
            instantSearchInstance,
            helper,
            currentRange
          ),
          format: rangeFormatter,
          range: currentRange,
          widgetParams: {
            ...widgetParams,
            precision,
          },
          start,
        };
      },

      dispose({ state }) {
        unmountFn();

        const stateWithoutDisjunctive = state.removeDisjunctiveFacet(attribute);

        // can not use setQueryParameters || removeNumericRefinement, because
        // they both keep the old value. This isn't immutable, but it is fine
        // since it's already a copy.
        stateWithoutDisjunctive.numericRefinements = {
          ...state.numericRefinements,
          [attribute]: undefined,
        };

        return stateWithoutDisjunctive;
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const {
          '>=': min = [],
          '<=': max = [],
        } = searchParameters.getNumericRefinements(attribute);

        if (min.length === 0 && max.length === 0) {
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
        let widgetSearchParameters = searchParameters
          .addDisjunctiveFacet(attribute)
          .setQueryParameters({
            numericRefinements: {
              ...searchParameters.numericRefinements,
              [attribute]: {},
            },
          });

        if (hasMinBound) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '>=',
            minBound
          );
        }

        if (hasMaxBound) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '<=',
            maxBound
          );
        }

        const value = uiState.range && uiState.range[attribute];

        if (!value || value.indexOf(':') === -1) {
          return widgetSearchParameters;
        }

        const [lowerBound, upperBound] = value.split(':').map(parseFloat);

        if (isFiniteNumber(lowerBound)) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '>=',
            lowerBound
          );
        }

        if (isFiniteNumber(upperBound)) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '<=',
            upperBound
          );
        }

        return widgetSearchParameters;
      },
    };
  };
}
