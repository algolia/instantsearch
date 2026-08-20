import {
  buildTaskPayload,
  createTaskRunner,
  DefaultTaskTransport,
  fetchTask,
  resolveEndpoint,
  type BuildTaskPayloadOptions,
  type FetchTaskOptions,
  type ResolvedEndpoint,
  type TaskEndpoint,
  type TaskPrepareRequest,
  type TaskRunnerOptions,
  type TaskTransport,
  type TaskTransportOptions,
} from 'instantsearch.js/es/lib/tasks';

import type { TasksConnectorParams } from 'instantsearch.js/es/connectors/tasks/connectTasks';

describe('tasks public types', () => {
  it('supports default, custom, prepared, and combined agent configuration', () => {
    const transport: TaskTransportOptions = {
      api: '/custom/tasks',
      credentials: () => Promise.resolve<RequestCredentials>('include'),
      headers: async () => new Headers({ 'x-custom': '1' }),
      body: async () => ({ locale: 'en' }),
      fetch: (...args) => fetch(...args),
      prepareSendMessagesRequest: (request) =>
        Promise.resolve({
          api: request.api,
          credentials: request.credentials,
          headers: request.headers,
          body: {
            task: request.task,
            input: request.input,
            ...request.body,
          },
        }),
    };
    const defaultTransport = new DefaultTaskTransport();
    const customTransport = new DefaultTaskTransport(transport);
    const combined: TasksConnectorParams = {
      agentId: 'agent',
      transport,
      task: 'generate',
    };
    const releasedTransport: TaskTransport = {
      api: '/custom/tasks',
      prepareSendMessagesRequest: (body) => ({ body: { ...body } }),
    };
    const releasedPreparation: TasksConnectorParams = {
      transport: releasedTransport,
      task: 'generate',
    };
    // @ts-expect-error Rich options are resolved asynchronously by DefaultTaskTransport.
    const endpointWithRichTransport: TaskEndpoint = { transport };
    type ResolveEndpointOptions = Parameters<typeof resolveEndpoint>[0];
    // @ts-expect-error Rich options are not accepted by the synchronous endpoint helper.
    const resolvedRichTransport: ResolveEndpointOptions = { transport };
    void endpointWithRichTransport;
    void resolvedRichTransport;

    expect([
      defaultTransport,
      customTransport,
      combined.transport,
      releasedPreparation.transport,
    ]).toEqual([
      expect.any(DefaultTaskTransport),
      expect.any(DefaultTaskTransport),
      transport,
      releasedTransport,
    ]);
  });

  it('preserves the published task helper surface', () => {
    const endpointTransport: TaskTransport = {
      api: 'https://example.test/tasks',
    };
    const transportEndpoint: TaskEndpoint = {
      transport: endpointTransport,
    };
    const resolvedTransport = resolveEndpoint({
      transport: endpointTransport,
    });
    const prepareRequest: TaskPrepareRequest = (body) => ({
      body: { ...body, locale: 'en' },
    });
    const payloadOptions: BuildTaskPayloadOptions = {
      task: 'recommend',
      input: { query: 'shoes' },
      prepareRequest,
    };
    const endpointOptions: TaskEndpoint = {
      credentials: {
        appId: 'app',
        apiKey: 'key',
        agentId: 'agent',
      },
    };
    const resolved: ResolvedEndpoint = resolveEndpoint({
      ...endpointOptions.credentials,
    });
    const fetchOptions: FetchTaskOptions = {
      endpoint: resolved.endpoint,
      headers: resolved.headers,
      payload: buildTaskPayload(payloadOptions),
      stream: false,
    };
    const runnerOptions: TaskRunnerOptions = {
      endpoint: resolved.endpoint,
      headers: resolved.headers,
      task: 'recommend',
      transport: undefined,
    };

    expect(fetchOptions.payload).toEqual({
      task: 'recommend',
      input: { query: 'shoes' },
      locale: 'en',
    });
    expect(transportEndpoint.transport).toBe(endpointTransport);
    expect(resolvedTransport.endpoint).toBe('https://example.test/tasks');
    void runnerOptions;
    expect(fetchTask).toEqual(expect.any(Function));
  });

  it('keeps published task runner option fields readable', () => {
    function readOptions(options: TaskRunnerOptions) {
      const endpoint: string = options.endpoint;
      const headers: Record<string, string> = options.headers;
      const prepareRequest: TaskPrepareRequest | undefined =
        options.prepareRequest;

      return { endpoint, headers, prepareRequest };
    }

    const prepareRequest: TaskPrepareRequest = (body) => ({ body });
    const options: TaskRunnerOptions = {
      endpoint: 'https://example.test/tasks',
      headers: { 'x-custom': '1' },
      task: 'recommend',
      prepareRequest,
    };
    const transportRunner = createTaskRunner({
      transport: new DefaultTaskTransport(),
      task: 'recommend',
    });

    expect(readOptions(options)).toEqual({
      endpoint: 'https://example.test/tasks',
      headers: { 'x-custom': '1' },
      prepareRequest,
    });
    void transportRunner;
  });
});
