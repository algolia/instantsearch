import { createDocumentationMessageGenerator, noop } from '../lib/public';
import { checkRendering } from '../lib/utils';

import type { InstantSearch } from '../instantsearch';
import type {
  Connector,
  Expand,
  WidgetRenderState,
  SendEventForFacet,
} from '../types';
import type { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator(
  { name: 'range-input', connector: true },
  { name: 'range-slider', connector: true }
);

const $$type = 'ais.range';

export type RangeMin = number | undefined;
export type RangeMax = number | undefined;

export type Range = {
  min: RangeMin;
  max: RangeMax;
};

export type RangeRenderState = {
  /**
   * Sets a range to filter the results on. Both values
   * are optional, and will default to the higher and lower bounds. You can use `undefined` to remove a previously set bound.
   * @param rangeValue object with min and max bounds
   */
  refine: (rangeValue: Expand<Partial<Range>>) => void;

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
  currentRefinement: Range;

  /**
   * Transform for the rendering `from` and/or `to` values.
   * Both functions take a `number` as input and should output a `string`.
   */
  format: {
    from: (fromValue: number) => string;
    to: (toValue: number) => string;
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
      [attribute: string]: string;
    };
  };
};

export type RangeConnector = Connector<
  RangeWidgetDescription,
  RangeConnectorParams
>;

function toPrecision({
  min,
  max,
  precision,
}: {
  min?: number;
  max?: number;
  precision: number;
}) {
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
export const connectRange: RangeConnector = function connectRange(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const {
      attribute = '',
      min: minBound,
      max: maxBound,
      precision = 0,
    } = widgetParams || {};

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    if (
      Number.isFinite(minBound) &&
      Number.isFinite(maxBound) &&
      minBound! > maxBound!
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
      if (!Number.isFinite(minBound) && currentRangeMin === nextMinAsNumber) {
        newNextMin = undefined;
      } else if (Number.isFinite(minBound) && isResetMin) {
        newNextMin = minBound;
      } else {
        newNextMin = nextMinAsNumber;
      }

      let newNextMax: RangeMax;
      if (!Number.isFinite(maxBound) && currentRangeMax === nextMaxAsNumber) {
        newNextMax = undefined;
      } else if (Number.isFinite(maxBound) && isResetMax) {
        newNextMax = maxBound;
      } else {
        newNextMax = nextMaxAsNumber;
      }

      const isResetNewNextMin = newNextMin === undefined;

      const isGreaterThanCurrentRange =
        Number.isFinite(currentRangeMin) && currentRangeMin! <= newNextMin!;
      const isMinValid =
        isResetNewNextMin ||
        (Number.isFinite(newNextMin) &&
          (!Number.isFinite(currentRangeMin) || isGreaterThanCurrentRange));

      const isResetNewNextMax = newNextMax === undefined;
      const isLowerThanRange =
        Number.isFinite(newNextMax) && currentRangeMax! >= newNextMax!;
      const isMaxValid =
        isResetNewNextMax ||
        (Number.isFinite(newNextMax) &&
          (!Number.isFinite(currentRangeMax) || isLowerThanRange));

      const hasMinChange = min !== newNextMin;
      const hasMaxChange = max !== newNextMax;

      if ((hasMinChange || hasMaxChange) && isMinValid && isMaxValid) {
        resolvedState = resolvedState.removeNumericRefinement(attribute);

        if (Number.isFinite(newNextMin)) {
          resolvedState = resolvedState.addNumericRefinement(
            attribute,
            '>=',
            newNextMin!
          );
        }

        if (Number.isFinite(newNextMax)) {
          resolvedState = resolvedState.addNumericRefinement(
            attribute,
            '<=',
            newNextMax!
          );
        }

        return resolvedState.resetPage();
      }

      return null;
    };

    const createSendEvent =
      (instantSearchInstance: InstantSearch) =>
      (...args: Parameters<SendEventForFacet>) => {
        if (args.length === 1) {
          instantSearchInstance.sendEventToInsights(args[0]);
          return;
        }
      };

    function _getCurrentRange(
      stats: Partial<NonNullable<SearchResults.Facet['stats']>>
    ) {
      let min: number;
      if (Number.isFinite(minBound)) {
        min = minBound!;
      } else if (Number.isFinite(stats.min)) {
        min = stats.min!;
      } else {
        min = 0;
      }

      let max: number;
      if (Number.isFinite(maxBound)) {
        max = maxBound!;
      } else if (Number.isFinite(stats.max)) {
        max = stats.max!;
      } else {
        max = 0;
      }

      return toPrecision({ min, max, precision });
    }

    function _getCurrentRefinement(
      helper: AlgoliaSearchHelper,
      range: Range
    ): Range {
      const [minValue] = helper.getNumericRefinement(attribute, '>=') || [];

      const [maxValue] = helper.getNumericRefinement(attribute, '<=') || [];

      const min =
        typeof minValue === 'number' &&
        Number.isFinite(minValue) &&
        minValue !== range.min
          ? Math.min(minValue, range.max!)
          : undefined;
      const max =
        typeof maxValue === 'number' &&
        Number.isFinite(maxValue) &&
        maxValue !== range.max
          ? Math.max(maxValue, range.min!)
          : undefined;

      return { min, max };
    }

    function _refine(helper: AlgoliaSearchHelper, currentRange: Range) {
      return ({ min: nextMin, max: nextMax }: Partial<Range> = {}) => {
        const refinedState = getRefinedState(
          helper,
          currentRange,
          nextMin,
          nextMax
        );
        if (refinedState) {
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
        const facet = facetsFromResults.find(
          (facetResult) => facetResult.name === attribute
        );
        const stats = (facet && facet.stats) || {
          min: undefined,
          max: undefined,
        };

        const currentRange = _getCurrentRange(stats);
        const currentRefinement = _getCurrentRefinement(helper, currentRange);

        let refine: ReturnType<typeof _refine>;

        if (!results) {
          // On first render pass an empty range
          // to be able to bypass the validation
          // related to it
          refine = _refine(helper, {
            min: undefined,
            max: undefined,
          });
        } else {
          refine = _refine(helper, currentRange);
        }

        return {
          refine,
          canRefine: currentRange.min !== currentRange.max,
          format: rangeFormatter,
          range: currentRange,
          sendEvent: createSendEvent(instantSearchInstance),
          widgetParams: {
            ...widgetParams,
            precision,
          },
          currentRefinement,
        };
      },

      dispose() {
        unmountFn();
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const { '>=': min = [], '<=': max = [] } =
          searchParameters.getNumericRefinements(attribute);

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

        if (Number.isFinite(minBound)) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '>=',
            minBound!
          );
        }

        if (Number.isFinite(maxBound)) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '<=',
            maxBound!
          );
        }

        const value = uiState.range && uiState.range[attribute];

        if (!value || value.indexOf(':') === -1) {
          return widgetSearchParameters;
        }

        const [lowerBound, upperBound] = value.split(':').map(parseFloat);

        if (
          Number.isFinite(lowerBound) &&
          (!Number.isFinite(minBound) || minBound! < lowerBound)
        ) {
          widgetSearchParameters =
            widgetSearchParameters.removeNumericRefinement(attribute, '>=');
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(
            attribute,
            '>=',
            lowerBound
          );
        }

        if (
          Number.isFinite(upperBound) &&
          (!Number.isFinite(maxBound) || upperBound < maxBound!)
        ) {
          widgetSearchParameters =
            widgetSearchParameters.removeNumericRefinement(attribute, '<=');
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