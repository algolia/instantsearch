import { createSearchClient } from '../../../test/mock/createSearchClient';
import { wait } from '../../../test/utils/wait';
import historyRouter from '../routers/history';
import instantsearch from '../..';
import { connectSearchBox } from '../../connectors';

const writeDelay = 10;
const writeWait = 1.5 * writeDelay;

// This test may tear and not execute the tests in the right order.
// It seems to be related to a timing issue but we are not sure.

describe('routing', () => {
  beforeEach(() => {
    window.history.pushState({}, '', 'http://localhost/');
    jest.clearAllMocks();
  });

  describe('writeOnDispose=true', () => {
    test('cleans URL on dispose', async () => {
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

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Check URL has been updated
      await wait(writeWait);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);

      // Trigger a dispose
      search.dispose();

      // Check URL has been cleaned
      await wait(writeWait);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    });

    test('refine after dispose', async () => {
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

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Trigger a dispose
      search.dispose();

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Check URL has not been updated
      await wait(writeWait);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(1);
    });

    test('URL is updated after starting instantsearch again', async () => {
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

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Query');

      // Check URL has been updated
      await wait(writeWait);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Query')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);

      // Trigger a dispose
      search.dispose();

      // Check URL has been cleaned
      await wait(writeWait);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);

      // Start again
      search.addWidgets([connectSearchBox(() => {})({})]);

      search.start();

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Test');

      // Check URL has been updated
      await wait(writeWait);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Test')}`
      );
      expect(pushState).toHaveBeenCalledTimes(3);
    });
  });

  describe('writeOnDispose=false', () => {
    test('does not clean URL on dispose', async () => {
      const pushState = jest.spyOn(window.history, 'pushState');

      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
        routing: {
          router: historyRouter({
            writeDelay,
            writeOnDispose: false,
          }),
        },
      });

      search.addWidgets([connectSearchBox(() => {})({})]);

      search.start();

      // Check URL has been initialized
      await wait(writeWait);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(0);

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Check URL has been updated
      await wait(writeWait);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);

      // Trigger a dispose
      search.dispose();

      // Check URL has not been cleaned
      await wait(writeWait);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);
    });
  });
});
