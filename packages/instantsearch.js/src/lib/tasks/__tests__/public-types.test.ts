import {
  buildTaskPayload,
  DefaultTaskTransport,
  fetchTask,
  resolveEndpoint,
  type BuildTaskPayloadOptions,
  type FetchTaskOptions,
  type ResolvedEndpoint,
  type TaskEndpoint,
  type TaskPrepareRequest,
  type TaskTransport,
} from 'instantsearch.js/es/lib/tasks';

import type { TasksConnectorParams } from 'instantsearch.js/es/connectors/tasks/connectTasks';

describe('tasks public types', () => {
  it('supports default, custom, prepared, and combined agent configuration', () => {
    const transport: TaskTransport = {
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

    expect([defaultTransport, customTransport, combined.transport]).toEqual([
      expect.any(DefaultTaskTransport),
      expect.any(DefaultTaskTransport),
      transport,
    ]);
  });

  it('preserves the published task helper surface', () => {
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

    expect(fetchOptions.payload).toEqual({
      task: 'recommend',
      input: { query: 'shoes' },
      locale: 'en',
    });
    expect(fetchTask).toEqual(expect.any(Function));
  });
});
