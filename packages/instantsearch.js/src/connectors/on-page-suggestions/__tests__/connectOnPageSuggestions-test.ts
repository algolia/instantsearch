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
import connectOnPageSuggestions from '../connectOnPageSuggestions';

import type { OnPageSuggestionsConnectorParams } from '../connectOnPageSuggestions';
import type { SearchResults } from 'algoliasearch-helper';

// Matches the connector's internal DEBOUNCE_MS constant. Tests wait this long
// (plus a small buffer) for the debounced fetch to fire.
const DEBOUNCE_WAIT = 320;

function makeResults(
  overrides: {
    hits?: Array<Record<string, unknown>>;
    query?: string;
  } = {}
): SearchResults {
  const { hits = [{ objectID: '1' }, { objectID: '2' }], query = 'q' } =
    overrides;
  const response = createSingleSearchResponse({
    hits: hits as unknown as SearchResults['hits'],
    query,
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

describe('connectOnPageSuggestions', () => {
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
        connectOnPageSuggestions()({ agentId: 'a' });
      }).toThrowError(/render function is not valid/);
    });

    it('throws when neither agentId nor transport is provided', () => {
      const makeWidget = connectOnPageSuggestions(jest.fn());
      expect(() =>
        makeWidget({} as OnPageSuggestionsConnectorParams)
      ).toThrowError(/agentId.*transport/);
    });

    it('returns the widget descriptor', () => {
      const widget = connectOnPageSuggestions(jest.fn())({
        agentId: 'a',
      });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.onPageSuggestions',
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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

    it('does not refetch when the state signature is unchanged', async () => {
      const renderFn = jest.fn();
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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
      const widget = connectOnPageSuggestions(renderFn)({ agentId: 'a' });
      const helper = algoliasearchHelper(createSearchClient(), '', {
        disjunctiveFacets: ['brand'],
      });
      widget.init!(createInitOptions({ helper }));

      const unrefined = new algoliasearchHelper.SearchResults(helper.state, [
        createSingleSearchResponse({ hits: [{ objectID: '1' }] as any, query: '' }),
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

    it('clears stale pills and exposes the loading state on every refetch', async () => {
      // Regression: on a refetch (query/refinement change) the previous pills
      // must be cleared so the UI's `isLoading && suggestions.length === 0`
      // skeleton fires. Without clearing, stale pills stay on screen and the
      // new ones swap in silently — no loading state ever shows after the
      // first fetch.
      const renderFn = jest.fn();
      const widget = connectOnPageSuggestions(renderFn)({ agentId: 'a' });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      // First fetch resolves immediately with pills.
      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'a' }) })
      );
      await flush(DEBOUNCE_WAIT);
      await flush(0);
      const afterFirst =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
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
      const midFlight =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(midFlight.isLoading).toBe(true);
      expect(midFlight.suggestions).toEqual([]);

      resolveSecond(jsonResponse({ output: { suggestions: ['x', 'y'] } }));
      await flush(0);
      const afterSecond =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(afterSecond.isLoading).toBe(false);
      expect(afterSecond.suggestions).toEqual(['x', 'y']);
    });

    it('does not render after dispose when an in-flight fetch resolves late', async () => {
      const renderFn = jest.fn();
      const widget = connectOnPageSuggestions(renderFn)({ agentId: 'a' });
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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
      const transformHits = jest.fn(
        (hits: Array<Record<string, unknown>>) =>
          hits.slice(0, 1).map((h) => ({ id: h.objectID }))
      );
      const widget = connectOnPageSuggestions(jest.fn())({
        agentId: 'a',
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
      expect(parsed.task).toBe('on_page_suggestions');
      expect(parsed.input).not.toHaveProperty('pageType');
      expect(parsed.input.hitsSample).toEqual([{ id: '1' }]);
    });

    it('strips InstantSearch hit metadata from the default context', async () => {
      const widget = connectOnPageSuggestions(jest.fn())({ agentId: 'a' });
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

    it('when `context` is provided, sends only the context object and skips auto-extraction', async () => {
      const transformHits = jest.fn();
      const widget = connectOnPageSuggestions(jest.fn())({
        agentId: 'a',
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
      const widget = connectOnPageSuggestions(jest.fn())({
        agentId: 'a',
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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
      const widget = connectOnPageSuggestions(jest.fn())({
        transport: {
          api: 'https://example.test/agents',
          headers: { 'x-foo': 'bar' },
          prepareSendMessagesRequest: prepare,
        },
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

      const widget = connectOnPageSuggestions(jest.fn())({ agentId: 'a' });
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
            // First snapshot is an empty string — filtered out, still loading.
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
      const widget = connectOnPageSuggestions(renderFn)({ agentId: 'a' });
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
      const widget = connectOnPageSuggestions(renderFn)({ agentId: 'a' });
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

    it('falls back to a buffered JSON body when the response is not a stream', async () => {
      // A custom transport / non-streaming backend ignores `stream=true` and
      // returns a plain JSON body; the connector must still parse it.
      global.fetch = jest.fn(() =>
        Promise.resolve(jsonResponse({ output: { suggestions: ['a', 'b'] } }))
      ) as unknown as typeof fetch;

      const renderFn = jest.fn();
      const widget = connectOnPageSuggestions(renderFn)({ agentId: 'a' });
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
    it('onSuggestionClick calls sendMessage on the index chat render state with page-suggestions referer', async () => {
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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
              query: 'q',
              hitsSample: JSON.stringify([
                { objectID: '1' },
                { objectID: '2' },
              ]),
            },
          },
        },
        { headers: { 'x-algolia-referer': 'on-page-suggestions' } }
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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

    it('sendToChat returns false when no chat widget is in render state', async () => {
      const search = createInstantSearch();
      // No chat in renderState.
      search.renderState = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const renderFn = jest.fn();
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
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

  describe('SSR + hydration', () => {
    const originalWindow = globalThis.window;
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete (globalThis as { window?: Window }).window;
    });
    afterEach(() => {
      (globalThis as { window?: Window }).window = originalWindow;
    });

    it('registers a server-wait promise during init', () => {
      const search = createInstantSearch();
      const registerSpy = jest.spyOn(search, 'registerServerWait');
      const widget = connectOnPageSuggestions(jest.fn())({
        agentId: 'a',
        ssrTimeout: 30,
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );
      expect(registerSpy).toHaveBeenCalledTimes(1);
    });

    it('writes the snapshot when the fetch finishes before the timeout', async () => {
      const search = createInstantSearch();
      search.mainHelper!.derive((state) => state);
      const widget = connectOnPageSuggestions(jest.fn())({
        agentId: 'a',
        ssrTimeout: 500,
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );

      search.mainHelper!.derivedHelpers[0].emit('result', {
        results: makeResults(),
      });
      await flush(20);

      expect(search._initialChatStates).not.toBeNull();
      expect(
        (search._initialChatStates as Record<string, unknown>)
          .onPageSuggestions
      ).toEqual({ suggestions: ['a', 'b', 'c'] });
    });

    it('resolves on the SSR timeout and does not write a snapshot', async () => {
      global.fetch = jest.fn(
        () => new Promise(() => {})
      ) as unknown as typeof fetch;

      const search = createInstantSearch();
      search.mainHelper!.derive((state) => state);
      const widget = connectOnPageSuggestions(jest.fn())({
        agentId: 'a',
        ssrTimeout: 20,
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );

      search.mainHelper!.derivedHelpers[0].emit('result', {
        results: makeResults(),
      });
      await flush(50);

      expect(search._initialChatStates).toBeNull();
    });

    it('hydrates from _initialChatStates on client init and skips the first refetch', async () => {
      (globalThis as { window?: Window }).window = originalWindow;

      const search = createInstantSearch();
      search._initialChatStates = {
        onPageSuggestions: { suggestions: ['x', 'y'] },
      };

      const renderFn = jest.fn();
      const widget = connectOnPageSuggestions(renderFn)({
        agentId: 'a',
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );

      const initCall = renderFn.mock.calls[0][0];
      expect(initCall.suggestions).toEqual(['x', 'y']);

      widget.render!(
        createRenderOptions({
          instantSearchInstance: search,
          helper: search.helper!,
          results: makeResults({ query: '' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).not.toHaveBeenCalled();

      // A real state change after hydration still triggers a refetch.
      widget.render!(
        createRenderOptions({
          instantSearchInstance: search,
          helper: search.helper!,
          results: makeResults({ query: 'new' }),
        })
      );
      await flush(DEBOUNCE_WAIT);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
