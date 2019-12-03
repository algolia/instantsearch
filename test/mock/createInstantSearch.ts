import algoliasearchHelper from 'algoliasearch-helper';
import index from '../../src/widgets/index/index';
import { InstantSearch } from '../../src/types';
import { createSearchClient } from './createSearchClient';
import defer from '../../src/lib/utils/defer';

export const createInstantSearch = (
  args: Partial<InstantSearch> = {}
): InstantSearch => {
  const searchClient = createSearchClient();
  const { indexName = 'indexName' } = args;
  const mainHelper = algoliasearchHelper(searchClient, indexName, {});
  const mainIndex = index({ indexName });

  let started = false;

  return {
    indexName,
    mainIndex,
    mainHelper,
    client: searchClient,
    started,
    start: () => {
      started = true;
    },
    dispose: () => {
      started = false;
    },
    refresh: jest.fn(),
    helper: mainHelper, // @TODO: use the Helper from the index once the RoutingManger uses the index
    templatesConfig: {},
    insightsClient: null,
    middleware: [],
    scheduleStalledRender: defer(jest.fn()),
    scheduleSearch: defer(jest.fn()),
    scheduleRender: defer(jest.fn()),
    _isSearchStalled: true,
    _stalledSearchDelay: 200,
    _searchStalledTimer: null,
    _initialUiState: {},
    _createURL: jest.fn(() => '#'),
    onStateChange: jest.fn(),
    createURL: jest.fn(() => '#'),
    addWidget: jest.fn(),
    addWidgets: jest.fn(),
    removeWidget: jest.fn(),
    removeWidgets: jest.fn(),
    EXPERIMENTAL_use: jest.fn(),
    // methods from EventEmitter
    addListener: jest.fn(),
    removeListener: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    emit: jest.fn(),
    eventNames: jest.fn(),
    listenerCount: jest.fn(),
    ...args,
  };
};
