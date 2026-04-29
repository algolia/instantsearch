/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render } from '@testing-library/react';
import React from 'react';
import { Index, SearchBox } from 'react-instantsearch';

import { InstantSearchNext } from '../InstantSearchNext';

const mockPathname = jest.fn();
const mockSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname() {
    return mockPathname();
  },
  useSearchParams() {
    return mockSearchParams();
  },
}));

describe('routing', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/search');
    mockSearchParams.mockReturnValue(new URLSearchParams());
    window.history.replaceState({}, '', '/search');
  });

  // Reproduces https://github.com/algolia/instantsearch/issues/6980:
  // a nested <Index> only mounts its children on a second render pass, so
  // the on-mount [pathname, searchParams] effect used to wipe the URL.
  it('preserves URL on mount with a nested <Index> and custom stateMapping', async () => {
    const indexName = 'instant_search';
    const indexId = `${indexName}_web`;

    mockSearchParams.mockReturnValue(new URLSearchParams('q=iphone'));
    window.history.replaceState({}, '', '/search?q=iphone');

    const client = createSearchClient();

    await act(async () => {
      render(
        <InstantSearchNext
          searchClient={client}
          routing={{
            router: { writeDelay: 0 },
            stateMapping: {
              stateToRoute(uiState) {
                const query = uiState[indexId]?.query;
                return query ? { q: query } : {};
              },
              routeToState(routeState: { q?: string } = {}) {
                return {
                  [indexId]: {
                    query: routeState.q,
                  },
                };
              },
            },
          }}
        >
          <Index indexName={indexName} indexId={indexId}>
            <SearchBox />
          </Index>
        </InstantSearchNext>
      );
    });

    await act(async () => {
      await wait(0);
    });

    expect(window.location.search).toBe('?q=iphone');
  });

  it('preserves URL on mount without a nested <Index>', async () => {
    const indexName = 'instant_search';

    mockSearchParams.mockReturnValue(new URLSearchParams('q=iphone'));
    window.history.replaceState({}, '', '/search?q=iphone');

    const client = createSearchClient();

    await act(async () => {
      render(
        <InstantSearchNext
          searchClient={client}
          indexName={indexName}
          routing={{
            router: { writeDelay: 0 },
            stateMapping: {
              stateToRoute(uiState) {
                const query = uiState[indexName]?.query;
                return query ? { q: query } : {};
              },
              routeToState(routeState: { q?: string } = {}) {
                return {
                  [indexName]: {
                    query: routeState.q,
                  },
                };
              },
            },
          }}
        >
          <SearchBox />
        </InstantSearchNext>
      );
    });

    await act(async () => {
      await wait(0);
    });

    expect(window.location.search).toBe('?q=iphone');
  });

  it('reacts to pathname/searchParams changes after mount', async () => {
    const indexName = 'indexName';

    mockSearchParams.mockReturnValue(new URLSearchParams());
    window.history.replaceState({}, '', '/search');

    const client = createSearchClient();

    const routing = { router: { writeDelay: 0 } };

    const { rerender } = render(
      <InstantSearchNext
        searchClient={client}
        indexName={indexName}
        routing={routing}
      >
        <SearchBox />
      </InstantSearchNext>
    );

    await act(async () => {
      await wait(0);
    });

    expect(window.location.search).toBe('');

    // Simulate Next.js client-side navigation updating
    // `pathname`/`searchParams` to a URL that already has the query in it.
    mockPathname.mockReturnValue('/search');
    mockSearchParams.mockReturnValue(
      new URLSearchParams('indexName%5Bquery%5D=iphone')
    );
    window.history.pushState({}, '', '/search?indexName%5Bquery%5D=iphone');

    await act(async () => {
      rerender(
        <InstantSearchNext
          searchClient={client}
          indexName={indexName}
          routing={routing}
        >
          <SearchBox />
        </InstantSearchNext>
      );
    });

    await act(async () => {
      await wait(0);
    });

    expect(window.location.search).toBe('?indexName%5Bquery%5D=iphone');
  });
});

afterAll(() => {
  jest.resetAllMocks();
});
