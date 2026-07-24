/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createSingleSearchResponse } from '../../../../../../tests/mocks/createAPIResponse';
import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectPromptSuggestions from '../connectPromptSuggestions';

import type { PromptSuggestionsConnectorParams } from '../connectPromptSuggestions';
import type { SearchResults } from 'algoliasearch-helper';

// Matches the connector's internal DEBOUNCE_MS constant. Tests wait this long
// (plus a small buffer) for the debounced fetch to fire.
const DEBOUNCE_WAIT = 320;

function makeResults(
  overrides: {
    hits?: Array<Record<string, unknown>>;
    query?: string;
    queryID?: string;
  } = {}
): SearchResults {
  const {
    hits = [{ objectID: '1' }, { objectID: '2' }],
    query = 'q',
    queryID,
  } = overrides;
  const response = createSingleSearchResponse({
    hits: hits as unknown as SearchResults['hits'],
    query,
    ...(queryID ? { queryID } : {}),
  });
  const helper = algoliasearchHelper(createSearchClient(), '');
  return new algoliasearchHelper.SearchResults(helper.state, [response]);
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Builds a fake `text/event-stream` response whose body replays `events` as
// SSE `data:` lines. Kept as a plain object (not a real `Response`) so the test
// doesn't depend on `Response.body` support in the jsdom environment.
function sseResponse(events: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      events.forEach((event) => {
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      });
      controller.close();
    },
  });
  return {
    ok: true,
    status: 200,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'text/event-stream' : null,
    },
    body,
  } as unknown as Response;
}

function taskOutputEvent(suggestions: string[]): string {
  return JSON.stringify({
    type: 'data-task-output',
    data: { output: { suggestions } },
  });
}

