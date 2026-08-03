/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { TaskController } from '../TaskController';

import type { TaskRunnerOptions } from '../fetchTask';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Builds a fake `text/event-stream` response replaying `events` as SSE lines.
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

function create(options?: Partial<TaskRunnerOptions>) {
  return new TaskController({
    endpoint: 'https://custom.test/tasks',
    headers: {},
    task: 't',
    ...options,
  });
}

describe('TaskController', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ output: { suggestions: ['a'] } }))
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('starts idle', () => {
    const controller = create();
    expect(controller.output).toBeUndefined();
    expect(controller.isLoading).toBe(false);
    expect(controller.error).toBeUndefined();
  });

  it('notifies subscribers on state changes and stops after unsubscribe', async () => {
    const controller = create();
    const listener = jest.fn();
    const unsubscribe = controller.on(listener);

    await controller.submit({ q: 'x' });
    // loading start + resolve → at least two notifications.
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);

    listener.mockClear();
    unsubscribe();
    await controller.submit({ q: 'y' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('sets loading while a submit is in flight and unwraps the output on resolve', async () => {
    const controller = create();

    const promise = controller.submit({ foo: 'bar' });
    expect(controller.isLoading).toBe(true);
    expect(controller.error).toBeUndefined();
    expect(controller.output).toBeUndefined();

    await promise;
    expect(controller.isLoading).toBe(false);
    // Output is the unwrapped envelope (`{ output }` stripped).
    expect(controller.output).toEqual({ suggestions: ['a'] });
  });

  it('sends the variables as the task `input`', async () => {
    const controller = create({ task: 'my_task' });
    await controller.submit({ query: 'shoes' });

    const [[url, request]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).toContain('stream=true');
    expect(JSON.parse(request.body)).toEqual({
      task: 'my_task',
      input: { query: 'shoes' },
    });
  });

  it('surfaces streamed partial outputs', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        sseResponse([
          JSON.stringify({ type: 'start' }),
          outputEvent({ value: 'a' }),
          outputEvent({ value: 'ab' }),
          '[DONE]',
        ])
      )
    ) as unknown as typeof fetch;

    const controller = create();
    const seen: unknown[] = [];
    controller.on(() => {
      if (controller.output !== undefined) {
        seen.push(controller.output);
      }
    });

    await controller.submit({});
    expect(seen).toContainEqual({ value: 'a' });
    expect(controller.output).toEqual({ value: 'ab' });
    expect(controller.isLoading).toBe(false);
  });

  it('does not stream partials when `stream` is false', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ output: { done: true } }))
    ) as unknown as typeof fetch;

    const controller = create({ stream: false });
    await controller.submit({});

    const [[url]] = (global.fetch as jest.Mock).mock.calls;
    expect(url).not.toContain('stream=true');
    expect(controller.output).toEqual({ done: true });
  });

  it('surfaces the error and clears output on a failed submit', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response('nope', { status: 500 }))
    ) as unknown as typeof fetch;

    const controller = create();
    await controller.submit({});

    expect(controller.output).toBeUndefined();
    expect(controller.error).toBeInstanceOf(Error);
    expect(controller.error?.message).toMatch(/HTTP error 500/);
    expect(controller.isLoading).toBe(false);
  });

  describe('request sequencing', () => {
    it('ignores a stale response when a newer submit is in flight', async () => {
      const resolvers: Array<(value: Response) => void> = [];
      global.fetch = jest.fn(
        () => new Promise<Response>((resolve) => resolvers.push(resolve))
      ) as unknown as typeof fetch;

      const controller = create();
      controller.submit({ n: 1 });
      controller.submit({ n: 2 });
      await flush(0);

      resolvers[1](jsonResponse({ output: { winner: 2 } }));
      await flush(0);
      resolvers[0](jsonResponse({ output: { winner: 1 } }));
      await flush(0);

      expect(controller.output).toEqual({ winner: 2 });
      expect(controller.isLoading).toBe(false);
    });

    it('resolves each submit with its own result even when superseded', async () => {
      const resolvers: Array<(value: Response) => void> = [];
      global.fetch = jest.fn(
        () => new Promise<Response>((resolve) => resolvers.push(resolve))
      ) as unknown as typeof fetch;

      const controller = create();
      const first = controller.submit({ n: 1 });
      const second = controller.submit({ n: 2 });
      await flush(0);

      resolvers[1](jsonResponse({ output: { winner: 2 } }));
      resolvers[0](jsonResponse({ output: { winner: 1 } }));

      await expect(first).resolves.toEqual({ winner: 1 });
      await expect(second).resolves.toEqual({ winner: 2 });
      expect(controller.output).toEqual({ winner: 2 });
    });
  });

  it('invalidate() abandons an in-flight submit and clears loading', async () => {
    let resolveFetch: (value: Response) => void = () => {};
    global.fetch = jest.fn(
      () => new Promise<Response>((resolve) => (resolveFetch = resolve))
    ) as unknown as typeof fetch;

    const controller = create();
    controller.submit({ n: 1 });
    await flush(0);
    expect(controller.isLoading).toBe(true);

    controller.invalidate();
    expect(controller.isLoading).toBe(false);

    resolveFetch(jsonResponse({ output: { late: true } }));
    await flush(0);
    expect(controller.output).toBeUndefined();
  });

  it('reset() clears output/error/loading and notifies', async () => {
    const controller = create();
    await controller.submit({});
    expect(controller.output).toEqual({ suggestions: ['a'] });

    const listener = jest.fn();
    controller.on(listener);
    controller.reset();

    expect(controller.output).toBeUndefined();
    expect(controller.error).toBeUndefined();
    expect(controller.isLoading).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe('dispose', () => {
    it('ignores a late resolution and never notifies again', async () => {
      let resolveFetch: (value: Response) => void = () => {};
      global.fetch = jest.fn(
        () => new Promise<Response>((resolve) => (resolveFetch = resolve))
      ) as unknown as typeof fetch;

      const controller = create();
      const listener = jest.fn();
      controller.on(listener);
      controller.submit({});
      listener.mockClear();

      controller.dispose();
      resolveFetch(jsonResponse({ output: { late: true } }));
      await flush(0);

      expect(listener).not.toHaveBeenCalled();
      expect(controller.output).toBeUndefined();
    });

    it('submit after dispose resolves undefined without fetching', async () => {
      const controller = create();
      controller.dispose();
      (global.fetch as jest.Mock).mockClear();

      await expect(controller.submit({})).resolves.toBeUndefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
