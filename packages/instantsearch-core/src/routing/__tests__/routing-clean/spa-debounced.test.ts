/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import { instantsearch, historyRouter, connectSearchBox } from '../../..';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 10 * writeDelay;

describe('routing with debounced third-party client-side router', () => {
  test('does not clean the URL after navigating', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: '/'
    // 4. Route change: '/about'
    // 5. Back: '/'
    // 6. Back: '/?indexName[query]=Apple'

    const pushState = jest.spyOn(window.history, 'pushState');

    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      routing: {
        router: historyRouter({
          cleanUrlOnDispose: true,
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

    // 3. Dispose: '/'
    {
      search.dispose();

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    }

    // 4. Route change: '/about'
    {
      window.history.pushState({}, '', '/about');

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(3);
    }

    // 5. Back: '/'
    {
      window.history.back();

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('');
    }

    // 6. Back: '/?indexName[query]=Apple'
    {
      window.history.back();

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(3);
    }
  });
});