function flush(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('connectPromptSuggestions', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        jsonResponse({
          output: { suggestions: ['a', 'b', 'c'] },
        })
      )
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Usage', () => {
    it('throws without a render function', () => {
      expect(() => {
        // @ts-expect-error
        connectPromptSuggestions()({ agentId: 'a', configurationId: 'prompt-suggestions' });
      }).toThrowError(/render function is not valid/);
    });

    it('throws when neither agentId nor transport is provided', () => {
      const makeWidget = connectPromptSuggestions(jest.fn());
      expect(() =>
        makeWidget({} as PromptSuggestionsConnectorParams)
      ).toThrowError(/agentId.*transport/);
    });

    it('returns the widget descriptor', () => {
      const widget = connectPromptSuggestions(jest.fn())({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.promptSuggestions',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('fetch lifecycle', () => {
    it('fires one request after the debounce window on first results', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      const renderOptions = createRenderOptions({
        helper,
        results: makeResults(),
      });
      widget.render!(renderOptions);

      // Debounce hasn't fired yet — no fetch.
      expect(global.fetch).not.toHaveBeenCalled();

      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      await flush(0);

      // After resolution, render fired with the parsed suggestions.
      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastCall.suggestions).toEqual(['a', 'b', 'c']);
      expect(lastCall.isLoading).toBe(false);
    });

    it('skips the request when there are no hits', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({ helper, results: makeResults({ hits: [] }) })
      );

      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).not.toHaveBeenCalled();
      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastCall.suggestions).toEqual([]);
      expect(lastCall.isLoading).toBe(false);
    });

    it('invalidates an in-flight request when the search moves to a no-results state', async () => {
      // A request fired for a had-hits state must not paint its (now stale)
      // pills once the search has moved on to an empty state.
      let resolveFetch: (value: Response) => void = () => {};
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          })
      ) as unknown as typeof fetch;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      // Had-hits state → the debounced fetch fires and stays in flight.
      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'phones' }) })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // The search moves to a no-results state before the request resolves.
      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({ hits: [], query: '' }),
        })
      );
      await flush(DEBOUNCE_WAIT);

      // The now-stale request resolves late; its suggestions must be ignored.
      resolveFetch(
        jsonResponse({ output: { suggestions: ['stale', 'pills'] } })
      );
      await flush(10);

      const last = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(last.suggestions).toEqual([]);
      expect(last.isLoading).toBe(false);
    });

    it('does not refetch when the state signature is unchanged', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      const results = makeResults({ query: 'shoes' });
      widget.render!(createRenderOptions({ helper, results }));
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second render with identical signature → no refetch.
      widget.render!(createRenderOptions({ helper, results }));
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('refetches when the query changes', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'a' }) })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'b' }) })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('refetches when a facet refinement changes even if the query does not', async () => {
      // Regression: the state signature must be derived from the results' own
      // state, not a helper captured at init. In React the captured helper's
      // state does not track live refinements, so reading it made facet
      // changes (query unchanged) invisible — the pills never refreshed.
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '', {
        disjunctiveFacets: ['brand'],
      });
      widget.init!(createInitOptions({ helper }));

      const unrefined = new algoliasearchHelper.SearchResults(helper.state, [
        createSingleSearchResponse({
          hits: [{ objectID: '1' }] as any,
          query: '',
        }),
      ]);
      widget.render!(createRenderOptions({ helper, results: unrefined }));
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Same query (''), but the results now carry a facet refinement — this is
      // what a real search produces after a RefinementList click.
      const refined = new algoliasearchHelper.SearchResults(
        helper.state.addDisjunctiveFacetRefinement('brand', 'Apple'),
        [
          createSingleSearchResponse({
            hits: [{ objectID: '1' }] as any,
            query: '',
          }),
        ]
      );
      widget.render!(createRenderOptions({ helper, results: refined }));
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('refetches when a numeric refinement changes even if the query does not', async () => {
      // The state signature must also track numeric (and tag) refinements, so a
      // range-filter change refreshes the pills like a facet change does.
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '', {});
      widget.init!(createInitOptions({ helper }));

      const unrefined = new algoliasearchHelper.SearchResults(helper.state, [
        createSingleSearchResponse({
          hits: [{ objectID: '1' }] as any,
          query: '',
        }),
      ]);
      widget.render!(createRenderOptions({ helper, results: unrefined }));
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const refined = new algoliasearchHelper.SearchResults(
        helper.state.addNumericRefinement('price', '<=', 500),
        [
          createSingleSearchResponse({
            hits: [{ objectID: '1' }] as any,
            query: '',
          }),
        ]
      );
      widget.render!(createRenderOptions({ helper, results: refined }));
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('refetches whenever the results `queryID` changes', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({ query: 'shoes', queryID: 'q1' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({ query: 'shoes', queryID: 'q2' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('does not refetch when the `queryID` is unchanged', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({ query: 'shoes', queryID: 'q1' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({ query: 'shoes', queryID: 'q1' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('clears stale pills and exposes the loading state on every refetch', async () => {
      // Regression: on a refetch (query/refinement change) the previous pills
      // must be cleared so the UI's `isLoading && suggestions.length === 0`
      // skeleton fires. Without clearing, stale pills stay on screen and the
      // new ones swap in silently — no loading state ever shows after the
      // first fetch.
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      // First fetch resolves immediately with pills.
      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'a' }) })
      );
      await flush(DEBOUNCE_WAIT);
      await flush(0);
      const afterFirst = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(afterFirst.suggestions).toEqual(['a', 'b', 'c']);
      expect(afterFirst.isLoading).toBe(false);

      // Hold the second fetch open so we can observe the in-flight render.
      let resolveSecond: (response: Response) => void = () => {};
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveSecond = resolve;
          })
      );

      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'b' }) })
      );
      await flush(DEBOUNCE_WAIT);

      // Mid-refetch: stale pills gone, skeleton state exposed.
      const midFlight = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(midFlight.isLoading).toBe(true);
      expect(midFlight.suggestions).toEqual([]);

      resolveSecond(jsonResponse({ output: { suggestions: ['x', 'y'] } }));
      await flush(0);
      const afterSecond =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(afterSecond.isLoading).toBe(false);
      expect(afterSecond.suggestions).toEqual(['x', 'y']);
    });

    it('ignores a stale in-flight response that resolves during the debounce for a newer state', async () => {
      // Regression: an older request must not win once the search state has
      // moved on. If request A (for state 'a') resolves while the debounced
      // refetch for state 'b' is still pending, its suggestions must not paint.
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      // Hold the first fetch (state 'a') open so it stays in flight.
      let resolveFirst: (response: Response) => void = () => {};
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFirst = resolve;
          })
      );

      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'a' }) })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // State moves to 'b' before the first request resolves: a new debounce is
      // pending, so the still-in-flight 'a' request is now stale.
      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'b' }) })
      );

      // The stale 'a' response arrives during the debounce window.
      resolveFirst(jsonResponse({ output: { suggestions: ['stale'] } }));
      await flush(0);

      // It must not paint stale pills.
      const duringDebounce =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(duringDebounce.suggestions).not.toContain('stale');

      // The debounced 'b' request fires and resolves with fresh pills.
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      await flush(0);
      const afterSecond =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(afterSecond.suggestions).toEqual(['a', 'b', 'c']);
    });

    it('does not render after dispose when an in-flight fetch resolves late', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      // Hold the fetch open so it resolves only after we dispose.
      let resolveFetch: (response: Response) => void = () => {};
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          })
      );

      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'a' }) })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      widget.dispose!(createDisposeOptions({ helper }));
      const callsAfterDispose = renderFn.mock.calls.length;

      // The late resolution must not trigger a render into the torn-down tree.
      resolveFetch(jsonResponse({ output: { suggestions: ['x', 'y'] } }));
      await flush(0);
      expect(renderFn).toHaveBeenCalledTimes(callsAfterDispose);
    });

    it('applies transformItems to the parsed list with query+results metadata', async () => {
      const renderFn = jest.fn();
      const transform = jest.fn<
        string[],
        [string[], { query: string; results: unknown }]
      >((items) => items.map((s) => `! ${s}`));
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
        transformItems: transform,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({ query: 'shoes' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      await flush(0);

      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastCall.suggestions).toEqual(['! a', '! b', '! c']);
      // Last call to transform should have been with the post-fetch results.
      const [items, meta] =
        transform.mock.calls[transform.mock.calls.length - 1];
      expect(items).toEqual(['a', 'b', 'c']);
      expect(meta).toEqual(
        expect.objectContaining({
          query: 'shoes',
          results: expect.objectContaining({ query: 'shoes' }),
        })
      );
    });

    it('forwards `transformHits(hits)` output to the agent as context', async () => {
      const transformHits = jest.fn((hits: Array<Record<string, unknown>>) =>
        hits.slice(0, 1).map((h) => ({ id: h.objectID }))
      );
      const widget = connectPromptSuggestions(jest.fn())({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformHits: transformHits as any,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
          }),
        })
      );
      await flush(DEBOUNCE_WAIT);

      expect(transformHits).toHaveBeenCalledTimes(1);
      const [[, init]] = (global.fetch as jest.Mock).mock.calls;
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.task).toBe('prompt-suggestions');
      expect(parsed.input).not.toHaveProperty('pageType');
      expect(parsed.input.hitsSample).toEqual([{ id: '1' }]);
    });

    it('strips InstantSearch hit metadata from the default context', async () => {
      const widget = connectPromptSuggestions(jest.fn())({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({
            hits: [
              {
                objectID: '1',
                name: 'Product 1',
                _highlightResult: { name: { value: 'Product 1' } },
                _snippetResult: { name: { value: 'Product 1' } },
                _rankingInfo: { nbTypos: 0 },
                __position: 1,
                __queryID: 'q1',
              },
            ] as any,
          }),
        })
      );
      await flush(DEBOUNCE_WAIT);

      const [[, init]] = (global.fetch as jest.Mock).mock.calls;
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.input.hitsSample).toEqual([
        { objectID: '1', name: 'Product 1' },
      ]);
    });

    it('sends the active filters alongside the query and hitsSample', async () => {
      const widget = connectPromptSuggestions(jest.fn())({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '', {
        disjunctiveFacets: ['brand'],
      });
      helper.addDisjunctiveFacetRefinement('brand', 'Apple');
      helper.addNumericRefinement('price', '<=', 500);
      const results = new algoliasearchHelper.SearchResults(helper.state, [
        createSingleSearchResponse({
          hits: [{ objectID: '1' }] as unknown as SearchResults['hits'],
          query: 'laptop',
        }),
      ]);
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results }));
      await flush(DEBOUNCE_WAIT);

      const [[, init]] = (global.fetch as jest.Mock).mock.calls;
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.input.query).toBe('laptop');
      expect(parsed.input.filters).toEqual([['brand:Apple'], ['price<=500']]);
    });

    it('OR-groups multiple values on the same disjunctive facet', async () => {
      const widget = connectPromptSuggestions(jest.fn())({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '', {
        disjunctiveFacets: ['brand'],
      });
      helper.addDisjunctiveFacetRefinement('brand', 'Apple');
      helper.addDisjunctiveFacetRefinement('brand', 'Samsung');
      helper.addNumericRefinement('price', '<=', 500);
      const results = new algoliasearchHelper.SearchResults(helper.state, [
        createSingleSearchResponse({
          hits: [{ objectID: '1' }] as unknown as SearchResults['hits'],
          query: 'phone',
        }),
      ]);
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results }));
      await flush(DEBOUNCE_WAIT);

      const [[, init]] = (global.fetch as jest.Mock).mock.calls;
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.input.filters).toEqual([
        ['brand:Apple', 'brand:Samsung'],
        ['price<=500'],
      ]);
    });

    it('omits filters when no refinements are active', async () => {
      const widget = connectPromptSuggestions(jest.fn())({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(DEBOUNCE_WAIT);

      const [[, init]] = (global.fetch as jest.Mock).mock.calls;
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.input).not.toHaveProperty('filters');
    });

    it('when `context` is provided, sends only the context object and skips auto-extraction', async () => {
      const transformHits = jest.fn();
      const widget = connectPromptSuggestions(jest.fn())({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
        context: { focalProduct: { id: '42' } },
        transformHits,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({
          helper,
          results: makeResults({
            query: 'should-be-ignored',
            hits: [{ objectID: 'h1' }],
          }),
        })
      );
      await flush(DEBOUNCE_WAIT);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(transformHits).not.toHaveBeenCalled();
      const [[, init]] = (global.fetch as jest.Mock).mock.calls;
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.input).not.toHaveProperty('query');
      expect(parsed.input).not.toHaveProperty('hitsSample');
      expect(parsed.input).not.toHaveProperty('pageType');
      expect(parsed.input.focalProduct).toEqual({ id: '42' });
    });

    it('still fetches when `context` is provided and there are no hits', async () => {
      const widget = connectPromptSuggestions(jest.fn())({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
        context: { focalProduct: { id: '42' } },
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({ helper, results: makeResults({ hits: [] }) })
      );
      await flush(DEBOUNCE_WAIT);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('exposes `refresh()` which bypasses the debounce and refetches', async () => {
      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      // Without refresh(), the debounce would block any fetch right now.
      expect(global.fetch).not.toHaveBeenCalled();

      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      lastCall.refresh();
      await flush(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('lets transport.prepareSendMessagesRequest mutate the body', async () => {
      const prepare = jest.fn((body: Record<string, unknown>) => ({
        body: { ...body, injected: true },
      }));
      const widget = connectPromptSuggestions(jest.fn())({
        transport: {
          api: 'https://example.test/agents',
          headers: { 'x-foo': 'bar' },
          prepareSendMessagesRequest: prepare,
        },
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(DEBOUNCE_WAIT);

      expect(prepare).toHaveBeenCalledTimes(1);
      const [[url, init]] = (global.fetch as jest.Mock).mock.calls;
      expect(url).toBe('https://example.test/agents?stream=true');
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.injected).toBe(true);
      expect((init as RequestInit).headers).toMatchObject({ 'x-foo': 'bar' });
    });
  });

  describe('streaming', () => {
    it('requests the streaming endpoint with `stream=true`', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve(sseResponse([taskOutputEvent(['a', 'b'])]))
      ) as unknown as typeof fetch;

      const widget = connectPromptSuggestions(jest.fn())({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(DEBOUNCE_WAIT);
      await flush(10);

      const [[url]] = (global.fetch as jest.Mock).mock.calls;
      expect(url).toContain('stream=true');
    });

    it('renders each accumulated snapshot and resolves with the final list', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve(
          sseResponse([
            JSON.stringify({ type: 'start' }),
            // Early partial while the model is still streaming the first item.
            taskOutputEvent(['']),
            taskOutputEvent(['What']),
            taskOutputEvent(['What phones?']),
            taskOutputEvent(['What phones?', 'Any deals?']),
            JSON.stringify({ type: 'finish' }),
            '[DONE]',
          ])
        )
      ) as unknown as typeof fetch;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(DEBOUNCE_WAIT);
      await flush(10);

      // An intermediate render observed the growing (partial) list.
      const snapshots = renderFn.mock.calls.map((c) => c[0].suggestions);
      expect(snapshots).toContainEqual(['What']);
      expect(snapshots).toContainEqual(['What phones?']);

      // The final render carries the complete list and is no longer loading.
      const last = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(last.suggestions).toEqual(['What phones?', 'Any deals?']);
      expect(last.isLoading).toBe(false);
    });

    it('repairs a raw partial-JSON output payload while streaming', async () => {
      // Here `data` is the raw (still-incomplete) JSON text the model emits,
      // not a pre-parsed object — exercising the shared repair logic.
      global.fetch = jest.fn(() =>
        Promise.resolve(
          sseResponse([
            JSON.stringify({
              type: 'data-task-output',
              data: '{"output":{"suggestions":["Wh',
            }),
            JSON.stringify({
              type: 'data-task-output',
              data: '{"output":{"suggestions":["What?"]}}',
            }),
            '[DONE]',
          ])
        )
      ) as unknown as typeof fetch;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(DEBOUNCE_WAIT);
      await flush(10);

      const snapshots = renderFn.mock.calls.map((c) => c[0].suggestions);
      // The unterminated first payload is repaired into a usable partial.
      expect(snapshots).toContainEqual(['Wh']);
      const last = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(last.suggestions).toEqual(['What?']);
    });

    it('clears streamed partials when the stream emits a terminal error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve(
          sseResponse([
            taskOutputEvent(['What phones?']),
            JSON.stringify({ type: 'error', errorText: 'stream failed' }),
            '[DONE]',
          ])
        )
      ) as unknown as typeof fetch;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(DEBOUNCE_WAIT);
      await flush(10);

      // A partial streamed in before the failure...
      const snapshots = renderFn.mock.calls.map((c) => c[0].suggestions);
      expect(snapshots).toContainEqual(['What phones?']);

      // ...but the terminal error clears it. There's no error UI, so a blank
      // state is the intended outcome — no partial pills survive.
      const last = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(last.suggestions).toEqual([]);
      expect(last.isLoading).toBe(false);
    });

    it('falls back to a buffered JSON body when the response is not a stream', async () => {
      // A custom transport / non-streaming backend ignores `stream=true` and
      // returns a plain JSON body; the connector must still parse it.
      global.fetch = jest.fn(() =>
        Promise.resolve(jsonResponse({ output: { suggestions: ['a', 'b'] } }))
      ) as unknown as typeof fetch;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({ agentId: 'a', configurationId: 'prompt-suggestions' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(DEBOUNCE_WAIT);
      await flush(10);

      const last = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(last.suggestions).toEqual(['a', 'b']);
      expect(last.isLoading).toBe(false);
    });
  });

  describe('handoff', () => {
    it('onSuggestionClick calls sendMessage on the index chat render state with prompt-suggestions-widget referer', async () => {
      const sendMessage = jest.fn();
      const setOpen = jest.fn();
      const search = createInstantSearch();
      search.renderState = {
        [search.helper!.state.index]: {
          chat: {
            sendMessage,
            setOpen,
            status: 'ready',
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      widget.render!(
        createRenderOptions({
          instantSearchInstance: search,
          helper: search.helper!,
          results: makeResults({ query: '' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      await flush(0);

      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      lastCall.onSuggestionClick('try this');

      expect(setOpen).toHaveBeenCalledWith(true);
      // The raw suggestion is wrapped in a grounding prompt, and the page
      // context is attached as a flat `turnContext` (hitsSample serialized).
      expect(sendMessage).toHaveBeenCalledWith(
        {
          text: expect.stringContaining('Suggestion: try this'),
          metadata: {
            turnContext: {
              hitsSample: JSON.stringify([
                { objectID: '1' },
                { objectID: '2' },
              ]),
            },
          },
        },
        { headers: { 'x-algolia-referer': 'prompt-suggestions-widget' } }
      );
    });

    it('sendToChat returns true when a chat widget is mounted', async () => {
      const sendMessage = jest.fn();
      const setOpen = jest.fn();
      const search = createInstantSearch();
      search.renderState = {
        [search.helper!.state.index]: {
          chat: { sendMessage, setOpen, status: 'ready' },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      const initCall = renderFn.mock.calls[0][0];
      expect(initCall.sendToChat('hello')).toBe(true);
      expect(sendMessage).toHaveBeenCalled();
    });

    it('sendToChat returns false when the chat is busy and nothing is sent', async () => {
      const sendMessage = jest.fn();
      const setOpen = jest.fn();
      const search = createInstantSearch();
      search.renderState = {
        [search.helper!.state.index]: {
          chat: { sendMessage, setOpen, status: 'streaming' },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      const initCall = renderFn.mock.calls[0][0];
      // The chat is mid-stream: openChat opens it but doesn't dispatch, so the
      // handler must report that nothing was sent.
      expect(initCall.sendToChat('hello')).toBe(false);
      expect(setOpen).toHaveBeenCalledWith(true);
      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('sendToChat returns false when no chat widget is in render state', async () => {
      const search = createInstantSearch();
      // No chat in renderState.
      search.renderState = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      const initCall = renderFn.mock.calls[0][0];
      expect(initCall.sendToChat('hello')).toBe(false);
    });

    it('isChatBusy is true while the chat is mid-stream', async () => {
      const search = createInstantSearch();
      search.renderState = {
        [search.helper!.state.index]: {
          chat: {
            sendMessage: jest.fn(),
            status: 'streaming',
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const renderFn = jest.fn();
      const widget = connectPromptSuggestions(renderFn)({
        agentId: 'a',
        configurationId: 'prompt-suggestions',
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      widget.render!(
        createRenderOptions({
          instantSearchInstance: search,
          helper: search.helper!,
          results: makeResults(),
        })
      );

      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastCall.isChatBusy).toBe(true);
      // dispose() to clear the debounce timer scheduled by render() so it
      // doesn't fire during the next test and pollute fetch call counts.
      widget.dispose!(createDisposeOptions({ helper: search.helper! }));
    });
  });
});
