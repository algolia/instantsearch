import { createSearchClient } from '../../../test/mock/createSearchClient';
import { runAllMicroTasks } from '../../../test/utils/runAllMicroTasks';
import instantsearch from '../../index.es';
import { searchBox } from '../../widgets';

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

    await runAllMicroTasks();

    expect(search.getUiState()).toMatchInlineSnapshot(`
      Object {
        "my-index": Object {
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
    await runAllMicroTasks();
    expect(search.getUiState()).toMatchInlineSnapshot(`
      Object {
        "my-index": Object {
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
    await runAllMicroTasks();
    expect(search.getUiState()).toMatchInlineSnapshot(`
      Object {
        "my-index": Object {
          "query": "MacBook",
        },
      }
    `);
  });
});
