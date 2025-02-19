/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { historyRouter } from 'instantsearch-core';
import React from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch';

describe('routing with debounced third-party client-side router', () => {
  test('does not clean the URL after navigating', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: '/?indexName[query]=Apple'
    // 4. Route change: '/about'
    // 5. Back: '/?indexName[query]=Apple'
    // 6. Back: '/'

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
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
    });
    expect(pushState).toHaveBeenCalledTimes(1);

    // 3. Dispose: '/?indexName[query]=Apple'
    unmount();

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
    });
    expect(pushState).toHaveBeenCalledTimes(1);

    // 4. Route change: '/about'
    window.history.pushState({}, '', '/about');

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);

    // 5. Back: '/?indexName[query]=Apple'
    window.history.back();

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
    });

    // 6. Back: '/
    window.history.back();

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);
  });
});
