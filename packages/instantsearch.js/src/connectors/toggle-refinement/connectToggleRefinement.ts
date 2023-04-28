import {
  checkRendering,
  escapeFacetValue,
  createDocumentationMessageGenerator,
  find,
  noop,
  toArray,
  warning,
} from '../../lib/utils';

import type {
  Connector,
  CreateURL,
  InstantSearch,
  WidgetRenderState,
} from '../../types';
import type {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'toggle-refinement',
  connector: true,
});

const $$type = 'ais.toggleRefinement';

type BuiltInSendEventForToggle = (
  eventType: string,
  isRefined: boolean,
  eventName?: string
) => void;
type CustomSendEventForToggle = (customPayload: any) => void;

export type SendEventForToggle = BuiltInSendEventForToggle &
  CustomSendEventForToggle;

const createSendEvent = ({
  instantSearchInstance,
  helper,
  attribute,
  on,
}: {
  instantSearchInstance: InstantSearch;
  helper: AlgoliaSearchHelper;
  attribute: string;
  on: string[] | undefined;
}) => {
  const sendEventForToggle: SendEventForToggle = (...args: any[]) => {
    if (args.length === 1) {
      instantSearchInstance.sendEventToInsights(args[0]);
      return;
    }
    const [, isRefined, eventName = 'Filter Applied'] = args;
    const [eventType, eventModifier] = args[0].split(':');
    if (eventType !== 'click' || on === undefined) {
      return;
    }

    // only send an event when the refinement gets applied,
    // not when it gets removed
    if (!isRefined) {
      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'clickedFilters',
        widgetType: $$type,
        eventType,
        eventModifier,
        payload: {
          eventName,
          index: helper.getIndex(),
          filters: on.map((value) => `${attribute}:${value}`),
        },
        attribute,
      });
    }
  };
  return sendEventForToggle;
};

export type ToggleRefinementValue = {
  /**
   * Whether this option is enabled.
   */
  isRefined: boolean;
  /**
   * Number of result if this option is toggled.
   */
  count: number | null;
};

export type ToggleRefinementConnectorParams = {
  /**
   * Name of the attribute for faceting (e.g., "free_shipping").
   */
  attribute: string;
  /**
   * Value to filter on when toggled.
   * @default "true"
   */
  on?: FacetValue | FacetValue[];
  /**
   * Value to filter on when not toggled.
   */
  off?: FacetValue | FacetValue[];
};

type FacetValue = string | boolean | number;

export type ToggleRefinementRenderState = {
  /** The current toggle value */
  value: {
    /**
     * The attribute name of this toggle.
     */
    name: string;
    /**
     * Whether the current option is "on" (true) or "off" (false)
     */
    isRefined: boolean;
    /**
     * Number of results if this option is toggled.
     */
    count: number | null;
    /**
     * Information about the "on" toggle.
     */
    onFacetValue: ToggleRefinementValue;
    /**
     * Information about the "off" toggle.
     */
    offFacetValue: ToggleRefinementValue;
  };
  /**
   * Creates an URL for the next state.
   */
  createURL: CreateURL<string>;
  /**
   * Send a "Facet Clicked" Insights event.
   */
  sendEvent: SendEventForToggle;
  /**
   * Indicates if search state can be refined.
   */
  canRefine: boolean;
  /**
   * Updates to the next state by applying the toggle refinement.
   */
  refine: (value?: { isRefined: boolean }) => void;
};

export type ToggleRefinementWidgetDescription = {
  $$type: 'ais.toggleRefinement';
  renderState: ToggleRefinementRenderState;
  indexRenderState: {
    toggleRefinement: {
      [attribute: string]: WidgetRenderState<
        ToggleRefinementRenderState,
        ToggleRefinementConnectorParams
      >;
    };
  };
  indexUiState: {
    toggle: {
      [attribute: string]: boolean;
    };
  };
};

export type ToggleRefinementConnector = Connector<
  ToggleRefinementWidgetDescription,
  ToggleRefinementConnectorParams
>;

/**
 * **Toggle** connector provides the logic to build a custom widget that will provide
 * an on/off filtering feature based on an attribute value or values.
 *
 * Two modes are implemented in the custom widget:
 *  - with or without the value filtered
 *  - switch between two values.
 */
