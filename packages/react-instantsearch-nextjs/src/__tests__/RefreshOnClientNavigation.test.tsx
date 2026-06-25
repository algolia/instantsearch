/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render } from '@testing-library/react';
import React from 'react';
import { Index, SearchBox } from 'react-instantsearch';
import { useInstantSearchContext } from 'react-instantsearch-core';

import { InstantSearchNext } from '../InstantSearchNext';
import { isClientNavigation } from '../RefreshOnClientNavigation';

import type { InstantSearch } from 'instantsearch.js';

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

// The component reads the document's initial URL from the Navigation Timing
// API to tell hydration apart from a client-side navigation. jsdom doesn't
// implement it, so we define it (which also exercises the production path
// rather than the `window` fallback). `navigationInitialHref` models reality:
// it stays fixed at the hard-loaded URL while client-side navigations change
// `window.location`. `null` means "no navigation yet" (hydration), so the entry
// reflects the current location.
let navigationInitialHref: string | null = null;

// Captures the InstantSearch instance and spies on `refresh` during render, so
// the spy is installed before the `RefreshOnClientNavigation` effect runs.
let capturedSearch: InstantSearch | null = null;
function CaptureInstance() {
  const search = useInstantSearchContext();
  if (!jest.isMockFunction(search.refresh)) {
    jest.spyOn(search, 'refresh');
  }
  capturedSearch = search;
  return null;
}

beforeEach(() => {
  mockPathname.mockReturnValue('/search');
  mockSearchParams.mockReturnValue(new URLSearchParams());
  window.history.replaceState({}, '', '/search');
  navigationInitialHref = null;
  capturedSearch = null;
  Object.defineProperty(performance, 'getEntriesByType', {
    configurable: true,
    value: () => [{ name: navigationInitialHref ?? window.location.href }],
  });
});

afterEach(() => {
  delete (performance as unknown as Record<string, unknown>).getEntriesByType;
});

describe('isClientNavigation', () => {
  test('is false when the current location matches the initial document', () => {
    window.history.replaceState({}, '', '/search?q=iphone');
    expect(isClientNavigation()).toBe(false);
  });

  test('is true when the pathname differs from the initial document', () => {
    navigationInitialHref = 'http://localhost/other';
    window.history.pushState({}, '', '/search');
    expect(isClientNavigation()).toBe(true);
  });

  test('is true when only the search params differ from the initial document', () => {
    navigationInitialHref = 'http://localhost/search?q=old';
    window.history.pushState({}, '', '/search?q=new');
    expect(isClientNavigation()).toBe(true);
  });
});

describe('RefreshOnClientNavigation', () => {
  test('refreshes the search on a client-side navigation', async () => {
    // Document loaded elsewhere, then client-navigated to `/search`.
    navigationInitialHref = 'http://localhost/other';
    window.history.pushState({}, '', '/search');

    await act(async () => {
      render(
        <InstantSearchNext
          searchClient={createSearchClient()}
          indexName="indexName"
        >
          <CaptureInstance />
          <SearchBox />
        </InstantSearchNext>
      );
    });
    await act(async () => {
      await wait(0);
    });

    expect(capturedSearch!.refresh).toHaveBeenCalledTimes(1);
  });

  test('does not refresh on the initial hydration', async () => {
    await act(async () => {
      render(
        <InstantSearchNext
          searchClient={createSearchClient()}
          indexName="indexName"
        >
          <CaptureInstance />
          <SearchBox />
        </InstantSearchNext>
      );
    });
    await act(async () => {
      await wait(0);
    });

    expect(capturedSearch!.refresh).not.toHaveBeenCalled();
  });

  // The fix must not reintroduce the #6980 URL wipe on a soft navigation: when
  // landing on a nested-<Index> page via client-side navigation, refreshing the
  // results must not touch the URL (refresh() doesn't, unlike re-running the
  // router's onUpdate before the nested children register).
  test('preserves the URL on a soft navigation to a nested <Index>', async () => {
    const indexName = 'instant_search';
    const indexId = `${indexName}_web`;

    navigationInitialHref = 'http://localhost/other';
    mockSearchParams.mockReturnValue(new URLSearchParams('q=iphone'));
    window.history.pushState({}, '', '/search?q=iphone');

    await act(async () => {
      render(
        <InstantSearchNext
          searchClient={createSearchClient()}
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
          <CaptureInstance />
          <Index indexName={indexName} indexId={indexId}>
            <SearchBox />
          </Index>
        </InstantSearchNext>
      );
    });
    await act(async () => {
      await wait(0);
    });

    expect(capturedSearch!.refresh).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe('?q=iphone');
  });
});
