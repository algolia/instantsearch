/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import instantsearch from '../../..';
import { connectSearchBox } from '../../../connectors';
import historyRouter from '../../routers/history';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 10 * writeDelay;

describe('routing using `replaceState`', () => {
  // We can't assert whether another router did update the URL
  // So there's no way to prevent `write` after `dispose`
  test('cleans the URL after navigating', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: does not yet write
    // 4. Route change (with `replaceState`): '/about?external=true', replaces state 2
    // 5. Dispose: writes '/about' (this is a bug, and should be fixed when we have a way to prevent it)
    // 6. Back: '/about?external=true'

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
      search.renderState.indexName.searchBox!.refine('Apple');

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
      window.history.replaceState({}, '', '/about?external=true');

      // Asserting `replaceState` call
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('?external=true');
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
      expect(window.location.search).toEqual('?external=true');
    }
  });
});
