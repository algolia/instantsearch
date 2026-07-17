import {
  parseJsonEventStream,
  parsePartialJson,
  processStream,
} from '../ai-lite';

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

type TaskStreamChunk = {
  type?: string;
  data?: unknown;
};

function withStreamParam(url: string): string {
  return url.includes('?') ? `${url}&stream=true` : `${url}?stream=true`;
}

function resolveStreamedOutput(data: unknown, previous: unknown): unknown {
  return typeof data === 'string' ? parsePartialJson(data, previous) : data;
}

function consumeTaskStream(
  body: ReadableStream<Uint8Array>,
  onData?: (data: unknown) => void
): Promise<unknown> {
  return new Promise<unknown>((resolve, reject) => {
    const chunkStream = parseJsonEventStream(
      body
    ) as unknown as ReadableStream<TaskStreamChunk>;
    let latest: unknown;
    processStream(
      chunkStream,
      (chunk) => {
        if (!chunk || chunk.type !== 'data-task-output') {
          return;
        }
        latest = resolveStreamedOutput(chunk.data, latest);
        if (onData) {
          onData(latest);
        }
      },
      () => resolve(latest),
      reject
    );
  });
}

export type FetchTaskOptions = {
  endpoint: string;
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  onData?: (data: unknown) => void;
  stream?: boolean;
};

export function fetchTask({
  endpoint,
  headers,
  payload,
  onData,
  stream = true,
}: FetchTaskOptions): Promise<unknown> {
  return fetch(stream ? withStreamParam(endpoint) : endpoint, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const contentType = response.headers?.get?.('content-type') || '';
    if (stream && response.body && contentType.includes('text/event-stream')) {
      return consumeTaskStream(response.body, onData);
    }
    return response.json();
  });
}

function unwrap(envelope: unknown): unknown {
  return (envelope as { output?: unknown } | null | undefined)?.output;
}

export type StructuredOutputRunnerOptions = {
  endpoint: string;
  headers: Record<string, string>;
  task: string;
  stream?: boolean;
  prepareRequest?: TaskPrepareRequest;
};

export type StructuredOutputSubmitOptions = {
  onData?: (output: unknown) => void;
};

export type StructuredOutputRunner = {
  submit: (
    variables: Record<string, unknown>,
    options?: StructuredOutputSubmitOptions
  ) => Promise<unknown>;
};

export function createStructuredOutputRunner({
  endpoint,
  headers,
  task,
  stream = true,
  prepareRequest,
}: StructuredOutputRunnerOptions): StructuredOutputRunner {
  return {
    submit(variables, { onData } = {}) {
      const payload = buildTaskPayload({
        task,
        input: variables,
        prepareRequest,
      });
      return fetchTask({
        endpoint,
        headers,
        payload,
        stream,
        onData: onData ? (partial) => onData(unwrap(partial)) : undefined,
      }).then(unwrap);
    },
  };
}
