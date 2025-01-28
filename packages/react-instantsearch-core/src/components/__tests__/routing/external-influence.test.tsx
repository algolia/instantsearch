/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, waitFor } from '@testing-library/react';
import { historyRouter } from 'instantsearch-core';
import React, { useEffect } from 'react';
import { InstantSearch, SearchBox, useSearchBox } from 'react-instantsearch';

describe('routing with external influence', () => {
  test('keeps on working when the URL is updated by another program', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. External influence: '/about'
    // 4. Refine: '/about?indexName[query]=Samsung'

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

    render(<App />);

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

    // 3. External influence: '/about'
    window.history.pushState({}, '', '/about');

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);

    // 4. Refine: '/about?indexName[query]=Samsung'
    setQuery('Samsung');

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Samsung')}`
      );
    });
  });
});
