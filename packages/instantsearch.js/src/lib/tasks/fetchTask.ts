import {
  parseJsonEventStream,
  parsePartialJson,
  processStream,
} from '../ai-lite';

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
};

export function fetchTask({
  endpoint,
  headers,
  payload,
  onData,
}: FetchTaskOptions): Promise<unknown> {
  return fetch(withStreamParam(endpoint), {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const contentType = response.headers?.get?.('content-type') || '';
    if (response.body && contentType.includes('text/event-stream')) {
      return consumeTaskStream(response.body, onData);
    }
    return response.json();
  });
}
