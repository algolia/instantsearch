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

export type NumericMenuRenderStateItem = {
  /**
   *  Name of the option.
   */
  label: string;

  /**
   * URL encoded of the bounds object with the form `{start, end}`.
   * This value can be used verbatim in the webpage and can be read by `refine`
   * directly. If you want to inspect the value, you can do:
   * `JSON.parse(decodeURI(value))` to get the object.
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
      // @TODO: this could possibly become `${number}:${number}` later
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
          value: encodeURI(JSON.stringify({ start, end })),
          isRefined: isRefined(state, attribute, { start, end, label }),
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

        dispose({ state }) {
          unmountFn();
          return state.removeNumericRefinement(attribute);
        },

        getWidgetUiState(uiState, { searchParameters }) {
          const values = searchParameters.getNumericRefinements(attribute);

          const equal = values['='] && values['='][0];

          if (equal || equal === 0) {
            return {
              ...uiState,
              numericMenu: {
                ...uiState.numericMenu,
                [attribute]: `${values['=']}`,
              },
            };
          }

          const min = (values['>='] && values['>='][0]) || '';
          const max = (values['<='] && values['<='][0]) || '';

          return removeEmptyRefinementsFromUiState(
            {
              ...uiState,
              numericMenu: {
                ...uiState.numericMenu,
                [attribute]: `${min}:${max}`,
              },
            },
            attribute
          );
        },

        getWidgetSearchParameters(searchParameters, { uiState }) {
          const value = uiState.numericMenu && uiState.numericMenu[attribute];

          const withoutRefinements = searchParameters.setQueryParameters({
            numericRefinements: {
              ...searchParameters.numericRefinements,
              [attribute]: {},
            },
          });

          if (!value) {
            return withoutRefinements;
          }

          const isExact = value.indexOf(':') === -1;

          if (isExact) {
            return withoutRefinements.addNumericRefinement(
              attribute,
              '=',
              Number(value)
            );
          }

          const [min, max] = value.split(':').map(parseFloat);

          const withMinRefinement = Number.isFinite(min)
            ? withoutRefinements.addNumericRefinement(attribute, '>=', min)
            : withoutRefinements;

          const withMaxRefinement = Number.isFinite(max)
            ? withMinRefinement.addNumericRefinement(attribute, '<=', max)
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

function isRefined(
  state: SearchParameters,
  attribute: string,
  option: NumericMenuConnectorParamsItem
) {
  // @TODO: same as another spot, why is this mixing arrays & elements?
  const currentRefinements = state.getNumericRefinements(attribute);

  if (option.start !== undefined && option.end !== undefined) {
    if (option.start === option.end) {
      return hasNumericRefinement(currentRefinements, '=', option.start);
    } else {
      return (
        hasNumericRefinement(currentRefinements, '>=', option.start) &&
        hasNumericRefinement(currentRefinements, '<=', option.end)
      );
    }
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
  let resolvedState = state;

  const refinedOption = JSON.parse(decodeURI(facetValue));

  // @TODO: why is array / element mixed here & hasRefinements; seems wrong?
  const currentRefinements = resolvedState.getNumericRefinements(attribute);

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return resolvedState.removeNumericRefinement(attribute);
  }

  if (!isRefined(resolvedState, attribute, refinedOption)) {
    resolvedState = resolvedState.removeNumericRefinement(attribute);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        resolvedState = resolvedState.removeNumericRefinement(
          attribute,
          '=',
          refinedOption.start
        );
      } else {
        resolvedState = resolvedState.addNumericRefinement(
          attribute,
          '=',
          refinedOption.start
        );
      }
      return resolvedState;
    }
  }

  if (refinedOption.start !== undefined) {
    if (hasNumericRefinement(currentRefinements, '>=', refinedOption.start)) {
      resolvedState = resolvedState.removeNumericRefinement(
        attribute,
        '>=',
        refinedOption.start
      );
    }
    resolvedState = resolvedState.addNumericRefinement(
      attribute,
      '>=',
      refinedOption.start
    );
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      resolvedState = resolvedState.removeNumericRefinement(
        attribute,
        '<=',
        refinedOption.end
      );
    }
    resolvedState = resolvedState.addNumericRefinement(
      attribute,
      '<=',
      refinedOption.end
    );
  }

  if (typeof resolvedState.page === 'number') {
    resolvedState.page = 0;
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
