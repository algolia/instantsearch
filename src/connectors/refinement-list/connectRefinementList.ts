import { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';
import {
  escapeFacets,
  TAG_PLACEHOLDER,
  TAG_REPLACEMENT,
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForFacet,
  noop,
  SendEventForFacet,
} from '../../lib/utils';
import {
  Connector,
  TransformItems,
  SortBy,
  RenderOptions,
  Widget,
  InitOptions,
  FacetHit,
  CreateURL,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'refinement-list',
  connector: true,
});

export type RefinementListItem = {
  /**
   * The value of the refinement list item.
   */
  value: string;
  /**
   * Human-readable value of the refinement list item.
   */
  label: string;
  /**
   * Human-readable value of the searched refinement list item.
   */
  highlighted?: string;
  /**
   * Number of matched results after refinement is applied.
   */
  count: number;
  /**
   * Indicates if the list item is refined.
   */
  isRefined: boolean;
};

export type RefinementListConnectorParams = {
  /**
   * The name of the attribute in the records.
   */
  attribute: string;
  /**
   * How the filters are combined together.
   */
  operator?: 'and' | 'or';
  /**
   * The max number of items to display when
   * `showMoreLimit` is not set or if the widget is showing less value.
   */
  limit?: number;
  /**
   * Whether to display a button that expands the number of items.
   */
  showMore?: boolean;
  /**
   * The max number of items to display if the widget
   * is showing more items.
   */
  showMoreLimit?: number;
  /**
   * How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
   */
  sortBy?: SortBy<RefinementListItem>;
  /**
   * Escapes the content of the facet values.
   */
  escapeFacetValues?: boolean;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<RefinementListItem>;
};

export type RefinementListRenderState = {
  /**
   * The list of filtering values returned from Algolia API.
   */
  items: RefinementListItem[];
  /**
   * indicates whether the results are exhaustive (complete)
   */
  hasExhaustiveItems: boolean;
  /**
   * Creates the next state url for a selected refinement.
   */
  createURL: CreateURL<string>;
  /**
   * Action to apply selected refinements.
   */
  refine(value: string): void;
  /**
   * Send event to insights middleware
   */
  sendEvent: SendEventForFacet;
  /**
   * Searches for values inside the list.
   */
  searchForItems(query: string): void;
  /**
   * `true` if the values are from an index search.
   */
  isFromSearch: boolean;
  /**
   * `true` if a refinement can be applied.
   */
  canRefine: boolean;
  /**
   * `true` if the toggleShowMore button can be activated (enough items to display more or
   * already displaying more than `limit` items)
   */
  canToggleShowMore: boolean;
  /**
   * True if the menu is displaying all the menu items.
   */
  isShowingMore: boolean;
  /**
   * Toggles the number of values displayed between `limit` and `showMoreLimit`.
   */
  toggleShowMore(): void;
};

export type RefinementListWidgetDescription = {
  $$type: 'ais.refinementList';
  renderState: RefinementListRenderState;
  indexRenderState: {
    refinementList: {
      [attribute: string]: WidgetRenderState<
        RefinementListRenderState,
        RefinementListConnectorParams
      >;
    };
  };
  indexUiState: {
    refinementList: {
      [attribute: string]: string[];
    };
  };
};

export type RefinementListConnector = Connector<
  RefinementListWidgetDescription,
  RefinementListConnectorParams
>;

/**
 * **RefinementList** connector provides the logic to build a custom widget that
 * will let the user filter the results based on the values of a specific facet.
 *
 * **Requirement:** the attribute passed as `attribute` must be present in
 * attributesForFaceting of the searched index.
 *
 * This connector provides:
 * - a `refine()` function to select an item.
 * - a `toggleShowMore()` function to display more or less items
 * - a `searchForItems()` function to search within the items.
 */
