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

// Count how many times the router's `onUpdate` callback is invoked. The hook
// captures `onUpdate` through the history router's `start` option, so we wrap
// `start` to increment a counter whenever the stored callback fires.
let onUpdateCalls = 0;
jest.mock('instantsearch.js/es/lib/routers/history', () => {
  const actual = jest.requireActual('instantsearch.js/es/lib/routers/history');
  return {
    __esModule: true,
    ...actual,
    default: (options: { start?: (onUpdate: () => void) => void }) => {
      const originalStart = options.start;
      if (typeof originalStart === 'function') {
        options.start = (onUpdate: () => void) =>
          originalStart(() => {
            onUpdateCalls += 1;
            return onUpdate();
          });
      }
      return actual.default(options);
    },
  };
});

describe('routing', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/search');
    mockSearchParams.mockReturnValue(new URLSearchParams());
    window.history.replaceState({}, '', '/search');
    onUpdateCalls = 0;
    // The hook reads the document's initial path from the Navigation Timing
    // API to tell hydration apart from client-side navigation. jsdom doesn't
    // implement it, so we define it to simulate a document hard-loaded on
    // `/search` (this also exercises the production path rather than the
    // fallback).
    Object.defineProperty(performance, 'getEntriesByType', {
      configurable: true,
      value: () => [{ name: 'http://localhost/search' }],
    });
  });

  afterEach(() => {
    delete (performance as unknown as Record<string, unknown>)
      .getEntriesByType;
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

  // Reproduces https://github.com/algolia/instantsearch/issues/7060:
  // on client-side navigation the App Router remounts `InstantSearchNext`, so
  // the routing effect runs as a "first run" again. It must still call
  // `onUpdate` to refresh the results, otherwise the new page shows stale or
  // empty hits until a full reload.
  it('runs onUpdate when remounting on a new route after navigation', async () => {
    const indexName = 'indexName';
    const routing = { router: { writeDelay: 0 } };

    // Initial hydration on `/search`.
    const { unmount } = render(
      <InstantSearchNext
        searchClient={createSearchClient()}
        indexName={indexName}
        routing={routing}
      >
        <SearchBox />
      </InstantSearchNext>
    );

    await act(async () => {
      await wait(0);
    });

    // The initial render must not re-run `onUpdate` (it would wipe the URL with
    // a nested `<Index>`, see #6980).
    expect(onUpdateCalls).toBe(0);

    unmount();

    // Simulate a client-side navigation to a different route, then mount a fresh
    // instance for it (as the App Router does on a soft navigation).
    mockPathname.mockReturnValue('/category');
    mockSearchParams.mockReturnValue(new URLSearchParams());
    window.history.pushState({}, '', '/category');

    render(
      <InstantSearchNext
        searchClient={createSearchClient()}
        indexName={indexName}
        routing={routing}
      >
        <SearchBox />
      </InstantSearchNext>
    );

    await act(async () => {
      await wait(0);
    });

    // The navigation-induced mount must run `onUpdate` so the results refresh.
    expect(onUpdateCalls).toBe(1);
  });

  it('does not run onUpdate when another instance mounts on the same route', async () => {
    const indexName = 'indexName';
    const routing = { router: { writeDelay: 0 } };

    const { unmount } = render(
      <InstantSearchNext
        searchClient={createSearchClient()}
        indexName={indexName}
        routing={routing}
      >
        <SearchBox />
      </InstantSearchNext>
    );

    await act(async () => {
      await wait(0);
    });

    unmount();

    // Same route, no navigation (e.g. a second `InstantSearchNext` on the
    // initial page): a freshly mounted instance must not re-run `onUpdate`.
    render(
      <InstantSearchNext
        searchClient={createSearchClient()}
        indexName={indexName}
        routing={routing}
      >
        <SearchBox />
      </InstantSearchNext>
    );

    await act(async () => {
      await wait(0);
    });

    expect(onUpdateCalls).toBe(0);
  });
});

afterAll(() => {
  jest.resetAllMocks();
});
