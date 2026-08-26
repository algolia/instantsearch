/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import { connectTasks } from '../../index';

import type { TasksConnectorParams } from '../connectTasks';
import type { TaskTransport } from 'instantsearch.js/es/lib/tasks';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Builds a fake `text/event-stream` response whose body replays `events` as SSE
// `data:` lines. Kept as a plain object (not a real `Response`) so the test
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

function outputEvent(output: unknown): string {
  return JSON.stringify({ type: 'data-task-output', data: { output } });
}

function flush(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

function init(params: TasksConnectorParams) {
  const renderFn = jest.fn();
  const widget = connectTasks(renderFn)(params);
  const helper = algoliasearchHelper(createSearchClient(), '');
  widget.init!(createInitOptions({ helper }));
  const lastState = () =>
    renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
  return { renderFn, widget, lastState };
}

describe('connectTasks', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ output: { suggestions: ['a'] } }))
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Usage', () => {
    it('throws without a render function', () => {
      expect(() => {
        // @ts-expect-error testing invalid input
        connectTasks()({ agentId: 'a', task: 't' });
      }).toThrowError(/render function is not valid/);
    });

    it('throws when neither agentId nor transport is provided', () => {
      const makeWidget = connectTasks(jest.fn());
      expect(() =>
        makeWidget({ task: 't' } as TasksConnectorParams)
      ).toThrowError(/agentId.*transport/);
    });

    it('accepts a missing task to use the agent default', () => {
      const widget = connectTasks(jest.fn())({ agentId: 'a' });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.tasks',
        })
      );
    });

    it('returns the widget descriptor', () => {
      const widget = connectTasks(jest.fn())({
        agentId: 'a',
        task: 't',
      });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.tasks',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('render state', () => {
    it('exposes an initial idle state before any submit', () => {
      const { lastState } = init({ agentId: 'a', task: 't' });
      expect(lastState()).toEqual(
        expect.objectContaining({
          output: undefined,
          isLoading: false,
          error: undefined,
          submit: expect.any(Function),
        })
      );
    });

    it('sets isLoading while a submit is in flight and clears it on resolve', async () => {
      const { renderFn, lastState } = init({ agentId: 'a', task: 't' });

      lastState().submit({ foo: 'bar' });
      // Synchronously after submit, the loading state is rendered.
      expect(lastState().isLoading).toBe(true);
      expect(lastState().error).toBeUndefined();

      await flush(0);
      expect(lastState().isLoading).toBe(false);
      // Output is the unwrapped envelope (`{ output }` stripped).
      expect(lastState().output).toEqual({ suggestions: ['a'] });
      expect(renderFn).toHaveBeenCalled();
    });

    it('sends the variables as the task `input` and targets the tasks endpoint', async () => {
      const { lastState } = init({ agentId: 'my-agent', task: 'my_task' });

      lastState().submit({ query: 'shoes' });
      await flush(0);

      const [[url, request]] = (global.fetch as jest.Mock).mock.calls;
      expect(url).toContain('/agents/my-agent/');
      expect(url).toContain('stream=true');
      expect(JSON.parse(request.body)).toEqual({
        task: 'my_task',
        input: { query: 'shoes' },
      });
    });

    it('omits the task to use the agent default', async () => {
      const { lastState } = init({ agentId: 'my-agent' });

      lastState().submit({ query: 'shoes' });
      await flush(0);

      const [[, request]] = (global.fetch as jest.Mock).mock.calls;
      expect(JSON.parse(request.body)).toEqual({
        input: { query: 'shoes' },
      });
    });

    it('surfaces streamed partial outputs through the render state', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve(
          sseResponse([
            JSON.stringify({ type: 'start' }),
            outputEvent({ value: 'a' }),
            outputEvent({ value: 'ab' }),
            JSON.stringify({ type: 'finish' }),
            '[DONE]',
          ])
        )
      ) as unknown as typeof fetch;

      const { renderFn, lastState } = init({ agentId: 'a', task: 't' });
      lastState().submit({});
      await flush(0);

      const outputs = renderFn.mock.calls
        .map((call) => call[0].output)
        .filter(Boolean);
      // Intermediate snapshots were surfaced as they streamed in.
      expect(outputs).toContainEqual({ value: 'a' });
      expect(lastState().output).toEqual({ value: 'ab' });
      expect(lastState().isLoading).toBe(false);
    });

    it('does not stream partials when `stream` is false', async () => {
      const onDataSpy = jest.fn();
      global.fetch = jest.fn(() => {
        onDataSpy();
        return Promise.resolve(jsonResponse({ output: { done: true } }));
      }) as unknown as typeof fetch;

      const { lastState } = init({ agentId: 'a', task: 't', stream: false });
      lastState().submit({});
      await flush(0);

      const [[url]] = (global.fetch as jest.Mock).mock.calls;
      expect(url).not.toContain('stream=true');
      expect(lastState().output).toEqual({ done: true });
    });

    it('surfaces the error and clears output on a failed submit', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve(new Response('nope', { status: 500 }))
      ) as unknown as typeof fetch;

      const { lastState } = init({ agentId: 'a', task: 't' });
      lastState().submit({});
      await flush(0);

      expect(lastState().output).toBeUndefined();
      expect(lastState().error).toBeInstanceOf(Error);
      expect(lastState().error?.message).toMatch(/HTTP error 500/);
      expect(lastState().isLoading).toBe(false);
    });

    it('surfaces a synchronous error from request building and stops loading', async () => {
      const { lastState } = init({
        transport: {
          api: 'https://custom.test/tasks',
          prepareSendMessagesRequest: () => {
            throw new Error('cannot build request');
          },
        },
        task: 't',
      });

      lastState().submit({});
      await flush(0);

      expect(lastState().error).toBeInstanceOf(Error);
      expect(lastState().error?.message).toMatch(/cannot build request/);
      expect(lastState().isLoading).toBe(false);
      expect(lastState().output).toBeUndefined();
    });

    it('resolves credentials from a custom transport', async () => {
      const { lastState } = init({
        transport: {
          api: 'https://custom.test/tasks',
          headers: { 'x-custom': '1' },
        },
        task: 't',
      });

      lastState().submit({});
      await flush(0);

      const [[url, request]] = (global.fetch as jest.Mock).mock.calls;
      expect(url).toContain('https://custom.test/tasks');
      expect(request.headers).toMatchObject({ 'x-custom': '1' });
    });

    it('preserves body-only request preparation when spreading its argument', async () => {
      const customFetch = jest.fn<
        ReturnType<typeof fetch>,
        Parameters<typeof fetch>
      >(() => Promise.resolve(jsonResponse({ output: { ok: true } })));
      const transport: TaskTransport = {
        api: 'https://custom.test/tasks',
        fetch: customFetch,
        prepareSendMessagesRequest: (body) => ({
          body: { ...body, locale: 'en' },
        }),
      };
      const { lastState } = init({
        transport,
        task: 'generate',
        stream: false,
      });

      await expect(lastState().submit({ query: 'shoes' })).resolves.toEqual({
        ok: true,
      });

      expect(customFetch).toHaveBeenCalledTimes(1);
      expect(customFetch).toHaveBeenCalledWith('https://custom.test/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate',
          input: { query: 'shoes' },
          locale: 'en',
        }),
      });
    });

    it('serializes in-place body preparation assignments to reserved field names', async () => {
      const customFetch = jest.fn<
        ReturnType<typeof fetch>,
        Parameters<typeof fetch>
      >(() => Promise.resolve(jsonResponse({ output: { ok: true } })));
      const transport: TaskTransport = {
        api: 'https://custom.test/tasks',
        fetch: customFetch,
        prepareSendMessagesRequest: (body) => {
          body.locale = 'en';
          body.stream = 'payload-stream';
          body.headers = { audience: 'internal' };
          body.body = { source: 'suggestions' };
          return { body };
        },
      };
      const { lastState } = init({
        transport,
        task: 'generate',
        stream: false,
      });

      await expect(lastState().submit({ query: 'shoes' })).resolves.toEqual({
        ok: true,
      });

      expect(customFetch).toHaveBeenCalledTimes(1);
      expect(customFetch).toHaveBeenCalledWith('https://custom.test/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate',
          input: { query: 'shoes' },
          locale: 'en',
          stream: 'payload-stream',
          headers: { audience: 'internal' },
          body: { source: 'suggestions' },
        }),
      });
    });

    it('composes agent defaults with explicit transport options', async () => {
      const customFetch = jest.fn(() =>
        Promise.resolve(jsonResponse({ output: { ok: true } }))
      ) as unknown as typeof fetch;
      const prepareSendMessagesRequest = jest.fn(
        (request: {
          task?: string;
          input: Record<string, unknown>;
          stream: boolean;
          body: Record<string, unknown> | undefined;
          credentials: RequestCredentials | undefined;
          headers: HeadersInit | undefined;
          api: string;
        }) => ({
          body: {
            task: request.task,
            input: request.input,
            ...request.body,
            prepared: true,
          },
          headers: {
            'x-prepared': 'yes',
            'x-algolia-application-id': 'spoofed-app',
          },
        })
      );
      const { lastState } = init({
        agentId: 'my-agent',
        transport: {
          api: 'https://custom.test/tasks',
          credentials: 'include',
          headers: { 'x-custom': '1' },
          body: { locale: 'en' },
          fetch: customFetch,
          prepareSendMessagesRequest,
        },
        task: 'generate',
        stream: false,
      });

      await expect(lastState().submit({ query: 'shoes' })).resolves.toEqual({
        ok: true,
      });

      expect(prepareSendMessagesRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          task: 'generate',
          input: { query: 'shoes' },
          stream: false,
          body: { locale: 'en' },
          credentials: 'include',
          api: 'https://custom.test/tasks',
          headers: expect.objectContaining({
            'x-custom': '1',
            'x-algolia-application-id': 'appId',
            'x-algolia-api-key': 'apiKey',
          }),
        })
      );
      expect(customFetch).toHaveBeenCalledTimes(1);
      expect(customFetch).toHaveBeenCalledWith(
        'https://custom.test/tasks',
        expect.objectContaining({
          credentials: 'include',
          headers: {
            'x-prepared': 'yes',
            'x-algolia-application-id': 'appId',
            'x-algolia-api-key': 'apiKey',
            'Content-Type': 'application/json',
          },
        })
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('preserves an error thrown by a custom fetch', async () => {
      class TaskRequestError extends Error {
        constructor(
          message: string,
          readonly code: string,
          readonly details: { category: string }
        ) {
          super(message);
        }
      }

      const networkFetch = jest.fn<
        ReturnType<typeof fetch>,
        Parameters<typeof fetch>
      >(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              message: 'Task request blocked',
              code: 'TASK_BLOCKED',
              details: { category: 'restricted_content' },
            }),
            { status: 422, headers: { 'Content-Type': 'application/json' } }
          )
        )
      );
      let requestError: TaskRequestError | undefined;
      const customFetch = jest.fn<
        ReturnType<typeof fetch>,
        Parameters<typeof fetch>
      >(async (...args) => {
        const response = await networkFetch(...args);
        const body: {
          message: string;
          code: string;
          details: { category: string };
        } = await response.json();
        requestError = new TaskRequestError(
          body.message,
          body.code,
          body.details
        );
        throw requestError;
      });
      const prepareSendMessagesRequest = jest.fn(
        (request: {
          task?: string;
          input: Record<string, unknown>;
          stream: boolean;
          body: Record<string, unknown> | undefined;
          credentials: RequestCredentials | undefined;
          headers: HeadersInit | undefined;
          api: string;
        }) => ({
          body: {
            task: request.task,
            input: request.input,
            ...request.body,
            configuration: { name: 'preview' },
          },
        })
      );
      const { lastState } = init({
        transport: {
          api: 'https://custom.test/tasks',
          headers: { 'x-custom': '1' },
          fetch: customFetch,
          prepareSendMessagesRequest,
        },
        task: 'generate_suggestions',
      });

      await expect(lastState().submit({ query: 'shoes' })).resolves.toBe(
        undefined
      );

      expect(lastState().error).toBe(requestError);
      expect(lastState().error).toMatchObject({
        message: 'Task request blocked',
        code: 'TASK_BLOCKED',
        details: { category: 'restricted_content' },
      });
      const preparedRequest = prepareSendMessagesRequest.mock.calls[0][0];
      expect({
        task: preparedRequest.task,
        input: preparedRequest.input,
        stream: preparedRequest.stream,
        body: preparedRequest.body,
        credentials: preparedRequest.credentials,
        headers: preparedRequest.headers,
        api: preparedRequest.api,
      }).toEqual({
        task: 'generate_suggestions',
        input: { query: 'shoes' },
        stream: true,
        body: undefined,
        credentials: undefined,
        headers: { 'x-custom': '1' },
        api: 'https://custom.test/tasks',
      });
      expect(customFetch).toHaveBeenCalledTimes(1);
      expect(networkFetch).toHaveBeenCalledTimes(1);
      expect(customFetch).toHaveBeenCalledWith(
        'https://custom.test/tasks?stream=true',
        {
          method: 'POST',
          credentials: undefined,
          headers: {
            'x-custom': '1',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task: 'generate_suggestions',
            input: { query: 'shoes' },
            configuration: { name: 'preview' },
          }),
        }
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('request sequencing', () => {
    it('ignores a stale response when a newer submit is in flight', async () => {
      const resolvers: Array<(value: Response) => void> = [];
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolvers.push(resolve);
          })
      ) as unknown as typeof fetch;

      const { lastState } = init({ agentId: 'a', task: 't' });

      // Fire two overlapping submits; the first one resolves *last*.
      lastState().submit({ n: 1 });
      lastState().submit({ n: 2 });
      // `submit` defers the `fetch` call by a microtask (so a synchronous
      // throw is caught by the chain), so flush before touching resolvers.
      await flush(0);

      // Resolve the newer request (2) first, then the stale one (1).
      resolvers[1](jsonResponse({ output: { winner: 2 } }));
      await flush(0);
      resolvers[0](jsonResponse({ output: { winner: 1 } }));
      await flush(0);

      // The stale (first) response must not overwrite the latest output.
      expect(lastState().output).toEqual({ winner: 2 });
      expect(lastState().isLoading).toBe(false);
    });

    it('resolves each submit with its own result even when superseded', async () => {
      const resolvers: Array<(value: Response) => void> = [];
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolvers.push(resolve);
          })
      ) as unknown as typeof fetch;

      const { lastState } = init({ agentId: 'a', task: 't' });

      // Fire two overlapping submits; the older (1) resolves *last*.
      const first = lastState().submit({ n: 1 });
      const second = lastState().submit({ n: 2 });
      await flush(0);

      resolvers[1](jsonResponse({ output: { winner: 2 } }));
      resolvers[0](jsonResponse({ output: { winner: 1 } }));

      // Each promise resolves with its own output — the stale (first) call must
      // not adopt the newer call's result just because it settled later.
      await expect(first).resolves.toEqual({ winner: 1 });
      await expect(second).resolves.toEqual({ winner: 2 });

      // …while the shared render state still reflects only the latest request.
      expect(lastState().output).toEqual({ winner: 2 });
    });

    it('invalidate() abandons an in-flight submit so its late result is ignored', async () => {
      let resolveFetch: (value: Response) => void = () => {};
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          })
      ) as unknown as typeof fetch;

      const { lastState } = init({ agentId: 'a', task: 't' });

      lastState().submit({ n: 1 });
      await flush(0);
      expect(lastState().isLoading).toBe(true);

      // Abandon the in-flight request without cancelling the underlying fetch.
      lastState().invalidate();
      expect(lastState().isLoading).toBe(false);

      // The now-stale request resolves late; its output must be ignored.
      resolveFetch(jsonResponse({ output: { late: true } }));
      await flush(0);

      expect(lastState().output).toBeUndefined();
      expect(lastState().isLoading).toBe(false);
    });
  });

  describe('dispose', () => {
    it('does not render after dispose when a late submit resolves', async () => {
      let resolveFetch: (value: Response) => void = () => {};
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          })
      ) as unknown as typeof fetch;

      const { renderFn, widget, lastState } = init({ agentId: 'a', task: 't' });
      lastState().submit({});

      const callsBeforeDispose = renderFn.mock.calls.length;
      widget.dispose!({} as any);

      resolveFetch(jsonResponse({ output: { late: true } }));
      await flush(0);

      // The post-dispose resolution must not trigger another render.
      expect(renderFn.mock.calls.length).toBe(callsBeforeDispose);
    });
  });
});
