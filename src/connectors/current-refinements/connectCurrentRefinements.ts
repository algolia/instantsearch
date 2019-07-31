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
} from '../../lib/utils';
import {
  Unmounter,
  WidgetFactory,
  Renderer,
  RendererOptions,
} from '../../types';

export type Refinement = {
  attribute: string;
  type: string;
  value: string | number;
  label: string;
  operator?: string;
  count?: number;
  exhaustive?: boolean;
};

export type Item = {
  attribute: string;
  label: string;
  refine: (refinement: ItemRefinement) => void;
  refinements: ItemRefinement[];
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
  refine: (refinement: ItemRefinement) => void;
  createURL: (refinement: ItemRefinement) => string;
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
      (widgetParams || ({} as any)).includedAttributes &&
      (widgetParams || ({} as any)).excludedAttributes
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
      transformItems = (items: Refinement[]) => items,
    } = widgetParams || ({} as CurrentRefinementsConnectorParams);

    return {
      $$type: 'ais.currentRefinements',

      init({ helper, createURL, instantSearchInstance }) {
        const items = transformItems(
          getFilteredRefinements({
            results: {},
            state: helper.state,
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

      render({ results, helper, state, createURL, instantSearchInstance }) {
        const items = transformItems(
          getFilteredRefinements({
            results,
            state,
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
          false
        );
      },

      dispose() {
        unmountFn();
      },
    };
  };
};

function getFilteredRefinements({
  results,
  state,
  helper,
  includedAttributes,
  excludedAttributes,
}) {
  const clearsQuery =
    (includedAttributes || []).indexOf('query') !== -1 ||
    (excludedAttributes || []).indexOf('query') === -1;

  const filterFunction = includedAttributes
    ? item => includedAttributes.indexOf(item.attributeName) !== -1
    : item => excludedAttributes.indexOf(item.attributeName) === -1;

  const items = getRefinements(results, state, clearsQuery)
    .filter(filterFunction)
    // @ts-ignore: @TODO the types don't match exactly, this will need to get refactored.
    .map(normalizeRefinement);

  return groupItemsByRefinements(items, helper);
}

function clearRefinementFromState(
  state: SearchParameters,
  refinement: ItemRefinement
) {
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
      // @ts-ignore @TODO: fix non-existant `removeNumericRefinement` type in the helper typings
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
      throw new Error(
        `clearRefinement: type ${refinement.type} is not handled`
      );
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

function normalizeRefinement(refinement: SearchResults.Refinement): Refinement {
  const value =
    refinement.type === 'numeric' ? Number(refinement.name) : refinement.name;
  const label = refinement.operator
    ? `${getOperatorSymbol(refinement.operator as SearchParameters.Operator)} ${
        refinement.name
      }`
    : refinement.name;

  const normalizedRefinement: Refinement = {
    attribute: refinement.attributeName,
    type: refinement.type,
    value,
    label,
  };

  if (refinement.operator !== undefined) {
    normalizedRefinement.operator = refinement.operator;
  }
  if (refinement.count !== undefined) {
    normalizedRefinement.count = refinement.count;
  }
  if (refinement.exhaustive !== undefined) {
    normalizedRefinement.exhaustive = refinement.exhaustive;
  }
  return normalizedRefinement;
}

function groupItemsByRefinements(items: any[], helper: AlgoliaSearchHelper) {
  return items.reduce(
    (allItems, currentItem) => [
      ...allItems.filter(
        (item: Item) => item.attribute !== currentItem.attribute
      ),
      {
        attribute: currentItem.attribute,
        label: currentItem.attribute,
        refinements: items
          .filter(result => result.attribute === currentItem.attribute)
          // We want to keep the order of refinements except the numeric ones.
          .sort((a, b) => (a.type === 'numeric' ? a.value - b.value : 0)),
        refine: (refinement: ItemRefinement) =>
          clearRefinement(helper, refinement),
      },
    ],
    []
  );
}

export default connectCurrentRefinements;
