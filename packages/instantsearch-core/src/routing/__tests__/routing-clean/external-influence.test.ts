/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import { instantsearch, historyRouter, connectSearchBox } from '../../..';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 10 * writeDelay;

describe('routing with external influence', () => {
  test('keeps on working when the URL is updated by another program', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. External influence: '/about'
    // 4. Refine: '/about?indexName[query]=Samsung'

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

    // 3. External influence: '/about'
    {
      window.history.pushState({}, '', '/about');

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    }

    // 4. Refine: '/about?indexName[query]=Samsung'
    {
      search.renderState.indexName.searchBox!.refine('Samsung');

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Samsung')}`
      );
    }
  });
});
