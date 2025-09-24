/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import instantsearch from '../../..';
import { connectSearchBox } from '../../../connectors';
import historyRouter from '../../routers/history';

import type InstantSearch from '../../InstantSearch';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 10 * writeDelay;

const addWidgetsAndStart = (search: InstantSearch) => {
  search.addWidgets([connectSearchBox(() => {})({})]);
  search.start();
};

describe('routing back and forth to an InstantSearch instance', () => {
  test('updates the URL after the instance is disposed then restarted', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: '/'
    // 4. Refine: '/'
    // 5. Start: '/'
    // 6. Refine: '/?indexName[query]=Apple'

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
      addWidgetsAndStart(search);

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
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    }

    // 4. Refine: '/'
    {
      search.renderState.indexName.searchBox!.refine('Apple');

      await wait(writeWait);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    }

    // 5. Start: '/'
    {
      addWidgetsAndStart(search);

      await wait(writeWait);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    }

    // 6. Refine: '/?indexName[query]=Apple'
    {
      search.renderState.indexName.searchBox!.refine('Samsung');

      await wait(writeWait);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Samsung')}`
      );
      expect(pushState).toHaveBeenCalledTimes(3);
    }
  });
});
