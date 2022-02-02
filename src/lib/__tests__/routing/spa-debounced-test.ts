import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { wait } from '../../../../test/utils/wait';
import historyRouter from '../../routers/history';
import instantsearch from '../../..';
import { connectSearchBox } from '../../../connectors';

const writeDelay = 10;
const writeWait = 1.5 * writeDelay;

describe('routing', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', 'http://localhost/');
    jest.clearAllMocks();
  });

  test('SPA debounced (Single Page App) use case: URL should not be cleaned', async () => {
    // --- Flow
    // Initial: '/'
    // Refine: '/?indexName[query]=Apple'
    // Dispose: '/'
    // Route change: '/about'
    // Back: '/'
    // Back: '/?indexName[query]=Apple'

    const pushState = jest.spyOn(window.history, 'pushState');

    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      routing: {
        router: historyRouter({
          writeDelay,
        }),
      },
    });

    search.addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    // Check URL has been initialized
    await wait(writeWait);
    expect(window.location.search).toEqual('');
    expect(pushState).toHaveBeenCalledTimes(0);

    // Trigger an update by refining
    search.renderState.indexName!.searchBox!.refine('Apple');

    // Check URL has been updated
    await wait(writeWait);
    expect(window.location.search).toEqual(
      `?${encodeURI('indexName[query]=Apple')}`
    );
    expect(pushState).toHaveBeenCalledTimes(1);

    // Trigger a dispose
    search.dispose();

    // Check URL has been updated to new page
    await wait(writeWait);
    expect(window.location.pathname).toEqual('/');
    expect(window.location.search).toEqual('');
    expect(pushState).toHaveBeenCalledTimes(2);

    // Navigate to a new page (like a router would do)
    window.history.pushState({}, '', '/about');

    // Check URL has been updated to new page
    await wait(writeWait);
    expect(window.location.pathname).toEqual('/about');
    expect(window.location.search).toEqual('');
    expect(pushState).toHaveBeenCalledTimes(3);

    // Go back to previous page without the refinement
    window.history.back();

    // Check URL has been updated to previous page
    await wait(writeWait);
    expect(window.location.pathname).toEqual('/');
    expect(window.location.search).toEqual('');

    // Go back to previous page with the refinement
    window.history.back();

    // Check URL has been updated to previous page
    await wait(writeWait);
    expect(window.location.pathname).toEqual('/');
    expect(window.location.search).toEqual(
      `?${encodeURI('indexName[query]=Apple')}`
    );
    expect(pushState).toHaveBeenCalledTimes(3);
  });
});
