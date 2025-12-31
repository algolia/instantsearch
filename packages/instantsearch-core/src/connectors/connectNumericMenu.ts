import { createDocumentationMessageGenerator, noop } from '../lib/public';
import { checkRendering } from '../lib/utils';

import type { InstantSearch } from '../instantsearch';
import type {
  Connector,
  CreateURL,
  IndexUiState,
  TransformItems,
  WidgetRenderState,
  SendEventForFacet,
} from '../types';
import type { SearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'numeric-menu',
  connector: true,
});

export type NumericMenuConnectorParamsItem = {
  /**
   * Name of the option
   */
  label: string;

  /**
   * Higher bound of the option (<=)
   */
  start?: number;

  /**
   * Lower bound of the option (>=)
   */
  end?: number;
};

type NumericMenuValue = Omit<NumericMenuConnectorParamsItem, 'label'>;

export type NumericMenuRenderStateItem = {
  /**
   *  Name of the option.
   */
  label: string;

  /**
   * The value of the option. It is a concatenation of the start and end values
   * in the form of `start:end`. For example, if the start is 10 and the end is
   * 20, the value will be `10:20`. If the start is 10 and the end is undefined,
   * the value will be `10:`. If the start and end are both the same, the value
   * will be `start:start`. For example, if the start is 10 and the end is 10,
   * the value will be `10:10`. If the start and end are both undefined, the
   * value will be `:`.
   */
  value: string;

  /**
   * True if the value is selected
   */
  isRefined: boolean;
};

export type NumericMenuConnectorParams = {
  /**
   * Name of the attribute for filtering
   */
  attribute: string;

  /**
   * List of all the items
   */
  items: NumericMenuConnectorParamsItem[];

  /**
   * Function to transform the items passed to the templates
   */
  transformItems?: TransformItems<NumericMenuRenderStateItem>;
};

export type NumericMenuRenderState = {
  /**
   * The list of available choices
   */
  items: NumericMenuRenderStateItem[];

  /**
   * Creates URLs for the next state, the string is the name of the selected option
   */
  createURL: CreateURL<NumericMenuRenderStateItem['value']>;

  /**
   * Indicates if search state can be refined.
   *
   * This is `true` if the last search contains no result and
   * "All" range is selected
   */
  canRefine: boolean;

  /**
   * Sets the selected value and trigger a new search
   */
  refine: (facetValue: string) => void;

  /**
   * Send event to insights middleware
   */
  sendEvent: SendEventForFacet;
};

export type NumericMenuWidgetDescription = {
  $$type: 'ais.numericMenu';
  renderState: NumericMenuRenderState;
  indexRenderState: {
    numericMenu: {
      [attribute: string]: WidgetRenderState<
        NumericMenuRenderState,
        NumericMenuConnectorParams
      >;
    };
  };
  indexUiState: {
    numericMenu: {
      [attribute: string]: string;
    };
  };
};

export type NumericMenuConnector = Connector<
  NumericMenuWidgetDescription,
  NumericMenuConnectorParams
>;

const $$type = 'ais.numericMenu';

const createSendEvent =
  ({ instantSearchInstance }: { instantSearchInstance: InstantSearch }) =>
  (...args: Parameters<SendEventForFacet>) => {
    if (args.length === 1) {
      instantSearchInstance.sendEventToInsights(args[0]);
      return;
    }
  };

