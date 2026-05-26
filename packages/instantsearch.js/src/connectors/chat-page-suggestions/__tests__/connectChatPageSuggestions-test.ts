/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createSingleSearchResponse } from '../../../../../../tests/mocks/createAPIResponse';
import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectChatPageSuggestions from '../connectChatPageSuggestions';

import type { ChatPageSuggestionsConnectorParams } from '../connectChatPageSuggestions';
import type { SearchResults } from 'algoliasearch-helper';

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

function flush(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('connectChatPageSuggestions', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        jsonResponse({
          parts: [
            { type: 'reasoning', text: '' },
            { type: 'text', text: JSON.stringify(['a', 'b', 'c']) },
          ],
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
        connectChatPageSuggestions()({ agentId: 'a' });
      }).toThrowError(/render function is not valid/);
    });

    it('throws when neither agentId nor transport is provided', () => {
      const makeWidget = connectChatPageSuggestions(jest.fn());
      expect(() =>
        makeWidget({} as ChatPageSuggestionsConnectorParams)
      ).toThrowError(/agentId.*transport/);
    });

    it('returns the widget descriptor', () => {
      const widget = connectChatPageSuggestions(jest.fn())({
        agentId: 'a',
      });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.chatPageSuggestions',
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
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
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

      await flush(20);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      await flush(0);

      // After resolution, render fired with the parsed suggestions.
      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastCall.suggestions).toEqual(['a', 'b', 'c']);
      expect(lastCall.isLoading).toBe(false);
    });

    it('skips the request when there are no hits', async () => {
      const renderFn = jest.fn();
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(
        createRenderOptions({ helper, results: makeResults({ hits: [] }) })
      );

      await flush(20);
      expect(global.fetch).not.toHaveBeenCalled();
      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastCall.suggestions).toEqual([]);
      expect(lastCall.isLoading).toBe(false);
    });

    it('does not refetch when the state signature is unchanged', async () => {
      const renderFn = jest.fn();
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      const results = makeResults({ query: 'shoes' });
      widget.render!(createRenderOptions({ helper, results }));
      await flush(20);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second render with identical signature → no refetch.
      widget.render!(createRenderOptions({ helper, results }));
      await flush(20);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('refetches when the query changes', async () => {
      const renderFn = jest.fn();
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));

      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'a' }) })
      );
      await flush(20);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      widget.render!(
        createRenderOptions({ helper, results: makeResults({ query: 'b' }) })
      );
      await flush(20);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('applies transformItems to the parsed list', async () => {
      const renderFn = jest.fn();
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
        transformItems: (items) => items.map((s) => `! ${s}`),
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(20);
      await flush(0);

      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastCall.suggestions).toEqual(['! a', '! b', '! c']);
    });

    it('lets transport.prepareSendMessagesRequest mutate the body', async () => {
      const prepare = jest.fn((body: Record<string, unknown>) => ({
        body: { ...body, injected: true },
      }));
      const widget = connectChatPageSuggestions(jest.fn())({
        debounceMs: 5,
        transport: {
          api: 'https://example.test/agents',
          headers: { 'x-foo': 'bar' },
          prepareSendMessagesRequest: prepare,
        },
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init!(createInitOptions({ helper }));
      widget.render!(createRenderOptions({ helper, results: makeResults() }));
      await flush(20);

      expect(prepare).toHaveBeenCalledTimes(1);
      const [[url, init]] = (global.fetch as jest.Mock).mock.calls;
      expect(url).toBe('https://example.test/agents');
      const parsed = JSON.parse((init as RequestInit).body as string);
      expect(parsed.injected).toBe(true);
      expect((init as RequestInit).headers).toMatchObject({ 'x-foo': 'bar' });
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
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
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
      await flush(20);
      await flush(0);

      const lastCall = renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      lastCall.onSuggestionClick('try this');

      expect(setOpen).toHaveBeenCalledWith(true);
      expect(sendMessage).toHaveBeenCalledWith(
        { text: 'try this' },
        { headers: { 'x-algolia-referer': 'page-suggestions' } }
      );
    });

    it('canHandoff is false while the chat is mid-stream', async () => {
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
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
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
      expect(lastCall.canHandoff).toBe(false);
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
      const widget = connectChatPageSuggestions(jest.fn())({
        agentId: 'a',
        ssrTimeoutMs: 30,
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
      const widget = connectChatPageSuggestions(jest.fn())({
        agentId: 'a',
        ssrTimeoutMs: 500,
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );

      // Fire the helper's result event with hits so the SSR wait promise
      // dispatches its fetch.
      search.helper!.derivedHelpers[0]?.emit('result', {
        results: makeResults(),
      });

      // The serverWait waits for fetch to settle; allow microtasks to flush.
      await flush(20);

      expect(search._initialChatStates).not.toBeNull();
      expect(
        (search._initialChatStates as Record<string, unknown>)[
          'instantsearch-chatPageSuggestions'
        ]
      ).toEqual({ suggestions: ['a', 'b', 'c'] });
    });

    it('resolves on the SSR timeout and does not write a snapshot', async () => {
      // Slow fetch that never settles within the timeout.
      global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;

      const search = createInstantSearch();
      const widget = connectChatPageSuggestions(jest.fn())({
        agentId: 'a',
        ssrTimeoutMs: 20,
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );

      search.helper!.derivedHelpers[0]?.emit('result', {
        results: makeResults(),
      });

      await flush(50);

      expect(search._initialChatStates).toBeNull();
    });

    it('hydrates from _initialChatStates on client init and skips the first refetch', async () => {
      // Put the window back — this is the client-side path.
      (globalThis as { window?: Window }).window = originalWindow;

      const search = createInstantSearch();
      search._initialChatStates = {
        'instantsearch-chatPageSuggestions': { suggestions: ['x', 'y'] },
      };

      const renderFn = jest.fn();
      const widget = connectChatPageSuggestions(renderFn)({
        agentId: 'a',
        debounceMs: 5,
      });
      widget.init!(
        createInitOptions({
          instantSearchInstance: search,
          helper: search.helper!,
        })
      );

      // Initial render after init sees the seeded suggestions.
      const initCall = renderFn.mock.calls[0][0];
      expect(initCall.suggestions).toEqual(['x', 'y']);

      // First render with results: should set lastStateSignature but NOT
      // fetch (hydratedFromSnapshot flag).
      widget.render!(
        createRenderOptions({
          instantSearchInstance: search,
          helper: search.helper!,
          results: makeResults({ query: '' }),
        })
      );
      await flush(20);
      expect(global.fetch).not.toHaveBeenCalled();

      // Changing the state signature now triggers a refetch.
      widget.render!(
        createRenderOptions({
          instantSearchInstance: search,
          helper: search.helper!,
          results: makeResults({ query: 'new' }),
        })
      );
      await flush(20);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
