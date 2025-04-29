import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { INSTANTSEARCH_FUTURE_DEFAULTS } from '../src/lib/InstantSearch';
import { defer } from '../src/lib/utils';
import { index } from '../src/widgets';

import type { InstantSearch } from '../src/types';

export const createInstantSearch = (
  args: Partial<InstantSearch> = {}
): InstantSearch => {
  const { indexName = 'indexName', client = createSearchClient() } = args;
  const mainHelper = algoliasearchHelper(client, indexName, {});
  const mainIndex = index({ indexName });

  return {
    indexName,
    mainIndex,
    mainHelper,
    client,
    started: false,
    status: 'idle',
    _isSearchStalled: false,
    error: undefined,
    start() {
      this.started = true;
    },
    dispose() {
      this.started = false;
    },
    refresh: jest.fn(),
    helper: mainHelper, // @TODO: use the Helper from the index once the RoutingManger uses the index
    templatesConfig: {},
    insightsClient: null,
    middleware: [],
    renderState: {},
    scheduleStalledRender: defer(jest.fn()),
    scheduleSearch: defer(jest.fn()),
    scheduleRender: defer(jest.fn()),
    _stalledSearchDelay: 200,
    _searchStalledTimer: null,
    _initialUiState: {},
    _initialResults: null,
    _createURL: jest.fn(() => '#'),
    _insights: undefined,
    _hasRecommendWidget: false,
    _hasSearchWidget: false,
    onStateChange: null,
    setUiState: jest.fn(),
    getUiState: jest.fn(() => ({})),
    // Since we defer `onInternalStateChange` with our `defer` util which
    // creates a scoped deferred function, we're not able to spy that method.
    // We'll therefore need to override it when calling `createInstantSearch`.
    // See https://github.com/algolia/instantsearch/blob/f3213b2f118d75acac31a1f6cf4640241c438e9d/src/lib/utils/defer.ts#L13-L28
    onInternalStateChange: jest.fn() as any,
    createURL: jest.fn(() => '#'),
    addWidget: jest.fn(),
    addWidgets: jest.fn(),
    removeWidget: jest.fn(),
    removeWidgets: jest.fn(),
    use: jest.fn(),
    EXPERIMENTAL_use: jest.fn(),
    unuse: jest.fn(),
    // methods from EventEmitter
    addListener: jest.fn(),
    removeListener: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    listeners: jest.fn(),
    emit: jest.fn(),
    listenerCount: jest.fn(),
    sendEventToInsights: jest.fn(),
    future: {
      ...INSTANTSEARCH_FUTURE_DEFAULTS,
      ...(args.future || {}),
    },
    ...args,
  };
};
