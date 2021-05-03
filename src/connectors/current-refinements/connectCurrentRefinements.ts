import {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import {
  getRefinements,
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';
import {
  Refinement,
  FacetRefinement,
  NumericRefinement,
} from '../../lib/utils/getRefinements';
import {
  Connector,
  TransformItems,
  CreateURL,
  WidgetRenderState,
} from '../../types';

export type CurrentRefinementsConnectorParamsRefinement = {
  /**
   * The attribute on which the refinement is applied.
   */
  attribute: string;

  /**
   * The type of the refinement.
   *
   * It can be one of those: 'facet'|'exclude'|'disjunctive'|'hierarchical'|'numeric'|'query'|'tag'.
   */
  type: string;

  /**
   * The raw value of the refinement.
   */
  value: string | number;

  /**
   * The label of the refinement to display.
   */
  label: string;

  /**
   * The value of the operator (only if applicable).
   */
  operator?: string;

  /**
   * The number of found items (only if applicable).
   */
  count?: number;

  /**
   * Whether the count is exhaustive (only if applicable).
   */
  exhaustive?: boolean;
};

export type CurrentRefinementsConnectorParamsItem = {
  /**
   * The index name.
   */
  indexName: string;

  /**
   * The attribute on which the refinement is applied.
   */
  attribute: string;

  /**
   * The textual representation of this attribute.
   */
  label: string;

  /**
   * Currently applied refinements.
   */
  refinements: CurrentRefinementsConnectorParamsRefinement[];

  /**
   * Removes the given refinement and triggers a new search.
   */
  refine(refinement: CurrentRefinementsConnectorParamsRefinement): void;
};

export type CurrentRefinementsConnectorParams = {
  /**
   * The attributes to include in the widget (all by default).
   * Cannot be used with `excludedAttributes`.
   *
   * @default `[]`
   */
  includedAttributes?: string[];

  /**
   * The attributes to exclude from the widget.
   * Cannot be used with `includedAttributes`.
   *
   * @default `['query']`
   */
  excludedAttributes?: string[];

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<CurrentRefinementsConnectorParamsItem>;
};

export type CurrentRefinementsRenderState = {
  /**
   * All the currently refined items, grouped by attribute.
   */
  items: CurrentRefinementsConnectorParamsItem[];

  /**
   * Indicates if search state can be refined.
   */
  canRefine: boolean;

  /**
   * Removes the given refinement and triggers a new search.
   */
  refine(refinement: CurrentRefinementsConnectorParamsRefinement): void;

  /**
   * Generates a URL for the next state.
   */
  createURL: CreateURL<CurrentRefinementsConnectorParamsRefinement>;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'current-refinements',
  connector: true,
});

export type CurrentRefinementsWidgetDescription = {
  $$type: 'ais.currentRefinements';
  renderState: CurrentRefinementsRenderState;
  indexRenderState: {
    currentRefinements: WidgetRenderState<
      CurrentRefinementsRenderState,
      CurrentRefinementsConnectorParams
    >;
  };
};

export type CurrentRefinementsConnector = Connector<
  CurrentRefinementsWidgetDescription,
  CurrentRefinementsConnectorParams
>;

const connectCurrentRefinements: CurrentRefinementsConnector = function connectCurrentRefinements(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    if (
      (widgetParams || {}).includedAttributes &&
      (widgetParams || {}).excludedAttributes
    ) {
      throw new Error(
        withUsage(
          'The options `includedAttributes` and `excludedAttributes` cannot be used together.'
        )
      );
    }

    const {
      includedAttributes,
      excludedAttributes = ['query'],
      transformItems = (items: CurrentRefinementsConnectorParamsItem[]) =>
        items,
    } = widgetParams || {};

    return {
      $$type: 'ais.currentRefinements',

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

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          currentRefinements: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results, scopedResults, createURL, helper }) {
        function getItems() {
          if (!results) {
            return transformItems(
              getRefinementsItems({
                results: {},
                helper,
                includedAttributes,
                excludedAttributes,
              })
            );
          }

          return scopedResults.reduce<CurrentRefinementsConnectorParamsItem[]>(
            (accResults, scopedResult) => {
              return accResults.concat(
                transformItems(
                  getRefinementsItems({
                    results: scopedResult.results,
                    helper: scopedResult.helper,
                    includedAttributes,
                    excludedAttributes,
                  })
                )
              );
            },
            []
          );
        }

        const items = getItems();

        return {
          items,
          canRefine: items.length > 0,
          refine: refinement => clearRefinement(helper, refinement),
          createURL: refinement =>
            createURL(clearRefinementFromState(helper.state, refinement)),
          widgetParams,
        };
      },
    };
  };
};

