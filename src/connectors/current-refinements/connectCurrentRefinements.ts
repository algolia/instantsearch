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
  Unmounter,
  WidgetFactory,
  Renderer,
  RendererOptions,
} from '../../types';

export type ConnectorRefinement = {
  attribute: string;
  type: string;
  value: string | number;
  label: string;
  operator?: string;
  count?: number;
  exhaustive?: boolean;
};

interface ConnectorNumericRefinement extends ConnectorRefinement {
  value: number;
}

export type Item = {
  indexName: string;
  attribute: string;
  label: string;
  refinements: ItemRefinement[];
  refine(refinement: ItemRefinement): void;
};

export type ItemRefinement = {
  type:
    | 'facet'
    | 'exclude'
    | 'disjunctive'
    | 'hierarchical'
    | 'numeric'
    | 'query'
    | 'tag';
  attribute: string;
  value: string;
  label: string;
  operator?: string;
  count?: number;
  exhaustive?: boolean;
};

interface CurrentRefinementsConnectorParams {
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
   * Receives the items, and is called before displaying them.
   * Should return a new array with the same shape as the original array.
   * Useful for mapping over the items to transform, and remove or reorder them.
   */
  transformItems?: (items: Item[]) => any;
}

export interface CurrentRefinementsRendererOptions<
  TCurrentRefinementsWidgetParams
> extends RendererOptions<TCurrentRefinementsWidgetParams> {
  items: Item[];
  refine(refinement: ItemRefinement): void;
  createURL(state: ItemRefinement): string;
}

export type CurrentRefinementsRenderer<
  TCurrentRefinementsWidgetParams
> = Renderer<
  CurrentRefinementsRendererOptions<
    CurrentRefinementsConnectorParams & TCurrentRefinementsWidgetParams
  >
>;

export type CurrentRefinementsWidgetFactory<
  TCurrentRefinementsWidgetParams
> = WidgetFactory<
  CurrentRefinementsConnectorParams & TCurrentRefinementsWidgetParams
>;

export type CurrentRefinementsConnector = <TCurrentRefinementsWidgetParams>(
  render: CurrentRefinementsRenderer<TCurrentRefinementsWidgetParams>,
  unmount?: Unmounter
) => CurrentRefinementsWidgetFactory<TCurrentRefinementsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'current-refinements',
  connector: true,
});

const connectCurrentRefinements: CurrentRefinementsConnector = (
  renderFn,
  unmountFn = noop
) => {
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
      transformItems = (items: Item[]) => items,
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
        const items = scopedResults.reduce<Item[]>((results, scopedResult) => {
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
}): Item[] {
  const clearsQuery =
    (includedAttributes || []).indexOf('query') !== -1 ||
    (excludedAttributes || []).indexOf('query') === -1;

  const filterFunction = includedAttributes
    ? (item: ConnectorRefinement) =>
        includedAttributes.indexOf(item.attribute) !== -1
    : (item: ConnectorRefinement) =>
        excludedAttributes!.indexOf(item.attribute) === -1;

  const items = getRefinements(results, helper.state, clearsQuery)
    .map(normalizeRefinement)
    .filter(filterFunction);

  return items.reduce<any[]>(
    (allItems, currentItem) => [
      ...allItems.filter(
        (item: Item) => item.attribute !== currentItem.attribute
      ),
      {
        indexName: helper.state.index,
        attribute: currentItem.attribute,
        label: currentItem.attribute,
        refinements: items
          .filter(result => result.attribute === currentItem.attribute)
          // We want to keep the order of refinements except the numeric ones.
          .sort((a, b) =>
            a.type === 'numeric'
              ? (a as ConnectorNumericRefinement).value -
                (b as ConnectorNumericRefinement).value
              : 0
          ),
        refine: (refinement: ItemRefinement) =>
          clearRefinement(helper, refinement),
      },
    ],
    []
  );
}

function clearRefinementFromState(
  state: SearchParameters,
  refinement: ItemRefinement
): SearchParameters {
  switch (refinement.type) {
    case 'facet':
      return state.removeFacetRefinement(
        refinement.attribute,
        refinement.value
      );
    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(
        refinement.attribute,
        refinement.value
      );
    case 'hierarchical':
      return state.removeHierarchicalFacetRefinement(refinement.attribute);
    case 'exclude':
      return state.removeExcludeRefinement(
        refinement.attribute,
        refinement.value
      );
    case 'numeric':
      return state.removeNumericRefinement(
        refinement.attribute,
        refinement.operator,
        refinement.value
      );
    case 'tag':
      return state.removeTagRefinement(refinement.value);
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
  refinement: ItemRefinement
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

function normalizeRefinement(refinement: Refinement): ConnectorRefinement {
  const value =
    refinement.type === 'numeric' ? Number(refinement.name) : refinement.name;
  const label = (refinement as NumericRefinement).operator
    ? `${getOperatorSymbol(
        (refinement as NumericRefinement).operator as SearchParameters.Operator
      )} ${refinement.name}`
    : refinement.name;

  const normalizedRefinement: ConnectorRefinement = {
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
