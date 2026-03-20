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
    refresh: vi.fn(),
    helper: mainHelper, // @TODO: use the Helper from the index once the RoutingManger uses the index
    templatesConfig: {},
    insightsClient: null,
    middleware: [],
    renderState: {},
    scheduleStalledRender: defer(vi.fn()),
    scheduleSearch: defer(vi.fn()),
    scheduleRender: defer(vi.fn()),
    _stalledSearchDelay: 200,
    _searchStalledTimer: null,
    _initialUiState: {},
    _initialResults: null,
    _createURL: vi.fn(() => '#'),
    _insights: undefined,
    _hasRecommendWidget: false,
    _hasSearchWidget: false,
    _manuallyResetScheduleSearch: false,
    onStateChange: null,
    setUiState: vi.fn(),
    getUiState: vi.fn(() => ({})),
    // Since we defer `onInternalStateChange` with our `defer` util which
    // creates a scoped deferred function, we're not able to spy that method.
    // We'll therefore need to override it when calling `createInstantSearch`.
    // See https://github.com/algolia/instantsearch/blob/f3213b2f118d75acac31a1f6cf4640241c438e9d/src/lib/utils/defer.ts#L13-L28
    onInternalStateChange: vi.fn() as any,
    createURL: vi.fn(() => '#'),
    addWidget: vi.fn(),
    addWidgets: vi.fn(),
    removeWidget: vi.fn(),
    removeWidgets: vi.fn(),
    use: vi.fn(),
    EXPERIMENTAL_use: vi.fn(),
    unuse: vi.fn(),
    // methods from EventEmitter
    addListener: vi.fn(),
    removeListener: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeAllListeners: vi.fn(),
    setMaxListeners: vi.fn(),
    listeners: vi.fn(),
    emit: vi.fn(),
    listenerCount: vi.fn(),
    sendEventToInsights: vi.fn(),
    future: {
      ...INSTANTSEARCH_FUTURE_DEFAULTS,
      ...(args.future || {}),
    },
    ...args,
  };
};
