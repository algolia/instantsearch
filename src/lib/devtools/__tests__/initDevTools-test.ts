import { DevToolsWindow } from '../initDevTools';
import instantsearch from '../../main';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import connectSearchBox from '../../../connectors/search-box/connectSearchBox';

describe('initDevTools', () => {
  beforeEach(() => {
    delete (window as any).__INSTANTSEARCH_DEVTOOLS__;
  });

  test('does not attach the dev tools if it is not in the global object', () => {
    const search = instantsearch({
      searchClient: createSearchClient(),
      indexName: 'indexName',
    });

    search.start();

    expect(search.middleware).toEqual([]);
    expect(search._isDevToolsAttached).toEqual(false);
  });

  test('attaches the dev tools on start if it is in the global object', () => {
    const devToolsWindow = window as DevToolsWindow;
    const devToolsMiddleware = {
      onStateChange() {},
      subscribe() {},
      unsubscribe() {},
    };

    devToolsWindow.__INSTANTSEARCH_DEVTOOLS__ = {
      version: '1.0.0',
      getMiddleware: jest.fn(() => () => {
        return devToolsMiddleware;
      }),
    };

    const addAlgoliaAgent = jest.fn();
    const search = instantsearch({
      searchClient: createSearchClient({ addAlgoliaAgent } as any),
      indexName: 'indexName',
    });

    search.start();

    expect(search.middleware).toContain(devToolsMiddleware);
    expect(addAlgoliaAgent).toHaveBeenCalledWith(
      `instantsearch-devtools (1.0.0)`
    );
    expect(search._isDevToolsAttached).toEqual(true);
  });

  test('attaches the dev tools after start if it is in the global object', () => {
    const addAlgoliaAgent = jest.fn();
    const search = instantsearch({
      searchClient: createSearchClient({ addAlgoliaAgent } as any),
      indexName: 'indexName',
    });
    let triggerSearch;
    const searchBox = connectSearchBox(({ refine }, isFirstRender) => {
      if (isFirstRender) {
        triggerSearch = refine;
      }
    });

    search.addWidgets([searchBox()]).start();

    const devToolsWindow = window as DevToolsWindow;
    const devToolsMiddleware = {
      onStateChange() {},
      subscribe() {},
      unsubscribe() {},
    };

    devToolsWindow.__INSTANTSEARCH_DEVTOOLS__ = {
      version: '1.0.0',
      getMiddleware: jest.fn(() => () => {
        return devToolsMiddleware;
      }),
    };

    // Simulate a state change
    triggerSearch('Search');

    expect(search.middleware).toContain(devToolsMiddleware);
    expect(addAlgoliaAgent).toHaveBeenCalledWith(
      `instantsearch-devtools (1.0.0)`
    );
    expect(search._isDevToolsAttached).toEqual(true);
  });
});
