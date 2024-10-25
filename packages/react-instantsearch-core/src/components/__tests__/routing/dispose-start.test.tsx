/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, waitFor } from '@testing-library/react';
import { historyRouter } from 'instantsearch-core';
import React, { useEffect } from 'react';
import { InstantSearch, SearchBox, useSearchBox } from 'react-instantsearch';

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
    const searchClient = createSearchClient({});

    let setQuery = (_query: string) => {};
    function QueryController() {
      const { refine } = useSearchBox();

      useEffect(() => {
        setQuery = refine;
      }, [refine]);

      return null;
    }

    function App() {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          routing={{ router: historyRouter({ writeDelay: 0 }) }}
        >
          <QueryController />
          <SearchBox />
        </InstantSearch>
      );
    }

    const { unmount } = render(<App />);

    // 1. Initial: '/'
    await waitFor(() => {
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(0);

    // 2. Refine: '/?indexName[query]=Apple'
    setQuery('Apple');

    await waitFor(() => {
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
    });
    expect(pushState).toHaveBeenCalledTimes(1);

    // 3. Dispose: '/'
    unmount();

    await waitFor(() => {
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);

    // 4. Refine: '/'
    setQuery('Apple');

    await waitFor(() => {
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);

    // 5. Start: '/'
    render(<App />);

    await waitFor(() => {
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);

    // 6. Refine: '/?indexName[query]=Samsung'
    setQuery('Samsung');

    await waitFor(() => {
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Samsung')}`
      );
    });
    expect(pushState).toHaveBeenCalledTimes(3);
  });
});
