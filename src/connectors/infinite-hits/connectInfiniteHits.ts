import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
} from 'algoliasearch-helper';
import {
  Renderer,
  RendererOptions,
  WidgetFactory,
  Hits,
  Unmounter,
} from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  isEqual,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';
import { InfiniteHitsRendererWidgetParams } from '../../widgets/infinite-hits/infinite-hits';

export type InfiniteHitsConnectorParams = Partial<
  InfiniteHitsRendererWidgetParams
>;

export interface InfiniteHitsRendererOptions<TInfiniteHitsWidgetParams>
  extends RendererOptions<TInfiniteHitsWidgetParams> {
  showPrevious: () => void;
  showMore: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export type InfiniteHitsRenderer<TInfiniteHitsWidgetParams> = Renderer<
  InfiniteHitsRendererOptions<
    InfiniteHitsConnectorParams & TInfiniteHitsWidgetParams
  >
>;

export type InfiniteHitsWidgetFactory<
  TInfiniteHitsWidgetParams
> = WidgetFactory<InfiniteHitsConnectorParams & TInfiniteHitsWidgetParams>;

export type InfiniteHitsConnector = <TInfiniteHitsWidgetParams>(
  render: InfiniteHitsRenderer<TInfiniteHitsWidgetParams>,
  unmount?: Unmounter
) => InfiniteHitsWidgetFactory<TInfiniteHitsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
  connector: true,
});

const connectInfiniteHits: InfiniteHitsConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      escapeHTML = true,
      transformItems = (items: any[]) => items,
      showPrevious: hasShowPrevious = false,
    } = widgetParams || ({} as typeof widgetParams);
    let hitsCache: Hits = [];
    let firstReceivedPage = Infinity;
    let lastReceivedPage = -1;
    let prevState: Partial<SearchParameters>;
    let showPrevious: () => void;
    let showMore: () => void;

    const getShowPrevious = (helper: Helper): (() => void) => () => {
      // Using the helper's `overrideStateWithoutTriggeringChangeEvent` method
      // avoid updating the browser URL when the user displays the previous page.
      helper
        .overrideStateWithoutTriggeringChangeEvent({
          ...helper.state,
          page: firstReceivedPage - 1,
        })
        .search();
    };
    const getShowMore = (helper: Helper): (() => void) => () => {
      helper.setPage(lastReceivedPage + 1).search();
    };
    const filterEmptyRefinements = (refinements = {}) => {
      return Object.keys(refinements)
        .filter(key =>
          Array.isArray(refinements[key])
            ? refinements[key].length
            : Object.keys(refinements[key]).length
        )
        .reduce((obj, key) => {
          obj[key] = refinements[key];
          return obj;
        }, {});
    };

    return {
      $$type: 'ais.infiniteHits',

      init({ instantSearchInstance, helper }) {
        showPrevious = getShowPrevious(helper);
        showMore = getShowMore(helper);
        firstReceivedPage = helper.state.page || 0;
        lastReceivedPage = helper.state.page || 0;

        renderFn(
          {
            hits: hitsCache,
            results: undefined,
            showPrevious,
            showMore,
            isFirstPage: firstReceivedPage === 0,
            isLastPage: true,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, instantSearchInstance }) {
        // Reset cache and received pages if anything changes in the
        // search state, except for the page.
        //
        // We're doing this to "reset" the widget if a refinement or the
        // query changes between renders, but we want to keep it as is
        // if we only change pages.
        const {
          page = 0,
          facets,
          hierarchicalFacets,
          disjunctiveFacets,
          maxValuesPerFacet,
          ...currentState
        } = state;

        currentState.facetsRefinements = filterEmptyRefinements(
          currentState.facetsRefinements
        );
        currentState.hierarchicalFacetsRefinements = filterEmptyRefinements(
          currentState.hierarchicalFacetsRefinements
        );
        currentState.disjunctiveFacetsRefinements = filterEmptyRefinements(
          currentState.disjunctiveFacetsRefinements
        );
        currentState.numericRefinements = filterEmptyRefinements(
          currentState.numericRefinements
        );

        if (!isEqual(currentState, prevState)) {
          hitsCache = [];
          firstReceivedPage = page;
          lastReceivedPage = page;
          prevState = currentState;
        }

        if (escapeHTML && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }
        const initialEscaped = (results.hits as any).__escaped;

        results.hits = addAbsolutePosition(
          results.hits,
          results.page,
          results.hitsPerPage
        );

        results.hits = addQueryID(results.hits, results.queryID);

        results.hits = transformItems(results.hits);

        // Make sure the escaped tag stays after mapping over the hits.
        // This prevents the hits from being double-escaped if there are multiple
        // hits widgets mounted on the page.
        (results.hits as any).__escaped = initialEscaped;

        if (lastReceivedPage < page || !hitsCache.length) {
          hitsCache = [...hitsCache, ...results.hits];
          lastReceivedPage = page;
        } else if (firstReceivedPage > page) {
          hitsCache = [...results.hits, ...hitsCache];
          firstReceivedPage = page;
        }

        const isFirstPage = firstReceivedPage === 0;
        const isLastPage = results.nbPages <= results.page + 1;

        renderFn(
          {
            hits: hitsCache,
            results,
            showPrevious,
            showMore,
            isFirstPage,
            isLastPage,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        const stateWithoutPage = state.setQueryParameter('page', undefined);

        if (!escapeHTML) {
          return stateWithoutPage;
        }

        return stateWithoutPage.setQueryParameters(
          Object.keys(TAG_PLACEHOLDER).reduce(
            (acc, key) => ({
              ...acc,
              [key]: undefined,
            }),
            {}
          )
        );
      },

      getWidgetState(uiState, { searchParameters }) {
        const page = searchParameters.page || 0;

        if (!hasShowPrevious || !page) {
          return uiState;
        }

        return {
          ...uiState,
          // The page in the UI state is incremented by one
          // to expose the user value (not `0`).
          page: page + 1,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        let widgetSearchParameters = searchParameters;

        if (escapeHTML) {
          widgetSearchParameters = searchParameters.setQueryParameters(
            TAG_PLACEHOLDER
          );
        }

        // The page in the search parameters is decremented by one
        // to get to the actual parameter value from the UI state.
        const page = uiState.page ? uiState.page - 1 : 0;

        return widgetSearchParameters.setQueryParameter('page', page);
      },
    };
  };
};

export default connectInfiniteHits;
