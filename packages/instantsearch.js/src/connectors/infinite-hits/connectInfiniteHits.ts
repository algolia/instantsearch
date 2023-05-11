import {
  escapeHits,
  TAG_PLACEHOLDER,
  checkRendering,
  createDocumentationMessageGenerator,
  isEqual,
  addAbsolutePosition,
  addQueryID,
  noop,
  createSendEventForHits,
  createBindEventForHits,
  walkIndex,
} from '../../lib/utils';

import type { SendEventForHits, BindEventForHits } from '../../lib/utils';
import type {
  Connector,
  TransformItems,
  Hit,
  WidgetRenderState,
  BaseHit,
} from '../../types';
import type {
  AlgoliaSearchHelper as Helper,
  PlainSearchParameters,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

export type InfiniteHitsCachedHits<THit extends BaseHit> = {
  [page: number]: Array<Hit<THit>>;
};

type Read<THit extends BaseHit> = ({
  state,
}: {
  state: PlainSearchParameters;
}) => InfiniteHitsCachedHits<THit> | null;

type Write<THit extends BaseHit> = ({
  state,
  hits,
}: {
  state: PlainSearchParameters;
  hits: InfiniteHitsCachedHits<THit>;
}) => void;

export type InfiniteHitsCache<THit extends BaseHit = BaseHit> = {
  read: Read<THit>;
  write: Write<THit>;
};

export type InfiniteHitsConnectorParams<THit extends BaseHit = BaseHit> = {
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
  transformItems?: TransformItems<Hit<THit>>;

  /**
   * Reads and writes hits from/to cache.
   * When user comes back to the search page after leaving for product page,
   * this helps restore InfiniteHits and its scroll position.
   */
  cache?: InfiniteHitsCache<THit>;
};

export type InfiniteHitsRenderState<THit extends BaseHit = BaseHit> = {
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

  /**
   * Send event to insights middleware
   */
  sendEvent: SendEventForHits;

  /**
   * Returns a string of data-insights-event attribute for insights middleware
   */
  bindEvent: BindEventForHits;

  /**
   * Hits for the current page
   */
  currentPageHits: Array<Hit<THit>>;

  /**
   * Hits for current and cached pages
   */
  hits: Array<Hit<THit>>;

  /**
   * The response from the Algolia API.
   */
  results?: SearchResults<Hit<THit>>;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
  connector: true,
});

export type InfiniteHitsWidgetDescription<THit extends BaseHit = BaseHit> = {
  $$type: 'ais.infiniteHits';
  renderState: InfiniteHitsRenderState<THit>;
  indexRenderState: {
    infiniteHits: WidgetRenderState<
      InfiniteHitsRenderState<THit>,
      InfiniteHitsConnectorParams<THit>
    >;
  };
  indexUiState: {
    page: number;
  };
};

export type InfiniteHitsConnector<THit extends BaseHit = BaseHit> = Connector<
  InfiniteHitsWidgetDescription<THit>,
  InfiniteHitsConnectorParams<THit>
>;

function getStateWithoutPage(state: PlainSearchParameters) {
  const { page, ...rest } = state || {};
  return rest;
}

function normalizeState(state: PlainSearchParameters) {
  const { clickAnalytics, userToken, ...rest } = state || {};
  return rest;
}

