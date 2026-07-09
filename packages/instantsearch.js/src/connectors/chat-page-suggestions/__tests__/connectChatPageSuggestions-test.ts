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
import connectChatPageSuggestions from '../connectChatPageSuggestions';

import type { ChatPageSuggestionsConnectorParams } from '../connectChatPageSuggestions';
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

function flush(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('connectChatPageSuggestions', () => {
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
      const widget = connectChatPageSuggestions(renderFn)({
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
      const widget = connectChatPageSuggestions(renderFn)({
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
      const widget = connectChatPageSuggestions(renderFn)({
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

    it('applies transformItems to the parsed list with query+results metadata', async () => {
      const renderFn = jest.fn();
      const transform = jest.fn<
        string[],
        [string[], { query: string; results: unknown }]
      >((items) => items.map((s) => `! ${s}`));
      const widget = connectChatPageSuggestions(renderFn)({
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
      const widget = connectChatPageSuggestions(jest.fn())({
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
      expect(parsed.task).toBe('algolia_on_page_suggestions');
      expect(parsed.input.pageType).toBe('plp');
      expect(parsed.input.hitsSample).toEqual([{ id: '1' }]);
    });

    it('when `context` is provided, sends only the context object and skips auto-extraction', async () => {
      const transformHits = jest.fn();
      const widget = connectChatPageSuggestions(jest.fn())({
        agentId: 'a',
        context: { pageType: 'pdp', focalProduct: { id: '42' } },
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
      expect(parsed.input.pageType).toBe('pdp');
      expect(parsed.input.focalProduct).toEqual({ id: '42' });
    });

    it('still fetches when `context` is provided and there are no hits', async () => {
      const widget = connectChatPageSuggestions(jest.fn())({
        agentId: 'a',
        context: { pageType: 'pdp' },
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
      const widget = connectChatPageSuggestions(renderFn)({
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
      const widget = connectChatPageSuggestions(jest.fn())({
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
      expect(sendMessage).toHaveBeenCalledWith(
        { text: 'try this' },
        { headers: { 'x-algolia-referer': 'page-suggestions' } }
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
      const widget = connectChatPageSuggestions(renderFn)({
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
      const widget = connectChatPageSuggestions(renderFn)({
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
      const widget = connectChatPageSuggestions(renderFn)({
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
      const widget = connectChatPageSuggestions(jest.fn())({
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
      const widget = connectChatPageSuggestions(jest.fn())({
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
          .chatPageSuggestions
      ).toEqual({ suggestions: ['a', 'b', 'c'] });
    });

    it('resolves on the SSR timeout and does not write a snapshot', async () => {
      global.fetch = jest.fn(
        () => new Promise(() => {})
      ) as unknown as typeof fetch;

      const search = createInstantSearch();
      search.mainHelper!.derive((state) => state);
      const widget = connectChatPageSuggestions(jest.fn())({
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
        chatPageSuggestions: { suggestions: ['x', 'y'] },
      };

      const renderFn = jest.fn();
      const widget = connectChatPageSuggestions(renderFn)({
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
