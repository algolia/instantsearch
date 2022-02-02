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

  test('Modal use case: dispose is manually called', async () => {
    // --- Flow
    // Initial: '/'
    // Refine: '/?indexName[query]=Apple'
    // Dispose: '/'

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
    expect(window.location.pathname).toEqual('/');
    expect(window.location.search).toEqual(
      `?${encodeURI('indexName[query]=Apple')}`
    );
    expect(pushState).toHaveBeenCalledTimes(1);

    // Trigger a dispose (modal closed, for example)
    search.dispose();

    // Check URL has been cleaned
    await wait(writeWait);
    expect(window.location.pathname).toEqual('/');
    expect(window.location.search).toEqual('');
    expect(pushState).toHaveBeenCalledTimes(2);
  });
});
