/**
 * HTTP transport implementation for chat.
 */
import { parseJsonEventStream } from './stream-parser';
import { resolveValue } from './utils';

import type {
  ChatTransport,
  HttpChatTransportInitOptions,
  UIMessage,
  UIMessageChunk,
  FetchFunction,
  PrepareSendMessagesRequest,
  PrepareReconnectToStreamRequest,
  Resolvable,
} from './types';

/**
 * Abstract base class for HTTP-based chat transports.
 */
export abstract class HttpChatTransport<TUIMessage extends UIMessage>
  implements ChatTransport<TUIMessage>
{
  protected api: string;
  protected credentials: Resolvable<RequestCredentials> | undefined;
  protected headers: Resolvable<Record<string, string> | Headers> | undefined;
  protected body: Resolvable<object> | undefined;
  protected fetch?: FetchFunction;
  protected prepareSendMessagesRequest?: PrepareSendMessagesRequest<TUIMessage>;
  protected prepareReconnectToStreamRequest?: PrepareReconnectToStreamRequest;

  constructor({
    api = '/api/chat',
    credentials,
    headers,
    body,
    fetch: customFetch,
    prepareSendMessagesRequest,
    prepareReconnectToStreamRequest,
  }: HttpChatTransportInitOptions<TUIMessage>) {
    this.api = api;
    this.credentials = credentials;
    this.headers = headers;
    this.body = body;
    this.fetch = customFetch;
    this.prepareSendMessagesRequest = prepareSendMessagesRequest;
    this.prepareReconnectToStreamRequest = prepareReconnectToStreamRequest;
  }

  sendMessages({
    abortSignal,
    chatId,
    messages,
    requestMetadata,
    trigger,
    messageId,
    headers: requestHeaders,
    body: requestBody,
  }: Parameters<ChatTransport<TUIMessage>['sendMessages']>[0]): Promise<
    ReadableStream<UIMessageChunk>
  > {
    const fetchFn = this.fetch ?? fetch;

    // Resolve configurable values
    return Promise.all([
      resolveValue(this.credentials),
      resolveValue(this.headers),
      resolveValue(this.body),
    ]).then(([resolvedCredentials, resolvedHeaders, resolvedBody]) => {
      // Build default request options
      let api = this.api;
      let body: object = {
        id: chatId,
        messages,
        ...resolvedBody,
        ...requestBody,
      };
      let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(resolvedHeaders instanceof Headers
          ? Object.fromEntries(resolvedHeaders.entries())
          : resolvedHeaders),
        ...(requestHeaders instanceof Headers
          ? Object.fromEntries(requestHeaders.entries())
          : requestHeaders),
      };
      let credentials: RequestCredentials | undefined = resolvedCredentials;

      // Apply custom preparation if provided
      const prepareRequestBody: Record<string, unknown> = {
        ...resolvedBody,
        ...requestBody,
      };
      const preparePromise = this.prepareSendMessagesRequest
        ? Promise.resolve(
            this.prepareSendMessagesRequest({
              id: chatId,
              messages,
              requestMetadata,
              body: prepareRequestBody,
              credentials: resolvedCredentials,
              headers: resolvedHeaders,
              api: this.api,
              trigger,
              messageId,
            })
          )
        : Promise.resolve(null);

      return preparePromise.then((prepared) => {
        if (prepared) {
          body = prepared.body;
          if (prepared.api) api = prepared.api;
          if (prepared.headers) {
            headers = {
              'Content-Type': 'application/json',
              ...(prepared.headers instanceof Headers
                ? Object.fromEntries(prepared.headers.entries())
                : prepared.headers),
            };
          }
          if (prepared.credentials) credentials = prepared.credentials;
        }

        return fetchFn(api, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: abortSignal,
          credentials,
        }).then((response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP error: ${response.status} ${response.statusText}`
            );
          }

          if (!response.body) {
            throw new Error('Response body is empty');
          }

          return this.processResponseStream(response.body);
        });
      });
    });
  }

  reconnectToStream({
    chatId,
    headers: requestHeaders,
    body: requestBody,
  }: Parameters<
    ChatTransport<TUIMessage>['reconnectToStream']
  >[0]): Promise<ReadableStream<UIMessageChunk> | null> {
    const fetchFn = this.fetch ?? fetch;

    // Resolve configurable values
    return Promise.all([
      resolveValue(this.credentials),
      resolveValue(this.headers),
      resolveValue(this.body),
    ]).then(([resolvedCredentials, resolvedHeaders, resolvedBody]) => {
      // Build default request options
      let api = this.api;
      let headers: HeadersInit = {
        ...(resolvedHeaders instanceof Headers
          ? Object.fromEntries(resolvedHeaders.entries())
          : resolvedHeaders),
        ...(requestHeaders instanceof Headers
          ? Object.fromEntries(requestHeaders.entries())
          : requestHeaders),
      };
      let credentials: RequestCredentials | undefined = resolvedCredentials;

      // Apply custom preparation if provided
      const prepareRequestBody: Record<string, unknown> = {
        ...resolvedBody,
        ...requestBody,
      };
      const preparePromise = this.prepareReconnectToStreamRequest
        ? Promise.resolve(
            this.prepareReconnectToStreamRequest({
              id: chatId,
              requestMetadata: undefined,
              body: prepareRequestBody,
              credentials: resolvedCredentials,
              headers: resolvedHeaders,
              api: this.api,
            })
          )
        : Promise.resolve(null);

      return preparePromise.then((prepared) => {
        if (prepared) {
          if (prepared.api) api = prepared.api;
          if (prepared.headers) {
            headers =
              prepared.headers instanceof Headers
                ? Object.fromEntries(prepared.headers.entries())
                : prepared.headers;
          }
          if (prepared.credentials) credentials = prepared.credentials;
        }

        // GET request for reconnection
        return fetchFn(`${api}?chatId=${chatId}`, {
          method: 'GET',
          headers,
          credentials,
        }).then((response) => {
          if (!response.ok) {
            // 404 means no stream to reconnect to, which is not an error
            if (response.status === 404) {
              return null;
            }
            throw new Error(
              `HTTP error: ${response.status} ${response.statusText}`
            );
          }

          if (!response.body) {
            return null;
          }

          return this.processResponseStream(response.body);
        });
      });
    });
  }

  protected abstract processResponseStream(
    stream: ReadableStream<Uint8Array>
  ): ReadableStream<UIMessageChunk>;
}

/**
 * Default chat transport implementation using NDJSON streaming.
 */
export class DefaultChatTransport<
  TUIMessage extends UIMessage
> extends HttpChatTransport<TUIMessage> {
  constructor(options: HttpChatTransportInitOptions<TUIMessage> = {}) {
    super(options);
  }

  protected processResponseStream(
    stream: ReadableStream<Uint8Array>
  ): ReadableStream<UIMessageChunk> {
    return parseJsonEventStream(stream);
  }
}
