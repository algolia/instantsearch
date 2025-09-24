/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import historyRouter from 'instantsearch.js/es/lib/routers/history';
import React from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch';

describe('routing with no navigation', () => {
  test('cleans the URL when InstantSearch is disposed within the same page', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: '/'

    const pushState = jest.spyOn(window.history, 'pushState');
    const searchClient = createSearchClient({});

    function App() {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          routing={{ router: historyRouter({ writeDelay: 0 }) }}
        >
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
    userEvent.type(screen.getByRole('searchbox'), 'Apple');

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
    });
    expect(pushState).toHaveBeenCalledTimes(1);

    // 3. Dispose: '/'
    unmount();

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);
  });
});
