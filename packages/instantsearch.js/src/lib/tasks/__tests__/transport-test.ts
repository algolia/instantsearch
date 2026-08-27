/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { DefaultTaskTransport } from '..';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

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

describe('DefaultTaskTransport', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('owns async request preparation and performs exactly one request', async () => {
    const customFetch = jest.fn(
      (..._args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
        Promise.resolve(jsonResponse({ output: { suggestions: ['a'] } }))
    );
    const prepareSendMessagesRequest = jest.fn(
      async (request: {
        task?: string;
        input: Record<string, unknown>;
        stream: boolean;
        body: Record<string, unknown> | undefined;
        credentials: RequestCredentials | undefined;
        headers: HeadersInit | undefined;
        api: string;
      }) => ({
        api: 'https://prepared.test/tasks',
        credentials: 'same-origin' as const,
        headers: { 'x-prepared': 'yes' },
        body: {
          task: request.task,
          input: request.input,
          ...request.body,
          prepared: true,
        },
      })
    );
    const transport = new DefaultTaskTransport({
      api: 'https://initial.test/tasks',
      credentials: () => Promise.resolve<RequestCredentials>('include'),
      headers: async () => new Headers({ 'x-initial': 'yes' }),
      body: async () => ({ locale: 'en' }),
      fetch: customFetch,
      prepareSendMessagesRequest,
    });

    await expect(
      transport.sendTask({
        task: 'generate_suggestions',
        input: { query: 'shoes' },
        stream: true,
      })
    ).resolves.toEqual({ suggestions: ['a'] });

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
      body: { locale: 'en' },
      credentials: 'include',
      headers: expect.any(Headers),
      api: 'https://initial.test/tasks',
    });
    expect(customFetch).toHaveBeenCalledTimes(1);
    expect(customFetch).toHaveBeenCalledWith(
      'https://prepared.test/tasks?stream=true',
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'x-prepared': 'yes',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: 'generate_suggestions',
          input: { query: 'shoes' },
          locale: 'en',
          prepared: true,
        }),
      }
    );
  });

  it('forwards the kind without a task ID', async () => {
    const customFetch = jest.fn(
      (..._args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
        Promise.resolve(jsonResponse({ output: { ok: true } }))
    );
    const transport = new DefaultTaskTransport({ fetch: customFetch });

    await transport.sendTask({
      kind: 'prompt_suggestions',
      input: { query: 'shoes' },
      stream: false,
    });

    expect(customFetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      credentials: undefined,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'prompt_suggestions',
        input: { query: 'shoes' },
      }),
    });
  });

  it('preserves the exact error thrown by a custom fetch', async () => {
    class StructuredTaskError extends Error {
      constructor(
        message: string,
        readonly code: string,
        readonly details: { category: string }
      ) {
        super(message);
      }
    }
    const requestError = new StructuredTaskError('blocked', 'TASK_BLOCKED', {
      category: 'off_topic',
    });
    const customFetch = jest.fn(
      (..._args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
        Promise.reject(requestError)
    );
    const transport = new DefaultTaskTransport({ fetch: customFetch });

    await expect(
      transport.sendTask({ task: 't', input: {}, stream: false })
    ).rejects.toBe(requestError);
    expect(customFetch).toHaveBeenCalledTimes(1);
  });

  it('uses the default API and merges configured body fields', async () => {
    const customFetch = jest.fn(
      (..._args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
        Promise.resolve(jsonResponse({ output: { ok: true } }))
    );
    const transport = new DefaultTaskTransport({
      body: { locale: 'en' },
      fetch: customFetch,
    });

    await transport.sendTask({
      task: 'generate',
      input: { query: 'shoes' },
      stream: false,
    });

    expect(customFetch).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      credentials: undefined,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'generate',
        input: { query: 'shoes' },
        locale: 'en',
      }),
    });
  });

  it('appends streaming to an API that already has query parameters', async () => {
    const customFetch = jest.fn(
      (..._args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
        Promise.resolve(jsonResponse({ output: { ok: true } }))
    );
    const transport = new DefaultTaskTransport({
      api: 'https://example.test/tasks?version=1',
      fetch: customFetch,
    });

    await transport.sendTask({ task: 't', input: {}, stream: true });

    expect(customFetch).toHaveBeenCalledWith(
      'https://example.test/tasks?version=1&stream=true',
      expect.any(Object)
    );
  });

  it('streams unwrapped snapshots and resolves the final output', async () => {
    const customFetch = jest.fn(() =>
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
    const onData = jest.fn();
    const transport = new DefaultTaskTransport({ fetch: customFetch });

    await expect(
      transport.sendTask({ task: 't', input: {}, stream: true, onData })
    ).resolves.toEqual({ value: 'ab' });
    expect(onData.mock.calls).toEqual([[{ value: 'a' }], [{ value: 'ab' }]]);
  });

  it('repairs partial JSON while streaming', async () => {
    const customFetch = jest.fn(() =>
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
    const onData = jest.fn();
    const transport = new DefaultTaskTransport({ fetch: customFetch });

    await expect(
      transport.sendTask({ task: 't', input: {}, stream: true, onData })
    ).resolves.toEqual({ suggestions: ['What?'] });
    expect(onData.mock.calls[0][0]).toEqual({ suggestions: ['Wh'] });
  });

  it('uses buffered JSON and does not emit partial data when streaming is disabled', async () => {
    const customFetch = jest.fn(
      (..._args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
        Promise.resolve(jsonResponse({ output: { done: true } }))
    );
    const onData = jest.fn();
    const transport = new DefaultTaskTransport({ fetch: customFetch });

    await expect(
      transport.sendTask({ task: 't', input: {}, stream: false, onData })
    ).resolves.toEqual({ done: true });
    expect(onData).not.toHaveBeenCalled();
  });

  it('keeps the generic default error for a non-success response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response('nope', { status: 503 }))
    ) as unknown as typeof fetch;
    const transport = new DefaultTaskTransport();

    await expect(
      transport.sendTask({ task: 't', input: {}, stream: false })
    ).rejects.toThrow('HTTP error 503');
  });

  it('streams unwrapped partial outputs and rejects terminal errors', async () => {
    const onData = jest.fn();
    const customFetch = jest.fn(() =>
      Promise.resolve(
        sseResponse([
          JSON.stringify({
            type: 'data-task-output',
            data: { output: { value: 'partial' } },
          }),
          JSON.stringify({ type: 'error', errorText: 'stream failed' }),
          '[DONE]',
        ])
      )
    ) as unknown as typeof fetch;
    const transport = new DefaultTaskTransport({ fetch: customFetch });

    await expect(
      transport.sendTask({ task: 't', input: {}, stream: true, onData })
    ).rejects.toThrow('stream failed');
    expect(onData).toHaveBeenCalledWith({ value: 'partial' });
  });
});
