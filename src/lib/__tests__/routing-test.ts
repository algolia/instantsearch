import { createSearchClient } from '../../../test/mock/createSearchClient';
import { wait } from '../../../test/utils/wait';
import historyRouter from '../routers/history';
import instantsearch from '../..';
import { connectSearchBox } from '../../connectors';

describe('routing', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('writeOnDispose=true', () => {
    test('cleans URL on dispose', async () => {
      const pushState = jest.spyOn(window.history, 'pushState');
      const writeDelay = 400;

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

      // Wait for ${writeDelay} to pass then check URL has been initialized
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(0);

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Wait for ${writeDelay} to pass then check URL has been updated
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);

      // Trigger a dispose
      search.dispose();

      // Wait for ${writeDelay} to pass then check URL has been cleaned
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    });

    test('refine after dispose', async () => {
      const pushState = jest.spyOn(window.history, 'pushState');
      const writeDelay = 400;

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

      // Wait for ${writeDelay} to pass then check URL has been initialized
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(0);

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Wait for ${writeDelay} to pass then check URL has been updated
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);

      // Trigger a dispose
      search.dispose();

      // Wait for ${writeDelay} to pass then check URL has been cleaned
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Wait for ${writeDelay} to pass then check URL has not been updated
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(2);
    });
  });

  describe('writeOnDispose=false', () => {
    test('does not clean URL on dispose', async () => {
      const pushState = jest.spyOn(window.history, 'pushState');
      const writeDelay = 400;

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

      // Wait for ${writeDelay} to pass then check URL has been initialized
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual('');
      expect(pushState).toHaveBeenCalledTimes(0);

      // Trigger an update - push a change
      search.renderState.indexName!.searchBox!.refine('Apple');

      // Wait for ${writeDelay} to pass then check URL has been updated
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);

      // Trigger a dispose
      search.dispose();

      // Wait for ${writeDelay} to pass then check URL has been cleaned
      await wait(1.5 * writeDelay);
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
      expect(pushState).toHaveBeenCalledTimes(1);
    });
  });
});
