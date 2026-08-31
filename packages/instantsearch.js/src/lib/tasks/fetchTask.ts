import { DefaultTaskTransport } from './transport';

import type { TaskPrepareRequest } from './endpoint';

export type BuildTaskPayloadOptions = {
  task: string;
  input: Record<string, unknown>;
  prepareRequest?: TaskPrepareRequest;
};

export function buildTaskPayload({
  task,
  input,
  prepareRequest,
}: BuildTaskPayloadOptions): Record<string, unknown> {
  const payload: Record<string, unknown> = { task, input };

  return prepareRequest ? prepareRequest(payload).body : payload;
}

export type FetchTaskOptions = {
  endpoint: string;
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  fetch?: typeof fetch;
  onData?: (data: unknown) => void;
  stream?: boolean;
};

export function fetchTask({
  endpoint,
  headers,
  payload,
  fetch: customFetch,
  onData,
  stream = true,
}: FetchTaskOptions): Promise<unknown> {
  const transport = new DefaultTaskTransport({
    api: endpoint,
    headers,
    fetch: customFetch,
    prepareSendMessagesRequest: () => ({ body: payload }),
  });

  return transport.sendTaskRequest({
    task: '',
    input: {},
    stream,
    onData,
  });
}
