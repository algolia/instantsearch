import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import { connectSearchBox } from '../../connectors';
import instantsearch from '../../index.es';

import type InstantSearch from '../InstantSearch';

function createDelayedSearchClient(timeout: number) {
  const searchClient = createSearchClient();
  const searchFn = searchClient.search;
  searchClient.search = (args) => wait(timeout).then(() => searchFn(args));

  return searchClient;
}

const virtualSearchBox = connectSearchBox(() => {});

describe('status', () => {
  test('is initially "idle"', () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createDelayedSearchClient(20),
    });

    expect(search.status).toBe('idle');
  });

  test('stays "idle" after calling `start()` when there are no widgets', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createDelayedSearchClient(20),
    });

    search.start();

    await wait(0);

    expect(search.status).toBe('idle');
  });

  test('becomes "loading" after calling `start()` when there are widgets', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createDelayedSearchClient(20),
    });

    search.addWidgets([virtualSearchBox({})]);

    search.start();

    await wait(0);

    expect(search.status).toBe('loading');

    // pending promises need to be resolved before test is over
    await wait(20);
  });

  test('reaches idle after results return', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createDelayedSearchClient(20),
    });
    search.addWidgets([virtualSearchBox({})]);
    search.start();
    await wait(0);
    expect(search.status).toBe('loading');

    await wait(20);

    expect(search.status).toBe('idle');
  });

  test('becomes "loading" when refining the search', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createDelayedSearchClient(20),
    });
    search.addWidgets([virtualSearchBox({})]);
    search.start();
    await wait(0);
    expect(search.status).toBe('loading');
    await wait(20);
    expect(search.status).toBe('idle');

    search.renderState.indexName.searchBox!.refine('lol new query');

    await wait(0);

    expect(search.status).toBe('loading');

    await wait(20);

    expect(search.status).toBe('idle');
  });

  test('becomes "loading" when calling `addWidgets()` after search', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createDelayedSearchClient(20),
    });
    search.addWidgets([virtualSearchBox({})]);
    search.start();
    await wait(0);
    expect(search.status).toBe('loading');
    await wait(20);
    expect(search.status).toBe('idle');

    search.addWidgets([virtualSearchBox({})]);

    await wait(0);

    expect(search.status).toBe('loading');

    await wait(20);

    expect(search.status).toBe('idle');
  });

  test('becomes "loading" when calling `removeWidgets()` after search', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createDelayedSearchClient(20),
    });
    const firstWidget = virtualSearchBox({});
    search.addWidgets([firstWidget, virtualSearchBox({})]);
    search.start();
    await wait(0);
    expect(search.status).toBe('loading');
    await wait(20);
    expect(search.status).toBe('idle');

    search.removeWidgets([firstWidget]);

    await wait(0);

    expect(search.status).toBe('loading');

    await wait(20);

    expect(search.status).toBe('idle');
  });

  test('becomes "stalled" when the API takes longer than the `stalledSearchDelay` to respond', async () => {
    const stalledSearchDelay = 400;
    const requestTime = 500;
    const search = instantsearch({
      indexName: 'indexName',
      stalledSearchDelay,
      searchClient: createDelayedSearchClient(requestTime),
    });
    search.addWidgets([virtualSearchBox({})]);
    search.start();
    await wait(0);
    expect(search.status).toBe('loading');

    await wait(stalledSearchDelay);

    expect(search.status).toBe('stalled');

    await wait(requestTime - stalledSearchDelay);

    expect(search.status).toBe('idle');
  });

  test('becomes "error" on error and stores the error', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient({
        search() {
          return Promise.reject(new Error('Search error'));
        },
      }),
    });

    // prevent rethrow of error
    search.on('error', () => {});

    search.addWidgets([virtualSearchBox({})]);
    search.start();
    await wait(0);

    expect(search.status).toBe('error');
    expect(search.error).toEqual(expect.any(Error));
    expect(search.error?.message).toEqual('Search error');
  });

  test('lets users render on error with the `render` event', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient({
        search() {
          return Promise.reject(new Error('Search error'));
        },
      }),
    });

    // prevent rethrow of error
    search.on('error', () => {});

    const renderer = jest.fn(
      (_: { status: InstantSearch['status']; error?: Error }) => undefined
    );
    search.on('render', () =>
      renderer({ status: search.status, error: search.error })
    );

    search.addWidgets([virtualSearchBox({})]);
    search.start();
    await wait(0);

    expect(renderer).toHaveBeenCalledTimes(2);
    const [[firstRender], [secondRender]] = renderer.mock.calls;

    expect(firstRender.status).toBe('loading');
    expect(firstRender.error).toEqual(undefined);

    expect(secondRender.status).toBe('error');
    expect(secondRender.error).toEqual(expect.any(Error));
    expect(secondRender.error?.message).toEqual('Search error');
  });
});
