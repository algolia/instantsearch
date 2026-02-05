/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import {
  instantsearch,
  historyRouter,
  connectPagination,
  connectSearchBox,
} from '../../..';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 10 * writeDelay;

test('does not write the same URL twice', async () => {
  // -- Flow
  // 0. page is filtered out via stateMapping
  // 1. Initial: '/'
  // 2. Refine query: '/?indexName[query]=Apple' (writes)
  // 3. Refine page: '/?indexName[query]=Apple' (does not write)

  const pushState = jest.spyOn(window.history, 'pushState');

  const search = instantsearch({
    indexName: 'indexName',
    searchClient: createSearchClient(),
    routing: {
      stateMapping: {
        stateToRoute(uiState) {
          return Object.fromEntries(
            Object.entries(uiState).map(
              ([indexId, { page, ...indexUiState }]) => [indexId, indexUiState]
            )
          );
        },
        routeToState(routeState) {
          return routeState;
        },
      },
      router: historyRouter({
        cleanUrlOnDispose: true,
        writeDelay,
      }),
    },
  });

  // 1. Initial: '/'
  {
    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
    ]);
    search.start();

    await wait(writeWait);
    expect(window.location.search).toEqual('');
    expect(pushState).toHaveBeenCalledTimes(0);
  }

  // 2. Refine query: '/?indexName[query]=Apple'
  {
    search.renderState.indexName.searchBox!.refine('Apple');

    await wait(writeWait);
    expect(window.location.search).toEqual(
      `?${encodeURI('indexName[query]=Apple')}`
    );
    expect(pushState).toHaveBeenCalledTimes(1);
  }

  // 3. Refine page: '/?indexName[query]=Apple'
  {
    search.renderState.indexName.pagination!.refine(2);

    await wait(writeWait);
    expect(window.location.search).toEqual(
      `?${encodeURI('indexName[query]=Apple')}`
    );
    expect(pushState).toHaveBeenCalledTimes(1);
  }
});
