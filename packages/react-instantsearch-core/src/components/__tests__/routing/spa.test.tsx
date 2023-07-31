/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import historyRouter from 'instantsearch.js/es/lib/routers/history';
import React from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch';

describe('routing with third-party client-side router', () => {
  test('does not clean the URL after navigating', async () => {
    // -- Flow
    // 1. Initial: '/'
    // 2. Refine: '/?indexName[query]=Apple'
    // 3. Navigate: '/about'
    // 4. Back: '/?indexName[query]=Apple'

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

    // 3. Navigate: '/about'
    unmount();
    window.history.pushState({}, '', '/about');

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/about');
      expect(window.location.search).toEqual('');
    });
    expect(pushState).toHaveBeenCalledTimes(2);

    // 4. Back to previous page
    window.history.back();

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/');
      expect(window.location.search).toEqual(
        `?${encodeURI('indexName[query]=Apple')}`
      );
    });
  });
});
