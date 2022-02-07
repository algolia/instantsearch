import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { wait } from '../../../../test/utils/wait';
import historyRouter from '../../routers/history';
import instantsearch from '../../..';
import { connectSearchBox } from '../../../connectors';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 1.5 * writeDelay;

describe('routing using `replaceState`', () => {
  // We can't assert whether another router did update the URL
  // So there's no way to prevent `write` after `dispose`
  test('cleans the URL after navigating', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: '/about'
    // 4. Route change (with `replaceState`): '/about'
    // 5. Back: '/about'

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

    // 1. Initial: '/'
    {
      search.addWidgets([connectSearchBox(() => {})({})]);
      search.start();

      await wait(writeWait);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(0);
    }

    // 2. Refine: '/?indexName[query]=Apple'
    {
      search.renderState.indexName!.searchBox!.refine('Apple');

      await wait(writeWait);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);
    }

    // 3. Dispose: '/about'
    // 4. Route change (with `replaceState`): '/about'
    {
      search.dispose();
      window.history.replaceState({}, '', '/about');

      // Asserting `replaceState` call
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(1);

      // Asserting `dispose` calling `pushState`
      await wait(writeWait);
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    }

    // 5. Back: '/about'
    {
      window.history.back();

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
    }
  });
});
