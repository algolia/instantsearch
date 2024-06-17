/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import instantsearch from '../../index.es';
import { searchBox } from '../../widgets';

import type { Router } from '../../index.es';

describe('router', () => {
  it('sets initial ui state after reading URL', async () => {
    const searchClient = createSearchClient();
    const search = instantsearch({
      indexName: 'my-index',
      searchClient,
      routing: {
        router: {
          onUpdate: () => {},
          read: () => {
            return {
              'my-index': {
                query: 'iPhone',
              },
            };
          },
          write: () => {},
          createURL: () => '',
          dispose: () => {},
        },
      },
    });
    search.addWidgets([
      searchBox({ container: document.createElement('div') }),
    ]);
    search.start();

    await wait(0);

    expect(search.getUiState()).toMatchInlineSnapshot(`
      {
        "my-index": {
          "query": "iPhone",
        },
      }
    `);
  });

  it('sets initial ui state correctly when instantSearchInstance is re-used', async () => {
    const currentRouteState = {
      value: {
        'my-index': {
          query: 'iPhone',
        },
      },
    };
    const searchClient = createSearchClient();
    const search = instantsearch({
      indexName: 'my-index',
      searchClient,
      routing: {
        router: {
          onUpdate: () => {},
          read: () => {
            return currentRouteState.value;
          },
          write: () => {},
          createURL: () => '',
          dispose: () => {},
        },
      },
    });
    search.addWidgets([
      searchBox({ container: document.createElement('div') }),
    ]);
    search.start();
    await wait(0);
    expect(search.getUiState()).toMatchInlineSnapshot(`
      {
        "my-index": {
          "query": "iPhone",
        },
      }
    `);

    search.dispose();
    currentRouteState.value = {
      'my-index': {
        query: 'MacBook',
      },
    };
    search.addWidgets([
      searchBox({ container: document.createElement('div') }),
    ]);
    search.start();
    await wait(0);
    expect(search.getUiState()).toMatchInlineSnapshot(`
      {
        "my-index": {
          "query": "MacBook",
        },
      }
    `);
  });

  it('does not update ui state with onUpdate if no widgets have been added', async () => {
    const state = {
      'my-index': {
        query: 'iPhone',
      },
    };

    const searchClient = createSearchClient();
    const router: Router = {
      onUpdate: jest.fn((callback) => {
        callback(state);
      }),
      read: () => state,
      write: () => {},
      createURL: () => '',
      dispose: () => {},
    };

    const search = instantsearch({
      indexName: 'my-index',
      searchClient,
      routing: {
        router,
      },
    });

    const setUiStateSpy = jest.spyOn(search, 'setUiState');
    search.start();

    await wait(0);

    expect(router.onUpdate).toHaveBeenCalledTimes(1);
    expect(setUiStateSpy).not.toHaveBeenCalled();
  });

  it('warns if initialUiState and routing are used together', () => {
    const state = {
      'my-index': {
        query: 'iPhone',
      },
    };

    const searchClient = createSearchClient();
    const router: Router = {
      onUpdate: jest.fn((callback) => {
        callback(state);
      }),
      read: () => state,
      write: () => {},
      createURL: () => '',
      dispose: () => {},
    };

    const search = instantsearch({
      indexName: 'my-index',
      searchClient,
      initialUiState: {
        'my-index': {
          query: 'MacBook',
        },
      },
      routing: {
        router,
      },
    });

    expect(() => {
      search.start();
    }).toWarnDev(
      '[InstantSearch.js]: Using `initialUiState` together with routing is not recommended. The `initialUiState` will be overwritten by the URL parameters.'
    );
  });

  it("does not warn if initialUiState isn't used", () => {
    const state = {
      'my-index': {
        query: 'iPhone',
      },
    };

    const searchClient = createSearchClient();
    const router: Router = {
      onUpdate: jest.fn((callback) => {
        callback(state);
      }),
      read: () => state,
      write: () => {},
      createURL: () => '',
      dispose: () => {},
    };

    const search = instantsearch({
      indexName: 'my-index',
      searchClient,
      initialUiState: {},
      routing: {
        router,
      },
    });

    expect(() => {
      search.start();
    }).not.toWarnDev();
  });
});
