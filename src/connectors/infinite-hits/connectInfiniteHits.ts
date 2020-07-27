import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
} from 'algoliasearch-helper';
import { Hits, Connector, TransformItems, Hit } from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  isEqual,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';

export type InfiniteHitsCachedHits = {
  [page: number]: Hits;
};

type Read = ({
  state,
}: {
  state: Partial<SearchParameters>;
}) => InfiniteHitsCachedHits | null;

type Write = ({
  state,
  hits,
}: {
  state: Partial<SearchParameters>;
  hits: InfiniteHitsCachedHits;
}) => void;

export type InfiniteHitsCache = {
  read: Read;
  write: Write;
};

export type InfiniteHitsConnectorParams = {
  /**
   * Escapes HTML entities from hits string values.
   *
   * @default `true`
   */
  escapeHTML?: boolean;

  /**
   * Enable the button to load previous results.
   *
   * @default `false`
   */
  showPrevious?: boolean;

  /**
   * Receives the items, and is called before displaying them.
   * Useful for mapping over the items to transform, and remove or reorder them.
   */
  transformItems?: TransformItems<Hit>;

  /**
   * Reads and writes hits from/to cache.
   * When user comes back to the search page after leaving for product page,
   * this helps restore InfiniteHits and its scroll position.
   */
  cache?: InfiniteHitsCache;
};

export type InfiniteHitsRendererOptions = {
  /**
   * Loads the previous results.
   */
  showPrevious: () => void;

  /**
   * Loads the next page of hits.
   */
  showMore: () => void;

  /**
   * Indicates whether the first page of hits has been reached.
   */
  isFirstPage: boolean;

  /**
   * Indicates whether the last page of hits has been reached.
   */
  isLastPage: boolean;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
  connector: true,
});

export type InfiniteHitsConnector = Connector<
  InfiniteHitsRendererOptions,
  InfiniteHitsConnectorParams
>;

function getStateWithoutPage(state) {
  const { page, ...rest } = state || {};
  return rest;
}

function getInMemoryCache(): InfiniteHitsCache {
  let cachedHits: InfiniteHitsCachedHits | null = null;
  let cachedState = undefined;
  return {
    read({ state }) {
      return isEqual(cachedState, getStateWithoutPage(state))
        ? cachedHits
        : null;
    },
    write({ state, hits }) {
      cachedState = getStateWithoutPage(state);
      cachedHits = hits;
    },
  };
}

function extractHitsFromCachedHits(cachedHits: InfiniteHitsCachedHits) {
  return Object.keys(cachedHits)
    .map(Number)
    .sort((a, b) => a - b)
    .reduce((acc: Hits, page) => {
      return acc.concat(cachedHits[page]);
    }, []);
}

const connectInfiniteHits: InfiniteHitsConnector = function connectInfiniteHits(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      escapeHTML = true,
      transformItems = (items: any[]) => items,
      cache = getInMemoryCache(),
    } = widgetParams || ({} as typeof widgetParams);
    let cachedHits: InfiniteHitsCachedHits | undefined = undefined;
    let prevState: Partial<SearchParameters>;
    let showPrevious: () => void;
    let showMore: () => void;

    const getFirstReceivedPage = () =>
      Math.min(...Object.keys(cachedHits || {}).map(Number));
    const getLastReceivedPage = () =>
      Math.max(...Object.keys(cachedHits || {}).map(Number));

    const getShowPrevious = (helper: Helper): (() => void) => () => {
      // Using the helper's `overrideStateWithoutTriggeringChangeEvent` method
      // avoid updating the browser URL when the user displays the previous page.
      helper
        .overrideStateWithoutTriggeringChangeEvent({
          ...helper.state,
          page: getFirstReceivedPage() - 1,
        })
        .searchWithoutTriggeringOnStateChange();
    };
    const getShowMore = (helper: Helper): (() => void) => () => {
      helper.setPage(getLastReceivedPage() + 1).search();
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

        renderFn(
          {
            hits: extractHitsFromCachedHits(
              cache.read({ state: helper.state }) || {}
            ),
            results: undefined,
            showPrevious,
            showMore,
            isFirstPage:
              getFirstReceivedPage() === 0 || helper.state.page === undefined,
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
          cachedHits = cache.read({ state }) || {};
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

        if (cachedHits === undefined) {
          cachedHits = cache.read({ state }) || {};
        }

        if (cachedHits![page] === undefined) {
          cachedHits![page] = results.hits;
          cache.write({ state, hits: cachedHits });
        }

        const isFirstPage = getFirstReceivedPage() === 0;
        const isLastPage = results.nbPages <= results.page + 1;

        renderFn(
          {
            hits: extractHitsFromCachedHits(cachedHits!),
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

      getWidgetUiState(uiState, { searchParameters }) {
        const page = searchParameters.page || 0;

        if (!page) {
          // return without adding `page` to uiState
          // because we don't want `page=1` in the URL
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
