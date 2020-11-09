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
  createSendEventForHits,
  SendEventForHits,
  createBindEventForHits,
  BindEventForHits,
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

  /**
   * Send event to insights middleware
   */
  sendEvent: SendEventForHits;

  /**
   * Returns a string of data-insights-event attribute for insights middleware
   */
  bindEvent: BindEventForHits;
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
    let showPrevious: () => void;
    let showMore: () => void;
    let sendEvent;
    let bindEvent;
    const getFirstReceivedPage = (
      state: SearchParameters,
      cachedHits: InfiniteHitsCachedHits
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
      cachedHits: InfiniteHitsCachedHits
    ) => {
      const { page = 0 } = state;
      const pages = Object.keys(cachedHits).map(Number);
      if (pages.length === 0) {
        return page;
      } else {
        return Math.max(page, ...pages);
      }
    };

    const getShowPrevious = (
      helper: Helper,
      cachedHits: InfiniteHitsCachedHits
    ): (() => void) => () => {
      // Using the helper's `overrideStateWithoutTriggeringChangeEvent` method
      // avoid updating the browser URL when the user displays the previous page.
      helper
        .overrideStateWithoutTriggeringChangeEvent({
          ...helper.state,
          page: getFirstReceivedPage(helper.state, cachedHits) - 1,
        })
        .searchWithoutTriggeringOnStateChange();
    };
    const getShowMore = (
      helper: Helper,
      cachedHits: InfiniteHitsCachedHits
    ): (() => void) => () => {
      helper
        .setPage(getLastReceivedPage(helper.state, cachedHits) + 1)
        .search();
    };

    return {
      $$type: 'ais.infiniteHits',

      init({ instantSearchInstance, helper }) {
        const cachedHits = cache.read({ state: helper.state }) || {};
        showPrevious = getShowPrevious(helper, cachedHits);
        showMore = getShowMore(helper, cachedHits);
        sendEvent = createSendEventForHits({
          instantSearchInstance,
          index: helper.getIndex(),
          widgetType: this.$$type!,
        });
        bindEvent = createBindEventForHits({
          index: helper.getIndex(),
          widgetType: this.$$type!,
        });

        renderFn(
          {
            hits: extractHitsFromCachedHits(cachedHits),
            results: undefined,
            sendEvent,
            bindEvent,
            showPrevious,
            showMore,
            isFirstPage:
              helper.state.page === undefined ||
              getFirstReceivedPage(helper.state, cachedHits) === 0,
            isLastPage: true,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, instantSearchInstance }) {
        const { page = 0 } = state;

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

        const cachedHits = cache.read({ state }) || {};
        if (cachedHits[page] === undefined) {
          cachedHits[page] = results.hits;
          cache.write({ state, hits: cachedHits });
        }

        const firstReceivedPage = getFirstReceivedPage(state, cachedHits);
        const lastReceivedPage = getLastReceivedPage(state, cachedHits);
        const isFirstPage = firstReceivedPage === 0;
        const isLastPage = results.nbPages <= lastReceivedPage + 1;

        sendEvent('view', cachedHits[page]);

        renderFn(
          {
            hits: extractHitsFromCachedHits(cachedHits),
            results,
            sendEvent,
            bindEvent,
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