export const connectNumericMenu: NumericMenuConnector =
  function connectNumericMenu(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        attribute = '',
        items = [],
        transformItems = ((item) => item) as NonNullable<
          NumericMenuConnectorParams['transformItems']
        >,
      } = widgetParams || {};

      if (attribute === '') {
        throw new Error(withUsage('The `attribute` option is required.'));
      }

      if (!items || items.length === 0) {
        throw new Error(
          withUsage('The `items` option expects an array of objects.')
        );
      }

      type ConnectorState = {
        refine?: (facetValue: string) => void;
        createURL?: (state: SearchParameters) => (facetValue: string) => string;
        sendEvent?: SendEventForFacet;
      };

      const prepareItems = (state: SearchParameters) =>
        items.map(({ start, end, label }) => ({
          label,
          value: `${start || ''}:${end || ''}`,
          isRefined: isRefined(state, attribute, { start, end }),
        }));

      const connectorState: ConnectorState = {};

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

        dispose() {
          unmountFn();
        },

        getWidgetUiState(uiState, { searchParameters }) {
          const values = searchParameters.getNumericRefinements(attribute);

          const min = ((values['>='] && values['>='][0]) ||
            undefined) as number;
          const max = ((values['<='] && values['<='][0]) ||
            undefined) as number;

          return removeEmptyRefinementsFromUiState(
            {
              ...uiState,
              numericMenu: {
                ...uiState.numericMenu,
                [attribute]: valueToString({ start: min, end: max }),
              },
            },
            attribute
          );
        },

        getWidgetSearchParameters(searchParameters, { uiState }) {
          let value = uiState.numericMenu && uiState.numericMenu[attribute];

          const withoutRefinements = searchParameters.setQueryParameters({
            numericRefinements: {
              ...searchParameters.numericRefinements,
              [attribute]: {},
            },
          });

          if (!value) {
            return withoutRefinements;
          }

          // Backwards compatibility: previous to v5 the value was just a number
          // if start and end were the same.
          if (value.indexOf(':') === -1) {
            value = `${value}:${value}`;
          }

          const { start, end } = stringToValue(value);

          const withMinRefinement = Number.isFinite(start)
            ? withoutRefinements.addNumericRefinement(attribute, '>=', start!)
            : withoutRefinements;

          const withMaxRefinement = Number.isFinite(end)
            ? withMinRefinement.addNumericRefinement(attribute, '<=', end!)
            : withMinRefinement;

          return withMaxRefinement;
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            numericMenu: {
              ...renderState.numericMenu,
              [attribute]: this.getWidgetRenderState(renderOptions),
            },
          };
        },

        getWidgetRenderState({
          results,
          state,
          instantSearchInstance,
          helper,
          createURL,
        }) {
          if (!connectorState.refine) {
            connectorState.refine = (facetValue) => {
              const refinedState = getRefinedState(
                helper.state,
                attribute,
                facetValue
              );
              connectorState.sendEvent!('click:internal', facetValue);
              helper.setState(refinedState).search();
            };
          }

          if (!connectorState.createURL) {
            connectorState.createURL = (newState) => (facetValue) =>
              createURL((uiState) =>
                this.getWidgetUiState(uiState, {
                  searchParameters: getRefinedState(
                    newState,
                    attribute,
                    facetValue
                  ),
                  helper,
                })
              );
          }

          if (!connectorState.sendEvent) {
            connectorState.sendEvent = createSendEvent({
              instantSearchInstance,
            });
          }

          const hasNoResults = results ? results.nbHits === 0 : true;
          const preparedItems = prepareItems(state);
          let allIsSelected = true;
          for (const item of preparedItems) {
            if (item.isRefined && decodeURI(item.value) !== '{}') {
              allIsSelected = false;
              break;
            }
          }

          return {
            createURL: connectorState.createURL(state),
            items: transformItems(preparedItems, { results }),
            canRefine: !(hasNoResults && allIsSelected),
            refine: connectorState.refine,
            sendEvent: connectorState.sendEvent,
            widgetParams,
          };
        },
      };
    };
  };

function stringToValue(value: string): NumericMenuValue {
  const [start, end] = value
    .split(':')
    .map((v) => (v ? parseFloat(v) : undefined));
  return { start, end };
}

function valueToString(value: NumericMenuValue): string {
  return `${value.start || ''}:${value.end || ''}`;
}

function isRefined(
  state: SearchParameters,
  attribute: string,
  option: NumericMenuValue
) {
  const currentRefinements = state.getNumericRefinements(attribute);

  if (option.start !== undefined && option.end !== undefined) {
    return (
      hasNumericRefinement(currentRefinements, '>=', option.start) &&
      hasNumericRefinement(currentRefinements, '<=', option.end)
    );
  }

  if (option.start !== undefined) {
    return hasNumericRefinement(currentRefinements, '>=', option.start);
  }

  if (option.end !== undefined) {
    return hasNumericRefinement(currentRefinements, '<=', option.end);
  }

  if (option.start === undefined && option.end === undefined) {
    return (
      Object.keys(currentRefinements) as SearchParameters.Operator[]
    ).every((operator) => (currentRefinements[operator] || []).length === 0);
  }

  return false;
}

function getRefinedState(
  state: SearchParameters,
  attribute: string,
  facetValue: string
) {
  let resolvedState = state.removeNumericRefinement(attribute).setPage(0);

  const { start, end } = stringToValue(facetValue);
  if (start !== undefined && end !== undefined && start > end) {
    throw new Error('option.start should be > to option.end');
  }

  if (start !== undefined) {
    resolvedState = resolvedState.addNumericRefinement(attribute, '>=', start);
  }

  if (end !== undefined) {
    resolvedState = resolvedState.addNumericRefinement(attribute, '<=', end);
  }

  return resolvedState;
}

function hasNumericRefinement(
  currentRefinements: SearchParameters.OperatorList,
  operator: SearchParameters.Operator,
  value: number
) {
  return (
    currentRefinements[operator] !== undefined &&
    currentRefinements[operator]!.includes(value)
  );
}

function removeEmptyRefinementsFromUiState(
  indexUiState: IndexUiState,
  attribute: string
): IndexUiState {
  if (!indexUiState.numericMenu) {
    return indexUiState;
  }

  if (indexUiState.numericMenu[attribute] === ':') {
    delete indexUiState.numericMenu[attribute];
  }

  if (Object.keys(indexUiState.numericMenu).length === 0) {
    delete indexUiState.numericMenu;
  }

  return indexUiState;
}