const connectRefinementList: RefinementListConnector = function connectRefinementList(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      attribute,
      operator = 'or',
      limit = 10,
      showMore = false,
      showMoreLimit = 20,
      sortBy = ['isRefined', 'count:desc', 'name:asc'],
      escapeFacetValues = true,
      transformItems = (items => items) as TransformItems<RefinementListItem>,
    } = widgetParams || {};

    type ThisWidget = Widget<
      RefinementListWidgetDescription & { widgetParams: typeof widgetParams }
    >;

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    if (!/^(and|or)$/.test(operator)) {
      throw new Error(
        withUsage(
          `The \`operator\` must one of: \`"and"\`, \`"or"\` (got "${operator}").`
        )
      );
    }

    if (showMore === true && showMoreLimit <= limit) {
      throw new Error(
        withUsage('`showMoreLimit` should be greater than `limit`.')
      );
    }

    const formatItems = ({
      name: label,
      ...item
    }: SearchResults.FacetValue): RefinementListItem => ({
      ...item,
      label,
      value: label,
      highlighted: label,
    });

    let lastResultsFromMainSearch: SearchResults;
    let lastItemsFromMainSearch: RefinementListItem[] = [];
    let hasExhaustiveItems = true;
    let triggerRefine: RefinementListRenderState['refine'] | undefined;
    let sendEvent: RefinementListRenderState['sendEvent'] | undefined;

    let isShowingMore = false;
    // Provide the same function to the `renderFn` so that way the user
    // has to only bind it once when `isFirstRendering` for instance
    let toggleShowMore = () => {};
    function cachedToggleShowMore() {
      toggleShowMore();
    }

    function createToggleShowMore(
      renderOptions: RenderOptions,
      widget: ThisWidget
    ) {
      return () => {
        isShowingMore = !isShowingMore;
        widget.render!(renderOptions);
      };
    }

    function getLimit() {
      return isShowingMore ? showMoreLimit : limit;
    }

    let searchForFacetValues: (
      renderOptions: RenderOptions | InitOptions
    ) => RefinementListRenderState['searchForItems'] = () => () => {};

    const createSearchForFacetValues = function(
      helper: AlgoliaSearchHelper,
      widget: ThisWidget
    ) {
      return (renderOptions: RenderOptions | InitOptions) => (
        query: string
      ) => {
        const { instantSearchInstance } = renderOptions;
        if (query === '' && lastItemsFromMainSearch) {
          // render with previous data from the helper.
          renderFn(
            {
              ...widget.getWidgetRenderState({
                ...renderOptions,
                results: lastResultsFromMainSearch,
              }),
              instantSearchInstance,
            },
            false
          );
        } else {
          const tags = {
            highlightPreTag: escapeFacetValues
              ? TAG_PLACEHOLDER.highlightPreTag
              : TAG_REPLACEMENT.highlightPreTag,
            highlightPostTag: escapeFacetValues
              ? TAG_PLACEHOLDER.highlightPostTag
              : TAG_REPLACEMENT.highlightPostTag,
          };

          helper
            .searchForFacetValues(
              attribute,
              query,
              // We cap the `maxFacetHits` value to 100 because the Algolia API
              // doesn't support a greater number.
              // See https://www.algolia.com/doc/api-reference/api-parameters/maxFacetHits/
              Math.min(getLimit(), 100),
              tags
            )
            .then(results => {
              const facetValues = escapeFacetValues
                ? escapeFacets(results.facetHits)
                : results.facetHits;

              const normalizedFacetValues = transformItems(
                facetValues.map(({ value, ...item }) => ({
                  ...item,
                  value,
                  label: value,
                }))
              );

              renderFn(
                {
                  ...widget.getWidgetRenderState({
                    ...renderOptions,
                    results: lastResultsFromMainSearch,
                  }),
                  items: normalizedFacetValues,
                  canToggleShowMore: false,
                  canRefine: true,
                  isFromSearch: true,
                  instantSearchInstance,
                },
                false
              );
            });
        }
      };
    };

    return {
      $$type: 'ais.refinementList' as const,

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
          refinementList: {
            ...renderState.refinementList,
            [attribute]: this.getWidgetRenderState(renderOptions),
          },
        };
      },

      getWidgetRenderState(renderOptions) {
        const {
          results,
          state,
          createURL,
          instantSearchInstance,
          helper,
        } = renderOptions;
        let items: RefinementListItem[] = [];
        let facetValues: SearchResults.FacetValue[] | FacetHit[] = [];

        if (!sendEvent || !triggerRefine || !searchForFacetValues) {
          sendEvent = createSendEventForFacet({
            instantSearchInstance,
            helper,
            attribute,
            widgetType: this.$$type!,
          });

          triggerRefine = facetValue => {
            sendEvent!('click', facetValue);
            helper.toggleFacetRefinement(attribute, facetValue).search();
          };

          searchForFacetValues = createSearchForFacetValues(helper, this);
        }

        if (results) {
          const values = results.getFacetValues(attribute, {
            sortBy,
          });
          facetValues = values && Array.isArray(values) ? values : [];
          items = transformItems(
            facetValues.slice(0, getLimit()).map(formatItems)
          );

          const maxValuesPerFacetConfig = state.maxValuesPerFacet;
          const currentLimit = getLimit();
          // If the limit is the max number of facet retrieved it is impossible to know
          // if the facets are exhaustive. The only moment we are sure it is exhaustive
          // is when it is strictly under the number requested unless we know that another
          // widget has requested more values (maxValuesPerFacet > getLimit()).
          // Because this is used for making the search of facets unable or not, it is important
          // to be conservative here.
          hasExhaustiveItems =
            maxValuesPerFacetConfig! > currentLimit
              ? facetValues.length <= currentLimit
              : facetValues.length < currentLimit;

          lastResultsFromMainSearch = results;
          lastItemsFromMainSearch = items;

          if (renderOptions.results) {
            toggleShowMore = createToggleShowMore(renderOptions, this);
          }
        }

        // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
        // function
        const searchFacetValues =
          searchForFacetValues && searchForFacetValues(renderOptions);

        const canShowLess =
          isShowingMore && lastItemsFromMainSearch.length > limit;
        const canShowMore = showMore && !hasExhaustiveItems;

        const canToggleShowMore = canShowLess || canShowMore;

        return {
          createURL: facetValue =>
            createURL(
              state.resetPage().toggleFacetRefinement(attribute, facetValue)
            ),
          items,
          refine: triggerRefine,
          searchForItems: searchFacetValues,
          isFromSearch: false,
          canRefine: items.length > 0,
          widgetParams,
          isShowingMore,
          canToggleShowMore,
          toggleShowMore: cachedToggleShowMore,
          sendEvent,
          hasExhaustiveItems,
        };
      },

      dispose({ state }) {
        unmountFn();

        const withoutMaxValuesPerFacet = state.setQueryParameter(
          'maxValuesPerFacet',
          undefined
        );
        if (operator === 'and') {
          return withoutMaxValuesPerFacet.removeFacet(attribute);
        }
        return withoutMaxValuesPerFacet.removeDisjunctiveFacet(attribute);
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const values =
          operator === 'or'
            ? searchParameters.getDisjunctiveRefinements(attribute)
            : searchParameters.getConjunctiveRefinements(attribute);

        if (!values.length) {
          return uiState;
        }

        return {
          ...uiState,
          refinementList: {
            ...uiState.refinementList,
            [attribute]: values,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const isDisjunctive = operator === 'or';
        const values =
          uiState.refinementList && uiState.refinementList[attribute];

        const withoutRefinements = searchParameters.clearRefinements(attribute);
        const withFacetConfiguration = isDisjunctive
          ? withoutRefinements.addDisjunctiveFacet(attribute)
          : withoutRefinements.addFacet(attribute);

        const currentMaxValuesPerFacet =
          withFacetConfiguration.maxValuesPerFacet || 0;

        const nextMaxValuesPerFacet = Math.max(
          currentMaxValuesPerFacet,
          showMore ? showMoreLimit : limit
        );

        const withMaxValuesPerFacet = withFacetConfiguration.setQueryParameter(
          'maxValuesPerFacet',
          nextMaxValuesPerFacet
        );

        if (!values) {
          const key = isDisjunctive
            ? 'disjunctiveFacetsRefinements'
            : 'facetsRefinements';

          return withMaxValuesPerFacet.setQueryParameters({
            [key]: {
              ...withMaxValuesPerFacet[key],
              [attribute]: [],
            },
          });
        }

        return values.reduce(
          (parameters, value) =>
            isDisjunctive
              ? parameters.addDisjunctiveFacetRefinement(attribute, value)
              : parameters.addFacetRefinement(attribute, value),
          withMaxValuesPerFacet
        );
      },
    };
  };
};

export default connectRefinementList;
