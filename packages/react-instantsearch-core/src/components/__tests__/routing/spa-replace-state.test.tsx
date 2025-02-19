/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { historyRouter } from 'instantsearch-core';
import React from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch';

describe('routing using `replaceState`', () => {
  // We can't assert whether another router did update the URL
  // So there's no way to prevent `write` after `dispose`
  test('cleans the URL after navigating', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Dispose: does not write
    // 4. Route change (with `replaceState`): '/about?external=true', replaces state 2
    // 5. Dispose: does not write
    // 6. Back: '/about?external=true'

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

    // 3. Dispose: '/about'
    unmount();

    // 4. Route change (with `replaceState`): '/about'
    window.history.replaceState({}, '', '/about?external=true');

    // Asserting `replaceState` call
    expect(window.location.pathname).toEqual('/about');
    expect(window.location.search).toEqual('?external=true');
    expect(pushState).toHaveBeenCalledTimes(1);

    // Asserting `dispose` not calling `pushState`
    await waitFor(() => {
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('?external=true');
    });
    expect(pushState).toHaveBeenCalledTimes(1);

    // 5. Back: '/'
    window.history.back();

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual('');
    });
  });
});
