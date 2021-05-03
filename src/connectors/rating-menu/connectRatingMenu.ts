import {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationLink,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';
import {
  Connector,
  InstantSearch,
  CreateURL,
  WidgetRenderState,
} from '../../types';
import { InsightsEvent } from '../../middlewares';

const withUsage = createDocumentationMessageGenerator({
  name: 'rating-menu',
  connector: true,
});

const $$type = 'ais.ratingMenu';

const MAX_VALUES_PER_FACET_API_LIMIT = 1000;
const STEP = 1;

type SendEvent = (...args: [InsightsEvent] | [string, string, string?]) => void;

type CreateSendEvent = (createSendEventArgs: {
  instantSearchInstance: InstantSearch;
  helper: AlgoliaSearchHelper;
  getRefinedStar: () => number | number[] | undefined;
  attribute: string;
}) => SendEvent;

const createSendEvent: CreateSendEvent = ({
  instantSearchInstance,
  helper,
  getRefinedStar,
  attribute,
}) => (...args) => {
  if (args.length === 1) {
    instantSearchInstance.sendEventToInsights(args[0]);
    return;
  }
  const [eventType, facetValue, eventName = 'Filter Applied'] = args;
  if (eventType !== 'click') {
    return;
  }
  const isRefined = getRefinedStar() === Number(facetValue);
  if (!isRefined) {
    instantSearchInstance.sendEventToInsights({
      insightsMethod: 'clickedFilters',
      widgetType: $$type,
      eventType,
      payload: {
        eventName,
        index: helper.getIndex(),
        filters: [`${attribute}>=${facetValue}`],
      },
      attribute,
    });
  }
};

type StarRatingItems = {
  /**
   * Name corresponding to the number of stars.
   */
  name: string;
  /**
   * Human-readable name corresponding to the number of stars.
   */
  label: string;
  /**
   * Number of stars as string.
   */
  value: string;
  /**
   * Count of matched results corresponding to the number of stars.
   */
  count: number;
  /**
   *  Array of length of maximum rating value with stars to display or not.
   */
  stars: boolean[];
  /**
   * Indicates if star rating refinement is applied.
   */
  isRefined: boolean;
};

export type RatingMenuConnectorParams = {
  /**
   * Name of the attribute for faceting (eg. "free_shipping").
   */
  attribute: string;

  /**
   * The maximum rating value.
   */
  max?: number;
};

export type RatingMenuRenderState = {
  /**
   * Possible star ratings the user can apply.
   */
  items: StarRatingItems[];

  /**
   * Creates an URL for the next state (takes the item value as parameter). Takes the value of an item as parameter.
   */
  createURL: CreateURL<string>;

  /**
   *  Indicates if search state can be refined.
   */
  canRefine: boolean;

  /**
   * Selects a rating to filter the results (takes the filter value as parameter). Takes the value of an item as parameter.
   */
  refine: (value: string) => void;

  /**
   * `true` if the last search contains no result.
   */
  hasNoResults: boolean;

  /**
   * Send event to insights middleware
   */
  sendEvent: SendEvent;
};

export type RatingMenuWidgetDescription = {
  $$type: 'ais.ratingMenu';
  renderState: RatingMenuRenderState;
  indexRenderState: {
    ratingMenu: {
      [attribute: string]: WidgetRenderState<
        RatingMenuRenderState,
        RatingMenuConnectorParams
      >;
    };
  };
  indexUiState: {
    ratingMenu: {
      [attribute: string]: number;
    };
  };
};

export type RatingMenuConnector = Connector<
  RatingMenuWidgetDescription,
  RatingMenuConnectorParams
>;

/**
 * **StarRating** connector provides the logic to build a custom widget that will let
 * the user refine search results based on ratings.
 *
 * The connector provides to the rendering: `refine()` to select a value and
 * `items` that are the values that can be selected. `refine` should be used
 * with `items.value`.
 */
const connectRatingMenu: RatingMenuConnector = function connectRatingMenu(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { attribute, max = 5 } = widgetParams || {};
    let sendEvent: SendEvent;

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    const getRefinedStar = (state: SearchParameters) => {
      const values = state.getNumericRefinements(attribute);

      if (!values['>=']?.length) {
        return undefined;
      }

      return values['>='][0];
    };

    const getFacetsMaxDecimalPlaces = (
      facetResults: SearchResults.FacetValue[]
    ) => {
      let maxDecimalPlaces = 0;
      facetResults.forEach(facetResult => {
        const [, decimal = ''] = facetResult.name.split('.');
        maxDecimalPlaces = Math.max(maxDecimalPlaces, decimal.length);
      });
      return maxDecimalPlaces;
    };

    const getFacetValuesWarningMessage = ({
      maxDecimalPlaces,
      maxFacets,
      maxValuesPerFacet,
    }: {
      maxDecimalPlaces: number;
      maxFacets: number;
      maxValuesPerFacet: number;
    }) => {
      const maxDecimalPlacesInRange = Math.max(
        0,
        Math.floor(Math.log10(MAX_VALUES_PER_FACET_API_LIMIT / max))
      );
      const maxFacetsInRange = Math.min(
        MAX_VALUES_PER_FACET_API_LIMIT,
        Math.pow(10, maxDecimalPlacesInRange) * max
      );

      const solutions: string[] = [];

      if (maxFacets > MAX_VALUES_PER_FACET_API_LIMIT) {
        solutions.push(
          `- Update your records to lower the precision of the values in the "${attribute}" attribute (for example: ${(5.123456789).toPrecision(
            maxDecimalPlaces + 1
          )} to ${(5.123456789).toPrecision(maxDecimalPlacesInRange + 1)})`
        );
      }
      if (maxValuesPerFacet < maxFacetsInRange) {
        solutions.push(
          `- Increase the maximum number of facet values to ${maxFacetsInRange} using the "configure" widget ${createDocumentationLink(
            { name: 'configure' }
          )} and the "maxValuesPerFacet" parameter https://www.algolia.com/doc/api-reference/api-parameters/maxValuesPerFacet/`
        );
      }

      return `The ${attribute} attribute can have ${maxFacets} different values (0 to ${max} with a maximum of ${maxDecimalPlaces} decimals = ${maxFacets}) but you retrieved only ${maxValuesPerFacet} facet values. Therefore the number of results that match the refinements can be incorrect.
    ${
      solutions.length
        ? `To resolve this problem you can:\n${solutions.join('\n')}`
        : ``
    }`;
    };

    function getRefinedState(state: SearchParameters, facetValue: string) {
      const isRefined = getRefinedStar(state) === Number(facetValue);

      const emptyState = state.resetPage().removeNumericRefinement(attribute!);

      if (!isRefined) {
        return emptyState
          .addNumericRefinement(attribute!, '<=', max)
          .addNumericRefinement(attribute!, '>=', Number(facetValue));
      }
      return emptyState;
    }

    const toggleRefinement = (
      helper: AlgoliaSearchHelper,
      facetValue: string
    ) => {
      sendEvent('click', facetValue);
      helper.setState(getRefinedState(helper.state, facetValue)).search();
    };

    type ConnectorState = {
      toggleRefinementFactory: (
        helper: AlgoliaSearchHelper
      ) => (facetValue: string) => void;
      createURLFactory: ({
        state,
        createURL,
      }: {
        state: SearchParameters;
        createURL: (createURLState: SearchParameters) => string;
      }) => (value: string) => string;
    };

    const connectorState: ConnectorState = {
      toggleRefinementFactory: helper => toggleRefinement.bind(null, helper),
      createURLFactory: ({ state, createURL }) => value =>
        createURL(getRefinedState(state, value)),
    };

    return {
      $$type,

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          ratingMenu: {
            ...renderState.ratingMenu,
            [attribute]: this.getWidgetRenderState(renderOptions),
          },
        };
      },

      getWidgetRenderState({
        helper,
        results,
        state,
        instantSearchInstance,
        createURL,
      }) {
        let facetValues: StarRatingItems[] = [];

        if (!sendEvent) {
          sendEvent = createSendEvent({
            instantSearchInstance,
            helper,
            getRefinedStar: () => getRefinedStar(helper.state),
            attribute,
          });
        }

        if (results) {
          const facetResults = results.getFacetValues(
            attribute,
            {}
          ) as SearchResults.FacetValue[];
          const maxValuesPerFacet = facetResults.length;

          const maxDecimalPlaces = getFacetsMaxDecimalPlaces(facetResults);
          const maxFacets = Math.pow(10, maxDecimalPlaces) * max;

          warning(
            maxFacets <= maxValuesPerFacet,
            getFacetValuesWarningMessage({
              maxDecimalPlaces,
              maxFacets,
              maxValuesPerFacet,
            })
          );

          const refinedStar = getRefinedStar(state);

          for (let star = STEP; star < max; star += STEP) {
            const isRefined = refinedStar === star;

            const count = facetResults
              .filter(f => Number(f.name) >= star && Number(f.name) <= max)
              .map(f => f.count)
              .reduce((sum, current) => sum + current, 0);

            if (refinedStar && !isRefined && count === 0) {
              // skip count==0 when at least 1 refinement is enabled
              // eslint-disable-next-line no-continue
              continue;
            }

            const stars = [...new Array(Math.floor(max / STEP))].map(
              (_v, i) => i * STEP < star
            );

            facetValues.push({
              stars,
              name: String(star),
              label: String(star),
              value: String(star),
              count,
              isRefined,
            });
          }
        }
        facetValues = facetValues.reverse();

        return {
          items: facetValues,
          hasNoResults: results ? results.nbHits === 0 : true,
          canRefine: facetValues.length > 0,
          refine: connectorState.toggleRefinementFactory(helper),
          sendEvent,
          createURL: connectorState.createURLFactory({ state, createURL }),
          widgetParams,
        };
      },

      dispose({ state }) {
        unmountFn();

        return state.removeNumericRefinement(attribute);
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const value = getRefinedStar(searchParameters);

        if (typeof value !== 'number') {
          return uiState;
        }

        return {
          ...uiState,
          ratingMenu: {
            ...uiState.ratingMenu,
            [attribute]: value,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const value = uiState.ratingMenu && uiState.ratingMenu[attribute];

        const withoutRefinements = searchParameters.clearRefinements(attribute);
        const withDisjunctiveFacet = withoutRefinements.addDisjunctiveFacet(
          attribute
        );

        if (!value) {
          return withDisjunctiveFacet.setQueryParameters({
            numericRefinements: {
              ...withDisjunctiveFacet.numericRefinements,
              [attribute]: {},
            },
          });
        }

        return withDisjunctiveFacet
          .addNumericRefinement(attribute, '<=', max)
          .addNumericRefinement(attribute, '>=', value);
      },
    };
  };
};

export default connectRatingMenu;
