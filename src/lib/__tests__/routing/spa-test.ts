import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { wait } from '../../../../test/utils/wait';
import historyRouter from '../../routers/history';
import instantsearch from '../../..';
import { connectSearchBox } from '../../../connectors';

/* eslint no-lone-blocks: "off" */

const writeDelay = 10;
const writeWait = 1.5 * writeDelay;

describe('routing with third-party client-side router', () => {
  test('does not clean the URL after navigating', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Navigate: '/about'
    // 4. Back: '/?indexName[query]=Apple'

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

    // 3. Navigate: '/about'
    {
      search.dispose();
      window.history.pushState({}, '', '/about');

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    }

    // 4. Back to previous page
    {
      window.history.back();

      await wait(writeWait);
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
    }
  });
});