function getRefinementsItems({
  results,
  helper,
  includedAttributes,
  excludedAttributes,
}: {
  results: SearchResults | Record<string, never>;
  helper: AlgoliaSearchHelper;
  includedAttributes: CurrentRefinementsConnectorParams['includedAttributes'];
  excludedAttributes: CurrentRefinementsConnectorParams['excludedAttributes'];
}): CurrentRefinementsConnectorParamsItem[] {
  const includesQuery =
    (includedAttributes || []).indexOf('query') !== -1 ||
    (excludedAttributes || []).indexOf('query') === -1;

  const filterFunction = includedAttributes
    ? (item: CurrentRefinementsConnectorParamsRefinement) =>
        includedAttributes.indexOf(item.attribute) !== -1
    : (item: CurrentRefinementsConnectorParamsRefinement) =>
        excludedAttributes!.indexOf(item.attribute) === -1;

  const items = getRefinements(results, helper.state, includesQuery)
    .map(normalizeRefinement)
    .filter(filterFunction);

  return items.reduce<CurrentRefinementsConnectorParamsItem[]>(
    (allItems, currentItem) => [
      ...allItems.filter(item => item.attribute !== currentItem.attribute),
      {
        indexName: helper.state.index,
        attribute: currentItem.attribute,
        label: currentItem.attribute,
        refinements: items
          .filter(result => result.attribute === currentItem.attribute)
          // We want to keep the order of refinements except the numeric ones.
          .sort((a, b) =>
            a.type === 'numeric' ? (a.value as number) - (b.value as number) : 0
          ),
        refine: refinement => clearRefinement(helper, refinement),
      },
    ],
    []
  );
}

function clearRefinementFromState(
  state: SearchParameters,
  refinement: CurrentRefinementsConnectorParamsRefinement
): SearchParameters {
  switch (refinement.type) {
    case 'facet':
      return state.removeFacetRefinement(
        refinement.attribute,
        String(refinement.value)
      );
    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(
        refinement.attribute,
        String(refinement.value)
      );
    case 'hierarchical':
      return state.removeHierarchicalFacetRefinement(refinement.attribute);
    case 'exclude':
      return state.removeExcludeRefinement(
        refinement.attribute,
        String(refinement.value)
      );
    case 'numeric':
      return state.removeNumericRefinement(
        refinement.attribute,
        refinement.operator,
        String(refinement.value)
      );
    case 'tag':
      return state.removeTagRefinement(String(refinement.value));
    case 'query':
      return state.setQueryParameter('query', '');
    default:
      warning(
        false,
        `The refinement type "${refinement.type}" does not exist and cannot be cleared from the current refinements.`
      );
      return state;
  }
}

function clearRefinement(
  helper: AlgoliaSearchHelper,
  refinement: CurrentRefinementsConnectorParamsRefinement
): void {
  helper.setState(clearRefinementFromState(helper.state, refinement)).search();
}

function getOperatorSymbol(operator: SearchParameters.Operator): string {
  switch (operator) {
    case '>=':
      return '≥';
    case '<=':
      return '≤';
    default:
      return operator;
  }
}

function normalizeRefinement(
  refinement: Refinement
): CurrentRefinementsConnectorParamsRefinement {
  const value =
    refinement.type === 'numeric' ? Number(refinement.name) : refinement.name;
  const label = (refinement as NumericRefinement).operator
    ? `${getOperatorSymbol(
        (refinement as NumericRefinement).operator as SearchParameters.Operator
      )} ${refinement.name}`
    : refinement.name;

  const normalizedRefinement: CurrentRefinementsConnectorParamsRefinement = {
    attribute: refinement.attribute,
    type: refinement.type,
    value,
    label,
  };

  if ((refinement as NumericRefinement).operator !== undefined) {
    normalizedRefinement.operator = (refinement as NumericRefinement).operator;
  }
  if ((refinement as FacetRefinement).count !== undefined) {
    normalizedRefinement.count = (refinement as FacetRefinement).count;
  }
  if ((refinement as FacetRefinement).exhaustive !== undefined) {
    normalizedRefinement.exhaustive = (refinement as FacetRefinement).exhaustive;
  }

  return normalizedRefinement;
}

export default connectCurrentRefinements;
