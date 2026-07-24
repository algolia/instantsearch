/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { fetchTask } from '../fetchTask';

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

function outputEvent(output: unknown): string {
  return JSON.stringify({ type: 'data-task-output', data: { output } });
}

const OPTIONS = {
  endpoint: 'https://example.test/agents/xyz/tasks',
  headers: { 'x-algolia-application-id': 'app' },
  payload: { task: 'some_task', input: { foo: 'bar' } },
};

describe('fetchTask', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('requests the endpoint with `stream=true`, POSTing the payload as JSON', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ output: { ok: true } }))
    ) as unknown as typeof fetch;

    await fetchTask(OPTIONS);

    const [[url, init]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toBe('https://example.test/agents/xyz/tasks?stream=true');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'x-algolia-application-id': 'app',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(init.body)).toEqual(OPTIONS.payload);
  });

  it('appends `stream=true` to an endpoint that already has a query string', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ output: {} }))
    ) as unknown as typeof fetch;

    await fetchTask({ ...OPTIONS, endpoint: `${OPTIONS.endpoint}?v=1` });

    const [[url]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toBe('https://example.test/agents/xyz/tasks?v=1&stream=true');
  });

  it('resolves with the buffered JSON body when the response is not a stream', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ output: { suggestions: ['a', 'b'] } }))
    ) as unknown as typeof fetch;

    const onData = jest.fn();
    const result = await fetchTask({ ...OPTIONS, onData });

    expect(result).toEqual({ output: { suggestions: ['a', 'b'] } });
    // A buffered response never streams, so `onData` is not called.
    expect(onData).not.toHaveBeenCalled();
  });

  it('streams each accumulated snapshot and resolves with the final payload', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        sseResponse([
          JSON.stringify({ type: 'start' }),
          outputEvent({ suggestions: [''] }),
          outputEvent({ suggestions: ['What'] }),
          outputEvent({ suggestions: ['What', 'Any deals?'] }),
          JSON.stringify({ type: 'finish' }),
          '[DONE]',
        ])
      )
    ) as unknown as typeof fetch;

    const seen: unknown[] = [];
    const result = await fetchTask({
      ...OPTIONS,
      onData: (data) => seen.push(data),
    });

    expect(seen).toEqual([
      { output: { suggestions: [''] } },
      { output: { suggestions: ['What'] } },
      { output: { suggestions: ['What', 'Any deals?'] } },
    ]);
    expect(result).toEqual({ output: { suggestions: ['What', 'Any deals?'] } });
  });

  it('repairs a raw partial-JSON output payload while streaming', async () => {
    // `data` is the raw (still-incomplete) JSON text the model emits, not a
    // pre-parsed object — exercising the shared partial-JSON repair.
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

    const seen: unknown[] = [];
    const result = await fetchTask({
      ...OPTIONS,
      onData: (data) => seen.push(data),
    });

    // The unterminated first payload is repaired into a usable partial.
    expect(seen[0]).toEqual({ output: { suggestions: ['Wh'] } });
    expect(result).toEqual({ output: { suggestions: ['What?'] } });
  });

  it('rejects when the stream emits a terminal `error` event', async () => {
    // The backend can stream partial output and then fail; the terminal
    // `error` event must reject rather than resolve the last partial snapshot
    // as a success.
    global.fetch = jest.fn(() =>
      Promise.resolve(
        sseResponse([
          outputEvent({ suggestions: ['What'] }),
          JSON.stringify({ type: 'error', errorText: 'stream failed' }),
          '[DONE]',
        ])
      )
    ) as unknown as typeof fetch;

    const seen: unknown[] = [];
    await expect(
      fetchTask({ ...OPTIONS, onData: (data) => seen.push(data) })
    ).rejects.toThrow('stream failed');

    // Any partial received before the error is not surfaced as a result.
    expect(seen).toEqual([{ output: { suggestions: ['What'] } }]);
  });

  it('omits `stream=true` and reads JSON when `stream` is false', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ output: { suggestions: ['a'] } }))
    ) as unknown as typeof fetch;

    const onData = jest.fn();
    const result = await fetchTask({ ...OPTIONS, stream: false, onData });

    const [[url]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toBe('https://example.test/agents/xyz/tasks');
    expect(result).toEqual({ output: { suggestions: ['a'] } });
    expect(onData).not.toHaveBeenCalled();
  });

  it('reads JSON even from an event-stream body when `stream` is false', async () => {
    // A caller that opted out of streaming should never consume the SSE body,
    // even if the server responds with one.
    global.fetch = jest.fn(() =>
      Promise.resolve(sseResponse([outputEvent({ suggestions: ['x'] })]))
    ) as unknown as typeof fetch;

    const onData = jest.fn();
    // `sseResponse` has no `.json()`, so reaching the JSON branch would throw —
    // asserting the rejection is enough to prove we didn't take the stream path.
    await expect(
      fetchTask({ ...OPTIONS, stream: false, onData })
    ).rejects.toThrow();
    expect(onData).not.toHaveBeenCalled();
  });

  it('rejects on a non-ok response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response('nope', { status: 500 }))
    ) as unknown as typeof fetch;

    await expect(fetchTask(OPTIONS)).rejects.toThrow('HTTP error 500');
  });
});
