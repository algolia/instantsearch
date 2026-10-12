/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Index, SearchBox, useSearchBox } from 'react-instantsearch';

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

  describe("the router's own writes", () => {
    const indexName = 'indexName';
    let refine: (query: string) => void;

    function Refine() {
      refine = useSearchBox().refine;
      return null;
    }

    function App({
      client,
      writeDelay = 0,
      push,
      pushUndefined = false,
    }: {
      client: ReturnType<typeof createSearchClient>;
      writeDelay?: number;
      push?: (url: string) => void;
      pushUndefined?: boolean;
    }) {
      return (
        <InstantSearchNext
          searchClient={client}
          indexName={indexName}
          routing={{
            router: {
              writeDelay,
              ...(push && { push }),
              ...(pushUndefined && { push: undefined }),
            },
          }}
        >
          <Refine />
        </InstantSearchNext>
      );
    }

    // Next.js commits the URL to `usePathname` / `useSearchParams` after the
    // `pushState`.
    function commitLocation() {
      mockPathname.mockReturnValue(window.location.pathname);
      mockSearchParams.mockReturnValue(
        new URLSearchParams(window.location.search)
      );
    }

    async function refineAndWaitForUrl(query: string) {
      await act(async () => {
        refine(query);
      });
      await waitFor(() =>
        expect(window.location.search).toBe(`?indexName%5Bquery%5D=${query}`)
      );
    }

    const searchCalls = (client: ReturnType<typeof createSearchClient>) =>
      (client.search as jest.Mock).mock.calls;

    const queries = (client: ReturnType<typeof createSearchClient>) =>
      searchCalls(client).map(([requests]) => requests[0].params.query);

    it('does not search again when Next.js commits the URL it wrote', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      const callsBefore = searchCalls(client).length;

      await refineAndWaitForUrl('iphone');

      expect(window.location.search).toBe('?indexName%5Bquery%5D=iphone');
      expect(searchCalls(client)).toHaveLength(callsBefore + 1);

      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(0);
      });

      expect(searchCalls(client)).toHaveLength(callsBefore + 1);
    });

    it('keeps a refinement made before Next.js commits the previous write', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} writeDelay={50} />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('a');
      expect(window.location.search).toBe('?indexName%5Bquery%5D=a');

      // The next refinement lands before the commit of the previous URL.
      await act(async () => {
        refine('ab');
      });
      // Notified, but not written yet.
      await waitFor(() => expect(queries(client).pop()).toBe('ab'));

      // Committed while the write of the second refinement is still pending.
      commitLocation();
      act(() => {
        rerender(<App client={client} writeDelay={50} />);
      });
      await act(async () => {
        await wait(100);
      });

      expect(window.location.search).toBe('?indexName%5Bquery%5D=ab');
      expect(queries(client).pop()).toBe('ab');
    });

    it('does not search again for the URL written by a custom push', async () => {
      const client = createSearchClient();
      const push = jest.fn((url: string) => {
        window.history.pushState({}, '', url);
      });
      const { rerender } = render(<App client={client} push={push} />);

      await act(async () => {
        await wait(0);
      });

      const callsBefore = searchCalls(client).length;

      await refineAndWaitForUrl('iphone');

      expect(push).toHaveBeenCalledTimes(1);
      expect(searchCalls(client)).toHaveLength(callsBefore + 1);

      commitLocation();
      await act(async () => {
        rerender(<App client={client} push={push} />);
        await wait(10);
      });

      expect(searchCalls(client)).toHaveLength(callsBefore + 1);
    });

    it('ignores several writes that Next.js commits one after the other', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('a');
      await refineAndWaitForUrl('ab');
      const callsBefore = searchCalls(client).length;

      // Both URLs were written before Next.js commits the first one.
      mockSearchParams.mockReturnValue(
        new URLSearchParams('indexName%5Bquery%5D=a')
      );
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      expect(searchCalls(client)).toHaveLength(callsBefore);
    });

    it('does not search again for a custom push that updates the URL later', async () => {
      const client = createSearchClient();
      const push = (url: string) => {
        setTimeout(() => window.history.pushState({}, '', url), 20);
      };
      const { rerender } = render(<App client={client} push={push} />);

      await act(async () => {
        await wait(0);
      });

      await act(async () => {
        refine('iphone');
      });
      await waitFor(() =>
        expect(window.location.search).toBe('?indexName%5Bquery%5D=iphone')
      );
      const callsBefore = searchCalls(client).length;

      commitLocation();
      await act(async () => {
        rerender(<App client={client} push={push} />);
        await wait(10);
      });

      expect(searchCalls(client)).toHaveLength(callsBefore);
    });

    it('applies a link to a route the router wrote before', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('a');
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      // a → ab → a, committed once, as the last of them
      await refineAndWaitForUrl('ab');
      await refineAndWaitForUrl('a');
      const callsBefore = searchCalls(client).length;
      mockSearchParams.mockReturnValue(
        new URLSearchParams('indexName%5Bquery%5D=ab')
      );
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });
      expect(searchCalls(client)).toHaveLength(callsBefore);

      // A <Link> to a route the router wrote before is still applied
      window.history.pushState({}, '', '/search?indexName%5Bquery%5D=ab');
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      expect(queries(client).pop()).toBe('ab');
    });

    it('keeps writing the URL when push is explicitly undefined', async () => {
      const client = createSearchClient();
      render(<App client={client} pushUndefined />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('iphone');

      expect(window.location.search).toBe('?indexName%5Bquery%5D=iphone');
    });

    it('still applies a URL change that was not made by the router', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('iphone');

      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(0);
      });

      // A <Link> navigates to another query
      window.history.pushState({}, '', '/search?indexName%5Bquery%5D=galaxy');
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(0);
      });

      expect(queries(client).pop()).toBe('galaxy');
    });

    it('does not search again for a URL the router applied on popstate', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('iphone');

      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(0);
      });

      await refineAndWaitForUrl('galaxy');

      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(0);
      });

      const callsBefore = searchCalls(client).length;

      // history.back()
      window.history.replaceState(
        {},
        '',
        '/search?indexName%5Bquery%5D=iphone'
      );
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
        await wait(10);
      });
      expect(queries(client).pop()).toBe('iphone');
      expect(searchCalls(client)).toHaveLength(callsBefore + 1);

      // Next.js commits the URL it was navigated to
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      expect(searchCalls(client)).toHaveLength(callsBefore + 1);
    });

    it('does not search again for a popstate that follows an uncommitted write', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('iphone');
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(0);
      });

      await refineAndWaitForUrl('galaxy');

      // history.back() before Next.js commits the 'galaxy' write
      window.history.replaceState(
        {},
        '',
        '/search?indexName%5Bquery%5D=iphone'
      );
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
        await wait(10);
      });
      const callsBefore = searchCalls(client).length;

      mockSearchParams.mockReturnValue(
        new URLSearchParams('indexName%5Bquery%5D=galaxy')
      );
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      expect(searchCalls(client)).toHaveLength(callsBefore);
    });

    it('applies a link to a route written before a popstate back', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      await refineAndWaitForUrl('iphone');
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(0);
      });

      // A write, then history.back() to the committed route, before Next.js
      // commits anything
      await refineAndWaitForUrl('galaxy');
      window.history.replaceState(
        {},
        '',
        '/search?indexName%5Bquery%5D=iphone'
      );
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
        await wait(10);
      });
      const callsBefore = searchCalls(client).length;
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });
      expect(searchCalls(client)).toHaveLength(callsBefore);

      // A <Link> to the route that was written is still applied
      window.history.pushState({}, '', '/search?indexName%5Bquery%5D=galaxy');
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      expect(queries(client).pop()).toBe('galaxy');
    });

    it('still applies a later URL change after a popstate', async () => {
      const client = createSearchClient();
      const { rerender } = render(<App client={client} />);

      await act(async () => {
        await wait(0);
      });

      window.history.pushState({}, '', '/search?indexName%5Bquery%5D=iphone');
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
        await wait(10);
      });
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      // A <Link> to the same query as the one before the popstate
      window.history.pushState({}, '', '/search?indexName%5Bquery%5D=galaxy');
      commitLocation();
      await act(async () => {
        rerender(<App client={client} />);
        await wait(10);
      });

      expect(queries(client).pop()).toBe('galaxy');
    });
  });
});

afterAll(() => {
  jest.resetAllMocks();
});
