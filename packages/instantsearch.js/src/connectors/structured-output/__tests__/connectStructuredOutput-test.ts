/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import connectStructuredOutput from '../connectStructuredOutput';

import type { StructuredOutputConnectorParams } from '../connectStructuredOutput';

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

function init(params: StructuredOutputConnectorParams) {
  const renderFn = jest.fn();
  const widget = connectStructuredOutput(renderFn)(params);
  const helper = algoliasearchHelper(createSearchClient(), '');
  widget.init!(createInitOptions({ helper }));
  const lastState = () =>
    renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
  return { renderFn, widget, lastState };
}

describe('connectStructuredOutput', () => {
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
        connectStructuredOutput()({ agentId: 'a', task: 't' });
      }).toThrowError(/render function is not valid/);
    });

    it('throws when neither agentId nor transport is provided', () => {
      const makeWidget = connectStructuredOutput(jest.fn());
      expect(() =>
        makeWidget({ task: 't' } as StructuredOutputConnectorParams)
      ).toThrowError(/agentId.*transport/);
    });

    it('throws when task is missing', () => {
      const makeWidget = connectStructuredOutput(jest.fn());
      expect(() =>
        makeWidget({ agentId: 'a' } as StructuredOutputConnectorParams)
      ).toThrowError(/task/);
    });

    it('returns the widget descriptor', () => {
      const widget = connectStructuredOutput(jest.fn())({
        agentId: 'a',
        task: 't',
      });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.structuredOutput',
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
