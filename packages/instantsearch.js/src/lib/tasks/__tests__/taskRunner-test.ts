/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createTaskRunner,
  DefaultTaskTransport,
  resolveEndpoint,
  type TaskRunnerOptions,
} from 'instantsearch.js/es/lib/tasks';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createTaskRunner', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('accepts the endpoint options shape', async () => {
    const customFetch = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(() =>
      Promise.resolve(
        jsonResponse({ output: { suggestions: ['recommended'] } })
      )
    );
    const prepareRequest = jest.fn((body: Record<string, unknown>) => ({
      body: { ...body, locale: 'en' },
    }));
    global.fetch = customFetch;
    const runner = createTaskRunner({
      endpoint: 'https://example.test/tasks',
      headers: { 'x-custom': '1' },
      task: 'recommend',
      kind: 'prompt_suggestions',
      stream: false,
      prepareRequest,
    });

    await expect(
      Promise.resolve().then(() => runner.submit({ query: 'shoes' }))
    ).resolves.toEqual({ suggestions: ['recommended'] });

    expect(prepareRequest).toHaveBeenCalledWith({
      task: 'recommend',
      kind: 'prompt_suggestions',
      input: { query: 'shoes' },
    });
    expect(customFetch).toHaveBeenCalledTimes(1);
    expect(customFetch).toHaveBeenCalledWith('https://example.test/tasks', {
      method: 'POST',
      headers: {
        'x-custom': '1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: 'recommend',
        kind: 'prompt_suggestions',
        input: { query: 'shoes' },
        locale: 'en',
      }),
    });
  });

  it('accepts endpoint options with an undefined transport property', async () => {
    const customFetch = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(() => Promise.resolve(jsonResponse({ output: { ok: true } })));
    global.fetch = customFetch;
    const options: TaskRunnerOptions = {
      endpoint: 'https://example.test/tasks',
      headers: { 'x-custom': '1' },
      task: 'recommend',
      stream: false,
      transport: undefined,
    };
    const runner = createTaskRunner(options);

    await expect(runner.submit({ query: 'shoes' })).resolves.toEqual({
      ok: true,
    });

    expect(customFetch).toHaveBeenCalledTimes(1);
  });

  it('forwards resolved custom fetch with the endpoint options shape', async () => {
    const customFetch = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(() => Promise.resolve(jsonResponse({ output: { ok: true } })));
    const globalFetch = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(() => Promise.resolve(jsonResponse({ output: { ok: false } })));
    global.fetch = globalFetch;
    const runner = createTaskRunner({
      ...resolveEndpoint({
        transport: {
          api: 'https://example.test/tasks',
          headers: { 'x-custom': '1' },
          fetch: customFetch,
        },
      }),
      task: 'recommend',
      stream: false,
    });

    await expect(runner.submit({ query: 'shoes' })).resolves.toEqual({
      ok: true,
    });

    expect(customFetch).toHaveBeenCalledTimes(1);
    expect(customFetch).toHaveBeenCalledWith('https://example.test/tasks', {
      method: 'POST',
      headers: {
        'x-custom': '1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: 'recommend',
        input: { query: 'shoes' },
      }),
    });
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it('accepts the current transport options shape', async () => {
    const customFetch = jest.fn<
      ReturnType<typeof fetch>,
      Parameters<typeof fetch>
    >(() => Promise.resolve(jsonResponse({ output: { ok: true } })));
    const transport = new DefaultTaskTransport({ fetch: customFetch });
    const runner = createTaskRunner({
      transport,
      task: 'recommend',
      stream: false,
    });

    await expect(runner.submit({ query: 'shoes' })).resolves.toEqual({
      ok: true,
    });
    expect(customFetch).toHaveBeenCalledTimes(1);
  });
});
