import { createSearchClient } from '../../../test/mock/createSearchClient';
import { wait } from '../../../test/utils/wait';
import instantsearch from '../../index.es';
import { searchBox } from '../../widgets';

describe('router', () => {
  it('sets initial ui state by reading URL before start', () => {
    const searchClient = createSearchClient();
    const search = instantsearch({
      indexName: 'my-index',
      searchClient,
      initialUiState: {
        'other-index': { query: 'dogs' },
      },
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

    expect(search._initialUiState).toMatchInlineSnapshot(`
      {
        "my-index": {
          "query": "iPhone",
        },
        "other-index": {
          "query": "dogs",
        },
      }
    `);
  });

  it('sets initial ui state by reading URL on subscribe', async () => {
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
});
