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
import { Connector, TransformItems, CreateURL } from '../../types';

export type CurrentRefinementsConnectorParamsRefinementType =
  | 'facet'
  | 'exclude'
  | 'disjunctive'
  | 'hierarchical'
  | 'numeric'
  | 'query'
  | 'tag';

export type CurrentRefinementsConnectorParamsRefinement = {
  /**
   * The attribute on which the refinement is applied.
   */
  attribute: string;

  /**
   * The type of the refinement.
   */
  type: CurrentRefinementsConnectorParamsRefinementType;

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
   *
   * @internal
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
   * The function that removes the refinement.
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

export type CurrentRefinementsRendererOptions = {
  /**
   * All the currently refined items, grouped by attribute.
   */
  items: CurrentRefinementsConnectorParamsItem[];

  refine(refinement: CurrentRefinementsConnectorParamsRefinement): void;

  createURL: CreateURL<CurrentRefinementsConnectorParamsRefinement>;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'current-refinements',
  connector: true,
});

export type CurrentRefinementsConnector = Connector<
  CurrentRefinementsRendererOptions,
  CurrentRefinementsConnectorParams
>;

const connectCurrentRefinements: CurrentRefinementsConnector = function connectCurrentRefinements(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    if (
      (widgetParams || ({} as typeof widgetParams)).includedAttributes &&
      (widgetParams || ({} as typeof widgetParams)).excludedAttributes
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
    } = widgetParams || ({} as typeof widgetParams);

    return {
      $$type: 'ais.currentRefinements',

      init({ helper, createURL, instantSearchInstance }) {
        const items = transformItems(
          getItems({
            results: {} as SearchResults,
            helper,
            includedAttributes,
            excludedAttributes,
          })
        );

        renderFn(
          {
            items,
            refine: refinement => clearRefinement(helper, refinement),
            createURL: refinement =>
              createURL(clearRefinementFromState(helper.state, refinement)),
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ scopedResults, helper, createURL, instantSearchInstance }) {
        const items = scopedResults.reduce<
          CurrentRefinementsConnectorParamsItem[]
        >((results, scopedResult) => {
          return results.concat(
            transformItems(
              getItems({
                results: scopedResult.results,
                helper: scopedResult.helper,
                includedAttributes,
                excludedAttributes,
              })
            )
          );
        }, []);

        renderFn(
          {
            items,
            refine: refinement => clearRefinement(helper, refinement),
            createURL: refinement =>
              createURL(clearRefinementFromState(helper.state, refinement)),
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },
    };
  };
};

function getItems({
  results,
  helper,
  includedAttributes,
  excludedAttributes,
}: {
  results: SearchResults;
  helper: AlgoliaSearchHelper;
  includedAttributes: CurrentRefinementsConnectorParams['includedAttributes'];
  excludedAttributes: CurrentRefinementsConnectorParams['excludedAttributes'];
}): CurrentRefinementsConnectorParamsItem[] {
  const clearsQuery =
    (includedAttributes || []).indexOf('query') !== -1 ||
    (excludedAttributes || []).indexOf('query') === -1;

  const filterFunction = includedAttributes
    ? (item: CurrentRefinementsConnectorParamsRefinement) =>
        includedAttributes.indexOf(item.attribute) !== -1
    : (item: CurrentRefinementsConnectorParamsRefinement) =>
        excludedAttributes!.indexOf(item.attribute) === -1;

  const items = getRefinements(results, helper.state, clearsQuery)
    .map(normalizeRefinement)
    .filter(filterFunction);

  return items.reduce<any[]>(
    (allItems, currentItem) => [
      ...allItems.filter(
        (item: CurrentRefinementsConnectorParamsItem) =>
          item.attribute !== currentItem.attribute
      ),
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
        refine: (refinement: CurrentRefinementsConnectorParamsRefinement) =>
          clearRefinement(helper, refinement),
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
        refinement.value as string
      );
    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(
        refinement.attribute,
        refinement.value as string
      );
    case 'hierarchical':
      return state.removeHierarchicalFacetRefinement(refinement.attribute);
    case 'exclude':
      return state.removeExcludeRefinement(
        refinement.attribute,
        refinement.value as string
      );
    case 'numeric':
      return state.removeNumericRefinement(
        refinement.attribute,
        refinement.operator,
        refinement.value as string
      );
    case 'tag':
      return state.removeTagRefinement(refinement.value as string);
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