function getInMemoryCache<THit extends BaseHit>(): InfiniteHitsCache<THit> {
  let cachedHits: InfiniteHitsCachedHits<THit> | null = null;
  let cachedState: PlainSearchParameters | null = null;
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

function extractHitsFromCachedHits<THit extends BaseHit>(
  cachedHits: InfiniteHitsCachedHits<THit>
) {
  return Object.keys(cachedHits)
    .map(Number)
    .sort((a, b) => a - b)
    .reduce((acc: Array<Hit<THit>>, page) => {
      return acc.concat(cachedHits[page]);
    }, []);
}

const connectInfiniteHits: InfiniteHitsConnector = function connectInfiniteHits(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  // @TODO: this should be a generic, but a Connector can not yet be generic itself
  type THit = BaseHit;

  return (widgetParams) => {
    const {
      escapeHTML = true,
      transformItems = ((items) => items) as NonNullable<
        InfiniteHitsConnectorParams['transformItems']
      >,
      cache = getInMemoryCache(),
    } = widgetParams || {};
    let showPrevious: () => void;
    let showMore: () => void;
    let sendEvent: SendEventForHits;
    let bindEvent: BindEventForHits;
    const getFirstReceivedPage = (
      state: SearchParameters,
      cachedHits: InfiniteHitsCachedHits<THit>
    ) => {
      const { page = 0 } = state;
      const pages = Object.keys(cachedHits).map(Number);
      if (pages.length === 0) {
        return page;
      } else {
        return Math.min(page, ...pages);
      }
    };
    const getLastReceivedPage = (
      state: SearchParameters,
      cachedHits: InfiniteHitsCachedHits<THit>
    ) => {
      const { page = 0 } = state;
      const pages = Object.keys(cachedHits).map(Number);
      if (pages.length === 0) {
        return page;
      } else {
        return Math.max(page, ...pages);
      }
    };

    const getShowPrevious =
      (helper: Helper): (() => void) =>
      () => {
        // Using the helper's `overrideStateWithoutTriggeringChangeEvent` method
        // avoid updating the browser URL when the user displays the previous page.
        helper
          .overrideStateWithoutTriggeringChangeEvent({
            ...helper.state,
            page:
              getFirstReceivedPage(
                helper.state,
                cache.read({ state: normalizeState(helper.state) }) || {}
              ) - 1,
          })
          .searchWithoutTriggeringOnStateChange();
      };

    const getShowMore =
      (helper: Helper): (() => void) =>
      () => {
        helper
          .setPage(
            getLastReceivedPage(
              helper.state,
              cache.read({ state: normalizeState(helper.state) }) || {}
            ) + 1
          )
          .search();
      };

    return {
      $$type: 'ais.infiniteHits',

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
        const { instantSearchInstance } = renderOptions;

        const widgetRenderState = this.getWidgetRenderState(renderOptions);

        renderFn(
          {
            ...widgetRenderState,
            instantSearchInstance,
          },
          false
        );

        sendEvent('view:internal', widgetRenderState.currentPageHits);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          infiniteHits: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({
        results,
        helper,
        parent,
        state: existingState,
        instantSearchInstance,
      }) {
        let isFirstPage: boolean;
        let currentPageHits: Array<Hit<THit>> = [];
        /**
         * We bail out of optimistic UI here, as the cache is based on search
         * parameters, and we don't want to invalidate the cache when the search
         * is loading.
         */
        const state = parent.getPreviousState() || existingState;

        const cachedHits = cache.read({ state: normalizeState(state) }) || {};

        if (!results) {
          showPrevious = getShowPrevious(helper);
          showMore = getShowMore(helper);
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            index: helper.getIndex(),
            widgetType: this.$$type,
          });
          bindEvent = createBindEventForHits({
            index: helper.getIndex(),
            widgetType: this.$$type,
            instantSearchInstance,
          });
          isFirstPage =
            state.page === undefined ||
            getFirstReceivedPage(state, cachedHits) === 0;
        } else {
          const { page = 0 } = state;

          if (escapeHTML && results.hits.length > 0) {
            results.hits = escapeHits(results.hits);
          }

          const hitsWithAbsolutePosition = addAbsolutePosition(
            results.hits,
            results.page,
            results.hitsPerPage
          );

          const hitsWithAbsolutePositionAndQueryID = addQueryID(
            hitsWithAbsolutePosition,
            results.queryID
          );

          const transformedHits = transformItems(
            hitsWithAbsolutePositionAndQueryID,
            { results }
          );

          /*
            With dynamic widgets, facets are not included in the state before their relevant widgets are mounted. Until then, we need to bail out of writing this incomplete state representation in cache.
          */
          let hasDynamicWidgets = false;
          walkIndex(instantSearchInstance.mainIndex, (indexWidget) => {
            if (
              !hasDynamicWidgets &&
              indexWidget
                .getWidgets()
                .some(({ $$type }) => $$type === 'ais.dynamicWidgets')
            ) {
              hasDynamicWidgets = true;
            }
          });

          const hasNoFacets =
            !results.disjunctiveFacets?.length &&
            !results.facets?.length &&
            !results.hierarchicalFacets?.length;

          if (
            cachedHits[page] === undefined &&
            !results.__isArtificial &&
            instantSearchInstance.status === 'idle' &&
            !(hasDynamicWidgets && hasNoFacets)
          ) {
            cachedHits[page] = transformedHits;
            cache.write({ state: normalizeState(state), hits: cachedHits });
          }
          currentPageHits = transformedHits;

          isFirstPage = getFirstReceivedPage(state, cachedHits) === 0;
        }

        const hits = extractHitsFromCachedHits(cachedHits);
        const isLastPage = results
          ? results.nbPages <= getLastReceivedPage(state, cachedHits) + 1
          : true;

        return {
          hits,
          currentPageHits,
          sendEvent,
          bindEvent,
          results,
          showPrevious,
          showMore,
          isFirstPage,
          isLastPage,
          widgetParams,
        };
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
          widgetSearchParameters =
            searchParameters.setQueryParameters(TAG_PLACEHOLDER);
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
