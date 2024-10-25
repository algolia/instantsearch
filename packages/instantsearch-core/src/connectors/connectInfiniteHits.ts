import {
  createDocumentationMessageGenerator,
  isEqual,
  noop,
  walkIndex,
  escapeHits,
  TAG_PLACEHOLDER,
} from '../lib/public';
import {
  checkRendering,
  addAbsolutePosition,
  addQueryID,
  createSendEventForHits,
  createBindEventForHits,
} from '../lib/utils';

import type {
  Connector,
  TransformItems,
  Hit,
  WidgetRenderState,
  BaseHit,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  SendEventForHits,
  BindEventForHits,
  Widget,
} from '../types';
import type {
  Banner,
  AlgoliaSearchHelper as Helper,
  PlainSearchParameters,
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';

export type InfiniteHitsCachedHits<THit extends NonNullable<object>> = {
  [page: number]: Array<Hit<THit>>;
};

type Read<THit extends NonNullable<object>> = ({
  state,
}: {
  state: PlainSearchParameters;
}) => InfiniteHitsCachedHits<THit> | null;

type Write<THit extends NonNullable<object>> = ({
  state,
  hits,
}: {
  state: PlainSearchParameters;
  hits: InfiniteHitsCachedHits<THit>;
}) => void;

export type InfiniteHitsCache<THit extends NonNullable<object> = BaseHit> = {
  read: Read<THit>;
  write: Write<THit>;
};

export type InfiniteHitsConnectorParams<
  THit extends NonNullable<object> = BaseHit
> = {
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

export type InfiniteHitsRenderState<
  THit extends NonNullable<object> = BaseHit
> = {
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
   * @deprecated use `items` instead
   */
  hits: Array<Hit<THit>>;

  /**
   * Hits for current and cached pages
   */
  items: Array<Hit<THit>>;

  /**
   * The response from the Algolia API.
   */
  results?: SearchResults<Hit<THit>> | null;

  /**
   * The banner to display above the hits.
   */
  banner?: Banner;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
  connector: true,
});

export type InfiniteHitsWidgetDescription<
  THit extends NonNullable<object> = BaseHit
> = {
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

export type InfiniteHitsConnector<THit extends NonNullable<object> = BaseHit> =
  Connector<
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

function getInMemoryCache<
  THit extends NonNullable<object>
>(): InfiniteHitsCache<THit> {
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

function extractHitsFromCachedHits<THit extends NonNullable<object>>(
  cachedHits: InfiniteHitsCachedHits<THit>
) {
  return Object.keys(cachedHits)
    .map(Number)
    .sort((a, b) => a - b)
    .reduce((acc: Array<Hit<THit>>, page) => {
      return acc.concat(cachedHits[page]);
    }, []);
}

export const connectInfiniteHits = function connectInfiniteHits<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<InfiniteHitsRenderState, TWidgetParams>,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <THit extends NonNullable<object> = BaseHit>(
    widgetParams: TWidgetParams & InfiniteHitsConnectorParams<THit>
  ) => {
    const {
      // @MAJOR: this can default to false
      escapeHTML = true,
      transformItems = ((items) => items) as NonNullable<
        InfiniteHitsConnectorParams<THit>['transformItems']
      >,
      cache = getInMemoryCache<THit>(),
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

    type InfiniteHitsWidget = Widget<
      InfiniteHitsWidgetDescription<THit> & {
        widgetParams: typeof widgetParams;
      }
    >;

    const widget: InfiniteHitsWidget = {
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
          infiniteHits: this.getWidgetRenderState(renderOptions) as NonNullable<
            typeof renderState['infiniteHits']
          >,
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

        const banner = results?.renderingContent?.widgets?.banners?.[0];

        if (!results) {
          showPrevious = getShowPrevious(helper);
          showMore = getShowMore(helper);
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            helper,
            widgetType: this.$$type,
          });
          bindEvent = createBindEventForHits({
            helper,
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
            !state.disjunctiveFacets?.length &&
            !(state.facets || []).filter((f) => f !== '*').length &&
            !state.hierarchicalFacets?.length;

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

        const items = extractHitsFromCachedHits(cachedHits);
        const isLastPage = results
          ? results.nbPages <= getLastReceivedPage(state, cachedHits) + 1
          : true;

        return {
          hits: items,
          items,
          currentPageHits,
          sendEvent,
          bindEvent,
          banner,
          results: results || undefined,
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
          // @MAJOR: set this globally, not in the InfiniteHits widget to allow InfiniteHits to be conditionally used
          widgetSearchParameters =
            searchParameters.setQueryParameters(TAG_PLACEHOLDER);
        }

        // The page in the search parameters is decremented by one
        // to get to the actual parameter value from the UI state.
        const page = uiState.page ? uiState.page - 1 : 0;

        return widgetSearchParameters.setQueryParameter('page', page);
      },
    };

    // casting to avoid large type output
    return widget as InfiniteHitsWidget;
  };
} satisfies InfiniteHitsConnector;
