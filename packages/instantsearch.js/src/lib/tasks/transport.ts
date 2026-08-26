import {
  parseJsonEventStream,
  parsePartialJson,
  processStream,
} from '../ai-lite';
import { resolveValue } from '../ai-lite/utils';

import type { Resolvable } from '../ai-lite';

export type TaskPrepareSendMessagesRequest = (options: {
  task?: string;
  input: Record<string, unknown>;
  stream: boolean;
  body: Record<string, unknown> | undefined;
  credentials: RequestCredentials | undefined;
  headers: HeadersInit | undefined;
  api: string;
}) =>
  | {
      body: object;
      headers?: HeadersInit;
      credentials?: RequestCredentials;
      api?: string;
    }
  | PromiseLike<{
      body: object;
      headers?: HeadersInit;
      credentials?: RequestCredentials;
      api?: string;
    }>;

export type TaskTransportOptions = {
  api?: string;
  credentials?: Resolvable<RequestCredentials>;
  headers?: Resolvable<Record<string, string> | Headers>;
  body?: Resolvable<object>;
  fetch?: typeof fetch;
  prepareSendMessagesRequest?: TaskPrepareSendMessagesRequest;
};

export type TaskSendOptions = {
  task?: string;
  input: Record<string, unknown>;
  stream: boolean;
  onData?: (output: unknown) => void;
};

function isHeaders(headers: HeadersInit): headers is Headers {
  return (
    !Array.isArray(headers) &&
    'entries' in headers &&
    typeof headers.entries === 'function'
  );
}

function headersToRecord(headers: HeadersInit | undefined) {
  if (!headers) {
    return {};
  }
  if (isHeaders(headers)) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
}

function withJsonContentType(headers: HeadersInit | undefined) {
  const merged = { ...headersToRecord(headers) };
  Object.keys(merged).forEach((name) => {
    if (name.toLowerCase() === 'content-type') {
      delete merged[name];
    }
  });
  merged['Content-Type'] = 'application/json';
  return merged;
}

function withStreamParam(url: string): string {
  return url.includes('?') ? `${url}&stream=true` : `${url}?stream=true`;
}

function resolveStreamedOutput(data: unknown, previous: unknown): unknown {
  return typeof data === 'string' ? parsePartialJson(data, previous) : data;
}

function createTaskPreparationContext(
  context: Parameters<TaskPrepareSendMessagesRequest>[0]
): Parameters<TaskPrepareSendMessagesRequest>[0] {
  type Context = Parameters<TaskPrepareSendMessagesRequest>[0];

  function hideProperty<TKey extends keyof Context>(key: TKey) {
    const value = context[key];
    Object.defineProperty(context, key, {
      configurable: true,
      enumerable: false,
      get: () => value,
      set(nextValue: Context[TKey]) {
        Reflect.deleteProperty(context, key);
        Object.defineProperty(context, key, {
          configurable: true,
          enumerable: true,
          value: nextValue,
          writable: true,
        });
      },
    });
  }

  // Rich metadata stays out of legacy body spreads until assigned as payload.
  hideProperty('stream');
  hideProperty('body');
  hideProperty('credentials');
  hideProperty('headers');
  hideProperty('api');
  return context;
}

function unwrap(envelope: unknown): unknown {
  if (
    typeof envelope === 'object' &&
    envelope !== null &&
    'output' in envelope
  ) {
    return envelope.output;
  }
  return undefined;
}

function consumeTaskStream(
  body: ReadableStream<Uint8Array>,
  onData?: (data: unknown) => void
): Promise<unknown> {
  return new Promise<unknown>((resolve, reject) => {
    const chunkStream = parseJsonEventStream(body);
    let latest: unknown;
    processStream(
      chunkStream,
      (chunk) => {
        if (!chunk) {
          return;
        }
        if (chunk.type === 'error') {
          throw new Error(chunk.errorText || 'Task stream error');
        }
        if (chunk.type !== 'data-task-output') {
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

/** Default HTTP transport for named Tasks requests and task-output streams. */
export class DefaultTaskTransport {
  protected api: string;
  protected credentials: Resolvable<RequestCredentials> | undefined;
  protected headers: Resolvable<Record<string, string> | Headers> | undefined;
  protected body: Resolvable<object> | undefined;
  protected fetch: typeof fetch | undefined;
  protected prepareSendMessagesRequest:
    | TaskPrepareSendMessagesRequest
    | undefined;

  constructor({
    api = '/api/tasks',
    credentials,
    headers,
    body,
    fetch: customFetch,
    prepareSendMessagesRequest,
  }: TaskTransportOptions = {}) {
    this.api = api;
    this.credentials = credentials;
    this.headers = headers;
    this.body = body;
    this.fetch = customFetch;
    this.prepareSendMessagesRequest = prepareSendMessagesRequest;
  }

  sendTask({ task, input, stream, onData }: TaskSendOptions): Promise<unknown> {
    return this.sendTaskRequest({
      task,
      input,
      stream,
      onData: onData ? (data) => onData(unwrap(data)) : undefined,
    }).then(unwrap);
  }

  /** @internal */
  sendTaskRequest({
    task,
    input,
    stream,
    onData,
  }: TaskSendOptions): Promise<unknown> {
    const fetchFn = this.fetch ?? fetch;

    return Promise.all([
      resolveValue(this.credentials),
      resolveValue(this.headers),
      resolveValue(this.body),
    ]).then(([resolvedCredentials, resolvedHeaders, resolvedBody]) => {
      let api = this.api;
      let credentials = resolvedCredentials;
      let headers: HeadersInit = withJsonContentType(resolvedHeaders);
      let body: object = {
        task,
        input,
        ...resolvedBody,
      };
      const preparedBody = resolvedBody ? { ...resolvedBody } : undefined;
      const preparePromise = this.prepareSendMessagesRequest
        ? Promise.resolve(
            this.prepareSendMessagesRequest(
              createTaskPreparationContext({
                task,
                input,
                stream,
                body: preparedBody,
                credentials: resolvedCredentials,
                headers: resolvedHeaders,
                api: this.api,
              })
            )
          )
        : Promise.resolve(null);

      return preparePromise.then((prepared) => {
        if (prepared) {
          body = prepared.body;
          if (prepared.api) {
            api = prepared.api;
          }
          if (prepared.credentials) {
            credentials = prepared.credentials;
          }
          if (prepared.headers) {
            headers = withJsonContentType(prepared.headers);
          }
        }

        const request: RequestInit = {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        };
        if (credentials !== undefined) {
          request.credentials = credentials;
        }

        return fetchFn(stream ? withStreamParam(api) : api, request).then(
          (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            const contentType = response.headers?.get?.('content-type') || '';
            if (
              stream &&
              response.body &&
              contentType.includes('text/event-stream')
            ) {
              return consumeTaskStream(response.body, onData);
            }
            return response.json();
          }
        );
      });
    });
  }
}
