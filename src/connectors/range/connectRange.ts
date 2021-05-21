import {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  convertNumericRefinementsToFilters,
  isFiniteNumber,
  find,
  noop,
  SendEventForFacet,
} from '../../lib/utils';
import { InsightsEvent } from '../../middlewares';
import { Connector, InstantSearch, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator(
  { name: 'range-input', connector: true },
  { name: 'range-slider', connector: true }
);

const $$type = 'ais.range';

export type RangeMin = number | undefined;
export type RangeMax = number | undefined;

// @MAJOR: potentially we should consolidate these types
export type RangeBoundaries = [RangeMin, RangeMax];
export type Range = {
  min: RangeMin;
  max: RangeMax;
};

export type RangeRenderState = {
  /**
   * Sets a range to filter the results on. Both values
   * are optional, and will default to the higher and lower bounds. You can use `undefined` to remove a
   * previously set bound or to set an infinite bound.
   * @param rangeValue tuple of [min, max] bounds
   */
  refine(rangeValue: RangeBoundaries): void;

  /**
   * Indicates whether this widget can be refined
   */
  canRefine: boolean;

  /**
   * Send an event to the insights middleware
   */
  sendEvent: SendEventForFacet;

  /**
   * Maximum range possible for this search
   */
  range: Range;

  /**
   * Current refinement of the search
   */
  start: RangeBoundaries;

  /**
   * Transform for the rendering `from` and/or `to` values.
   * Both functions take a `number` as input and should output a `string`.
   */
  format: {
    from(fromValue: number): string;
    to(toValue: number): string;
  };
};

export type RangeConnectorParams = {
  /**
   * Name of the attribute for faceting.
   */
  attribute: string;

  /**
   * Minimal range value, default to automatically computed from the result set.
   */
  min?: number;

  /**
   * Maximal range value, default to automatically computed from the result set.
   */
  max?: number;

  /**
   * Number of digits after decimal point to use.
   */
  precision?: number;
};

export type RangeWidgetDescription = {
  $$type: 'ais.range';
  renderState: RangeRenderState;
  indexRenderState: {
    range: {
      [attribute: string]: WidgetRenderState<
        RangeRenderState,
        RangeConnectorParams
      >;
    };
  };
  indexUiState: {
    range: {
      // @TODO: this could possibly become `${number}:${number}` later
      [attribute: string]: string;
    };
  };
};

export type RangeConnector = Connector<
  RangeWidgetDescription,
  RangeConnectorParams
>;

function toPrecision({ min, max, precision }) {
  const pow = Math.pow(10, precision);

  return {
    min: min ? Math.floor(min * pow) / pow : min,
    max: max ? Math.ceil(max * pow) / pow : max,
  };
}

/**
 * **Range** connector provides the logic to create custom widget that will let
 * the user refine results using a numeric range.
 *
 * This connectors provides a `refine()` function that accepts bounds. It will also provide
 * information about the min and max bounds for the current result set.
 */
const connectRange: RangeConnector = function connectRange(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { attribute = '', min: minBound, max: maxBound, precision = 0 } =
      widgetParams || {};

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    if (
      isFiniteNumber(minBound) &&
      isFiniteNumber(maxBound) &&
      minBound > maxBound
    ) {
      throw new Error(withUsage("The `max` option can't be lower than `min`."));
    }

    const formatToNumber = (v: string | number) =>
      Number(Number(v).toFixed(precision));

    const rangeFormatter = {
      from: (v: number) => v.toLocaleString(),
      to: (v: number) => formatToNumber(v).toLocaleString(),
    };

    // eslint-disable-next-line complexity
    const getRefinedState = (
      helper: AlgoliaSearchHelper,
      currentRange: Range,
      nextMin: RangeMin | string,
      nextMax: RangeMax | string
    ) => {
      let resolvedState = helper.state;
      const { min: currentRangeMin, max: currentRangeMax } = currentRange;

      const [min] = resolvedState.getNumericRefinement(attribute, '>=') || [];
      const [max] = resolvedState.getNumericRefinement(attribute, '<=') || [];

      const isResetMin = nextMin === undefined || nextMin === '';
      const isResetMax = nextMax === undefined || nextMax === '';

      const { min: nextMinAsNumber, max: nextMaxAsNumber } = toPrecision({
        min: !isResetMin ? parseFloat(nextMin as string) : undefined,
        max: !isResetMax ? parseFloat(nextMax as string) : undefined,
        precision,
      });

      let newNextMin: RangeMin;
      if (!isFiniteNumber(minBound) && currentRangeMin === nextMinAsNumber) {
        newNextMin = undefined;
      } else if (isFiniteNumber(minBound) && isResetMin) {
        newNextMin = minBound;
      } else {
        newNextMin = nextMinAsNumber;
      }

      let newNextMax: RangeMax;
      if (!isFiniteNumber(maxBound) && currentRangeMax === nextMaxAsNumber) {
        newNextMax = undefined;
      } else if (isFiniteNumber(maxBound) && isResetMax) {
        newNextMax = maxBound;
      } else {
        newNextMax = nextMaxAsNumber;
      }

      const isResetNewNextMin = newNextMin === undefined;

      const isGreaterThanCurrentRange =
        isFiniteNumber(currentRangeMin) && currentRangeMin <= newNextMin!;
      const isMinValid =
        isResetNewNextMin ||
        (isFiniteNumber(newNextMin) &&
          (!isFiniteNumber(currentRangeMin) || isGreaterThanCurrentRange));

      const isResetNewNextMax = newNextMax === undefined;
      const isLowerThanRange =
        isFiniteNumber(newNextMax) && currentRangeMax! >= newNextMax;
      const isMaxValid =
        isResetNewNextMax ||
        (isFiniteNumber(newNextMax) &&
          (!isFiniteNumber(currentRangeMax) || isLowerThanRange));

      const hasMinChange = min !== newNextMin;
      const hasMaxChange = max !== newNextMax;

      if ((hasMinChange || hasMaxChange) && isMinValid && isMaxValid) {
        resolvedState = resolvedState.removeNumericRefinement(attribute);

        if (isFiniteNumber(newNextMin)) {
          resolvedState = resolvedState.addNumericRefinement(
            attribute,
            '>=',
            newNextMin
          );
        }

        if (isFiniteNumber(newNextMax)) {
          resolvedState = resolvedState.addNumericRefinement(
            attribute,
            '<=',
            newNextMax
          );
        }

        return resolvedState.resetPage();
      }

      return null;
    };

    const sendEventWithRefinedState = (
      refinedState: SearchParameters | null,
      instantSearchInstance: InstantSearch,
      helper: AlgoliaSearchHelper,
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
          attribute,
        });
      }
    };

    const createSendEvent = (
      instantSearchInstance: InstantSearch,
      helper: AlgoliaSearchHelper,
      currentRange: Range
    ) => (...args: [InsightsEvent] | [string, string, string?]) => {
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

    function _getCurrentRange(
      stats: Partial<NonNullable<SearchResults.Facet['stats']>>
    ) {
      let min: number;
      if (isFiniteNumber(minBound)) {
        min = minBound;
      } else if (isFiniteNumber(stats.min)) {
        min = stats.min;
      } else {
        min = 0;
      }

      let max: number;
      if (isFiniteNumber(maxBound)) {
        max = maxBound;
      } else if (isFiniteNumber(stats.max)) {
        max = stats.max;
      } else {
        max = 0;
      }

      return toPrecision({ min, max, precision });
    }

    function _getCurrentRefinement(
      helper: AlgoliaSearchHelper
    ): RangeBoundaries {
      const [minValue] = helper.getNumericRefinement(attribute, '>=') || [];

      const [maxValue] = helper.getNumericRefinement(attribute, '<=') || [];

      const min = isFiniteNumber(minValue) ? minValue : -Infinity;
      const max = isFiniteNumber(maxValue) ? maxValue : Infinity;

      return [min, max];
    }

    function _refine(
      instantSearchInstance: InstantSearch,
      helper: AlgoliaSearchHelper,
      currentRange: Range
    ) {
      return ([nextMin, nextMax]: RangeBoundaries = [undefined, undefined]) => {
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
    }

    return {
      $$type,

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

      getWidgetRenderState({ results, helper, instantSearchInstance }) {
        const facetsFromResults = (results && results.disjunctiveFacets) || [];
        const facet = find(
          facetsFromResults,
          facetResult => facetResult.name === attribute
        );
        const stats = (facet && facet.stats) || {
          min: undefined,
          max: undefined,
        };

        const currentRange = _getCurrentRange(stats);
        const start = _getCurrentRefinement(helper);

        let refine: ReturnType<typeof _refine>;

        if (!results) {
          // On first render pass an empty range
          // to be able to bypass the validation
          // related to it
          refine = _refine(instantSearchInstance, helper, {
            min: undefined,
            max: undefined,
          });
        } else {
          refine = _refine(instantSearchInstance, helper, currentRange);
        }

        return {
          refine,
          canRefine: currentRange.min !== currentRange.max,
          format: rangeFormatter,
          range: currentRange,
          sendEvent: createSendEvent(
            instantSearchInstance,
            helper,
            currentRange
          ),
          widgetParams: {
            ...widgetParams,
            precision,
          },
          start,
        };
      },

      dispose({ state }) {
        unmountFn();

        return state
          .removeDisjunctiveFacet(attribute)
          .removeNumericRefinement(attribute);
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

        if (isFiniteNumber(minBound)) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '>=',
            minBound
          );
        }

        if (isFiniteNumber(maxBound)) {
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

        if (
          isFiniteNumber(lowerBound) &&
          (!isFiniteNumber(minBound) || minBound < lowerBound)
        ) {
          widgetSearchParameters = widgetSearchParameters.removeNumericRefinement(
            attribute,
            '>='
          );
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '>=',
            lowerBound
          );
        }

        if (
          isFiniteNumber(upperBound) &&
          (!isFiniteNumber(maxBound) || upperBound < maxBound)
        ) {
          widgetSearchParameters = widgetSearchParameters.removeNumericRefinement(
            attribute,
            '<='
          );
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
};

export default connectRange;