const connectToggleRefinement: ToggleRefinementConnector =
  function connectToggleRefinement(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const { attribute, on: userOn = true, off: userOff } = widgetParams || {};

      if (!attribute) {
        throw new Error(withUsage('The `attribute` option is required.'));
      }

      const hasAnOffValue = userOff !== undefined;
      // even though facet values can be numbers and boolean,
      // the helper methods only accept string in the type
      const on = toArray(userOn).map(escapeFacetValue) as string[];
      const off = hasAnOffValue
        ? (toArray(userOff).map(escapeFacetValue) as string[])
        : undefined;

      let sendEvent: SendEventForToggle;

      const toggleRefinementFactory =
        (helper: AlgoliaSearchHelper) =>
        (
          {
            isRefined,
          }: {
            isRefined: boolean;
          } = { isRefined: false }
        ) => {
          if (!isRefined) {
            sendEvent('click:internal', isRefined);
            if (hasAnOffValue) {
              off!.forEach((v) =>
                helper.removeDisjunctiveFacetRefinement(attribute, v)
              );
            }

            on.forEach((v) =>
              helper.addDisjunctiveFacetRefinement(attribute, v)
            );
          } else {
            on.forEach((v) =>
              helper.removeDisjunctiveFacetRefinement(attribute, v)
            );

            if (hasAnOffValue) {
              off!.forEach((v) =>
                helper.addDisjunctiveFacetRefinement(attribute, v)
              );
            }
          }

          helper.search();
        };

      const connectorState = {
        createURLFactory:
          (
            isRefined: boolean,
            {
              state,
              createURL,
            }: {
              state: SearchParameters;
              createURL: (parameters: SearchParameters) => string;
            }
          ) =>
          () => {
            state = state.resetPage();

            const valuesToRemove = isRefined ? on : off;
            if (valuesToRemove) {
              valuesToRemove.forEach((v) => {
                state = state.removeDisjunctiveFacetRefinement(attribute, v);
              });
            }

            const valuesToAdd = isRefined ? off : on;
            if (valuesToAdd) {
              valuesToAdd.forEach((v) => {
                state = state.addDisjunctiveFacetRefinement(attribute, v);
              });
            }

            return createURL(state);
          },
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

        dispose({ state }) {
          unmountFn();

          return state.removeDisjunctiveFacet(attribute);
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            toggleRefinement: {
              ...renderState.toggleRefinement,
              [attribute]: this.getWidgetRenderState(renderOptions),
            },
          };
        },

        getWidgetRenderState({
          state,
          helper,
          results,
          createURL,
          instantSearchInstance,
        }) {
          const isRefined = results
            ? on.every((v) => state.isDisjunctiveFacetRefined(attribute, v))
            : on.every((v) => state.isDisjunctiveFacetRefined(attribute, v));

          let onFacetValue: ToggleRefinementValue = {
            isRefined,
            count: 0,
          };

          let offFacetValue: ToggleRefinementValue = {
            isRefined: hasAnOffValue && !isRefined,
            count: 0,
          };

          if (results) {
            const offValue = toArray(off || false);
            const allFacetValues = (results.getFacetValues(attribute, {}) ||
              []) as SearchResults.FacetValue[];

            const onData = on
              .map((v) =>
                find(
                  allFacetValues,
                  ({ escapedValue }) =>
                    escapedValue === escapeFacetValue(String(v))
                )
              )
              .filter((v): v is SearchResults.FacetValue => v !== undefined);

            const offData = hasAnOffValue
              ? offValue
                  .map((v) =>
                    find(
                      allFacetValues,
                      ({ escapedValue }) =>
                        escapedValue === escapeFacetValue(String(v))
                    )
                  )
                  .filter((v): v is SearchResults.FacetValue => v !== undefined)
              : [];

            onFacetValue = {
              isRefined: onData.length
                ? onData.every((v) => v.isRefined)
                : false,
              count: onData.reduce((acc, v) => acc + v.count, 0) || null,
            };

            offFacetValue = {
              isRefined: offData.length
                ? offData.every((v) => v.isRefined)
                : false,
              count:
                offData.reduce((acc, v) => acc + v.count, 0) ||
                allFacetValues.reduce((total, { count }) => total + count, 0),
            };
          }

          if (!sendEvent) {
            sendEvent = createSendEvent({
              instantSearchInstance,
              attribute,
              on,
              helper,
            });
          }
          const nextRefinement = isRefined ? offFacetValue : onFacetValue;

          return {
            value: {
              name: attribute,
              isRefined,
              count: results ? nextRefinement.count : null,
              onFacetValue,
              offFacetValue,
            },
            createURL: connectorState.createURLFactory(isRefined, {
              state,
              createURL,
            }),
            sendEvent,
            canRefine: Boolean(results ? nextRefinement.count : null),
            refine: toggleRefinementFactory(helper),
            widgetParams,
          };
        },

        getWidgetUiState(uiState, { searchParameters }) {
          const isRefined =
            on &&
            on.every((v) =>
              searchParameters.isDisjunctiveFacetRefined(attribute, v)
            );

          if (!isRefined) {
            return uiState;
          }

          return {
            ...uiState,
            toggle: {
              ...uiState.toggle,
              [attribute]: isRefined,
            },
          };
        },

        getWidgetSearchParameters(searchParameters, { uiState }) {
          if (
            searchParameters.isHierarchicalFacet(attribute) ||
            searchParameters.isConjunctiveFacet(attribute)
          ) {
            warning(
              false,
              `ToggleRefinement: Attribute "${attribute}" is already used by another widget of a different type.
As this is not supported, please make sure to remove this other widget or this ToggleRefinement widget will not work at all.`
            );

            return searchParameters;
          }

          let withFacetConfiguration = searchParameters
            .clearRefinements(attribute)
            .addDisjunctiveFacet(attribute);

          const isRefined = Boolean(
            uiState.toggle && uiState.toggle[attribute]
          );

          if (isRefined) {
            if (on) {
              on.forEach((v) => {
                withFacetConfiguration =
                  withFacetConfiguration.addDisjunctiveFacetRefinement(
                    attribute,
                    v
                  );
              });
            }

            return withFacetConfiguration;
          }

          // It's not refined with an `off` value
          if (hasAnOffValue) {
            if (off) {
              off.forEach((v) => {
                withFacetConfiguration =
                  withFacetConfiguration.addDisjunctiveFacetRefinement(
                    attribute,
                    v
                  );
              });
            }
            return withFacetConfiguration;
          }

          // It's not refined without an `off` value
          return withFacetConfiguration.setQueryParameters({
            disjunctiveFacetsRefinements: {
              ...searchParameters.disjunctiveFacetsRefinements,
              [attribute]: [],
            },
          });
        },
      };
    };
  };

export default connectToggleRefinement;
