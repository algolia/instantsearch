import algoliasearch from 'algoliasearch/lite';
import {
  getByLabelText,
  getAllByText,
  getByText,
  getByTestId,
  queryByTestId,
  // Tip: all queries are also exposed on an object
  // called "queries" which you could import here as well
  wait,
  waitFor,
  fireEvent,
} from '@testing-library/dom';
// adds special assertions like toHaveTextContent
import '@testing-library/jest-dom/extend-expect';

import instantsearch from '../../../index.es';
import { infiniteHits, configure } from '../../';

describe('infiniteHits', () => {
  let search;
  let searchClient;
  let container;

  let cachedState: any;
  let cachedHits: any;
  let customCache;

  beforeEach(() => {
    searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
    search = instantsearch({
      indexName: 'instant_search',
      searchClient,
    });

    container = document.createElement('div');

    const getStateWithoutPage = state => {
      const { page, ...rest } = state || {};
      return rest;
    };
    const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    cachedState = undefined;
    cachedHits = undefined;
    customCache = {
      read: jest.fn(({ state }) => {
        return isEqual(cachedState, getStateWithoutPage(state))
          ? cachedHits
          : null;
      }),
      write: jest.fn(({ state, hits }) => {
        cachedState = getStateWithoutPage(state);
        cachedHits = hits;
      }),
    };
  });

  it('calls read & write methods of custom cache', async () => {
    search.addWidgets([
      configure({
        hitsPerPage: 2,
      }),
      infiniteHits({
        container,
        cache: customCache,
      }),
    ]);
    search.start();

    await waitFor(() => {
      const numberOfHits = container.querySelectorAll('.ais-InfiniteHits-item')
        .length;
      expect(numberOfHits).toEqual(2);
    });

    fireEvent.click(getByText(container, 'Show more results'));
    await waitFor(() => {
      const numberOfHits = container.querySelectorAll('.ais-InfiniteHits-item')
        .length;
      expect(numberOfHits).toEqual(4);
    });

    expect(customCache.read).toHaveBeenCalledTimes(2); // init & render
    expect(customCache.write).toHaveBeenCalledTimes(2); // page #0, page #1
  });

  it('displays all the hits from cache', async () => {
    // flow #1 - load page #0 & #1 to fill the cache
    search.addWidgets([
      configure({
        hitsPerPage: 2,
      }),
      infiniteHits({
        container,
        cache: customCache,
      }),
    ]);
    search.start();

    await waitFor(() => {
      const numberOfHits = container.querySelectorAll('.ais-InfiniteHits-item')
        .length;
      expect(numberOfHits).toEqual(2);
    });

    fireEvent.click(getByText(container, 'Show more results'));
    await waitFor(() => {
      const numberOfHits = container.querySelectorAll('.ais-InfiniteHits-item')
        .length;
      expect(numberOfHits).toEqual(4);
    });

    // flow #2 - new InstantSearch instance to leverage the cache
    const search2 = instantsearch({
      indexName: 'instant_search',
      searchClient,
    });
    const container2 = document.createElement('div');
    search2.addWidgets([
      configure({
        hitsPerPage: 2,
      }),
      infiniteHits({
        container: container2,
        cache: customCache, // same cache object
      }),
    ]);
    search2.start();
    await waitFor(() => {
      const numberOfHits = container.querySelectorAll('.ais-InfiniteHits-item')
        .length;
      expect(numberOfHits).toEqual(4); // it loads two pages initially
    });
  });
});
