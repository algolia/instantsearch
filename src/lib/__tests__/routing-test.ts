import { createSearchClient } from '../../../test/mock/createSearchClient';
import { wait } from '../../../test/utils/wait';
import historyRouter from '../routers/history';
import instantsearch from '../..';
import { connectSearchBox } from '../../connectors';

const writeDelay = 10;
const writeWait = 1.5 * writeDelay;

describe('routing', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', 'http://localhost/');
    jest.clearAllMocks();
  });

  test('SPA (Single Page App) use case: URL should not be cleaned', async () => {
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

    // Navigate to a new page (like a router would do)
    window.history.pushState({}, '', '/about');

    // Check URL has been updated to new page
    await wait(writeWait);
    expect(window.location.search).toEqual('');
    expect(window.location.pathname).toEqual('/about');
    expect(pushState).toHaveBeenCalledTimes(2);

    // Go back to previous page
    window.history.back();

    // Check URL has been updated to previous page
    await wait(writeWait);
    expect(window.location.search).toEqual(
      `?${encodeURI('indexName[query]=Apple')}`
    );
    expect(window.location.pathname).toEqual('/');
  });

  test('Modal use case: dispose is manually called', async () => {
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

    // Trigger a dispose (modal closed, for example)
    search.dispose();

    // Check URL has been cleaned
    await wait(writeWait);
    expect(window.location.search).toEqual('');
    expect(pushState).toHaveBeenCalledTimes(2);
  });
});
