/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import { instantsearch, historyRouter, connectSearchBox } from '../..';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 10 * writeDelay;

describe('routing with no navigation', () => {
  test('cleans the URL when InstantSearch is disposed within the same page', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: '/'

    const pushState = jest.spyOn(window.history, 'pushState');

    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      routing: {
        router: historyRouter({
          writeDelay,
          cleanUrlOnDispose: true,
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
      expect(window.location.pathname).toEqual('/');
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
  });
});
