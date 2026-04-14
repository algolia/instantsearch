/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { processStream } from './stream-parser';
import {
  generateId as defaultGenerateId,
  normalizeStreamChunkErrorText,
  SerialJobExecutor,
} from './utils';

import type {
  ChatInit,
  ChatRequestOptions,
  ChatState,
  ChatStatus,
  ChatTransport,
  CreateUIMessage,
  FileUIPart,
  IdGenerator,
  InferUIMessageMetadata,
  InferUIMessageTools,
  UIMessage,
  UIMessageChunk,
  ChatOnErrorCallback,
  ChatOnToolCallCallback,
  ChatOnFinishCallback,
  ChatOnDataCallback,
} from './types';

type ActiveResponse = {
  abortController: AbortController;
  stream?: ReadableStream<UIMessageChunk>;
};

/**
 * Abstract base class for chat implementations.
 */
export abstract class AbstractChat<TUIMessage extends UIMessage> {
  private _chatId: string;

  /**
   * Identifier sent as `chatId` / `id` on transport requests. Regenerate after
   * clearing the conversation so the backend starts a new thread.
   */
  get id(): string {
    return this._chatId;
  }

  readonly generateId: IdGenerator;
  protected state: ChatState<TUIMessage>;

  private readonly transport?: ChatTransport<TUIMessage>;
  private onError?: ChatOnErrorCallback;
  private onToolCall?: ChatOnToolCallCallback<TUIMessage>;
  private onFinish?: ChatOnFinishCallback<TUIMessage>;
  private onData?: ChatOnDataCallback<TUIMessage>;
  private sendAutomaticallyWhen?: (options: {
    messages: TUIMessage[];
  }) => boolean | PromiseLike<boolean>;

  private activeResponse: ActiveResponse | null = null;
  private jobExecutor = new SerialJobExecutor();

  constructor({
    generateId = defaultGenerateId,
    id = generateId(),
    transport,
    state,
    onError,
    onToolCall,
    onFinish,
    onData,
    sendAutomaticallyWhen,
  }: Omit<ChatInit<TUIMessage>, 'messages'> & {
    state: ChatState<TUIMessage>;
  }) {
    this._chatId = id;
    this.generateId = generateId;
    this.state = state;
    this.transport = transport;
    this.onError = onError;
    this.onToolCall = onToolCall;
    this.onFinish = onFinish;
    this.onData = onData;
    this.sendAutomaticallyWhen = sendAutomaticallyWhen;
  }

  /**
   * Hook status:
   *
   * - `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
   * - `streaming`: The response is actively streaming in from the API, receiving chunks of data.
   * - `ready`: The full response has been received and processed; a new user message can be submitted.
   * - `error`: An error occurred during the API request, preventing successful completion.
   */
  get status(): ChatStatus {
    return this.state.status;
  }

  /**
   * Store a fresh {@link Error} instance so UI layers (e.g. React `useConnector` +
   * `dequal`) never treat a new failure as “unchanged” when the same object
   * reference is reused or only {@link Error#message} is mutated.
   */
  private cloneErrorForState(source: Error): Error {
    const cause = (source as Error & { cause?: unknown }).cause;
    const clone =
      cause !== undefined
        ? new Error(source.message, { cause })
        : new Error(source.message);
    clone.name = source.name;
    if (source.stack !== undefined) {
      clone.stack = source.stack;
    }
    return clone;
  }

  protected setStatus({
    status,
    error,
  }: {
    status: ChatStatus;
    error?: Error;
  }): void {
    this.state.status = status;
    if (status === 'error' && error !== undefined) {
      this.state.error = this.cloneErrorForState(error);
    } else if (status !== 'error') {
      // Always drop the previous error when leaving `error` (new request, success,
      // clear, etc.). Passing `error: undefined` previously did not clear because
      // `undefined` was treated as “omit”, which left stale `Error` instances.
      this.state.error = undefined;
    }
  }

  get error(): Error | undefined {
    return this.state.error;
  }

  get messages(): TUIMessage[] {
    return this.state.messages;
  }

  set messages(messages: TUIMessage[]) {
    this.state.messages = messages;
  }

  get lastMessage(): TUIMessage | undefined {
    return this.state.messages[this.state.messages.length - 1];
  }

  /**
   * Appends or replaces a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   */
  sendMessage = (
    message?:
      | (CreateUIMessage<TUIMessage> & {
          text?: never;
          files?: never;
          messageId?: string;
        })
      | {
          text: string;
          files?: FileList | FileUIPart[];
          metadata?: InferUIMessageMetadata<TUIMessage>;
          parts?: never;
          messageId?: string;
        }
      | {
          files: FileList | FileUIPart[];
          metadata?: InferUIMessageMetadata<TUIMessage>;
          parts?: never;
          messageId?: string;
        },
    options?: ChatRequestOptions
  ): Promise<void> => {
    return this.jobExecutor.run(() => {
      // Build the user message
      let userMessagePromise: Promise<TUIMessage | undefined>;

      if (message) {
        const messageId = message.messageId || this.generateId();

        if ('parts' in message && message.parts) {
          // Full message with parts provided
          userMessagePromise = Promise.resolve({
            id: messageId,
            role: 'user',
            ...message,
          } as TUIMessage);
        } else if ('text' in message && message.text) {
          // Build from text
          const parts: TUIMessage['parts'] = [
            { type: 'text', text: message.text },
          ];

          // Add file parts if provided
          if (message.files) {
            userMessagePromise = this.convertFilesToParts(message.files).then(
              (fileParts) => {
                parts.push(...fileParts);
                return {
                  id: messageId,
                  role: 'user',
                  parts,
                  metadata: message.metadata,
                } as TUIMessage;
              }
            );
          } else {
            userMessagePromise = Promise.resolve({
              id: messageId,
              role: 'user',
              parts,
              metadata: message.metadata,
            } as TUIMessage);
          }
        } else if ('files' in message && message.files) {
          // Files only
          userMessagePromise = this.convertFilesToParts(message.files).then(
            (fileParts) =>
              ({
                id: messageId,
                role: 'user',
                parts: fileParts,
                metadata: message.metadata,
              } as TUIMessage)
          );
        } else {
          userMessagePromise = Promise.resolve(undefined);
        }
      } else {
        userMessagePromise = Promise.resolve(undefined);
      }

      return userMessagePromise.then((userMessage) => {
        if (userMessage) {
          this.state.pushMessage(userMessage);
        }

        return this.makeRequest({
          trigger: 'submit-message',
          messageId: userMessage?.id,
          ...options,
        });
      });
    });
  };

  /**
   * Regenerate the assistant message with the provided message id.
   * If no message id is provided, the last assistant message will be regenerated.
   */
  regenerate = ({
    messageId,
    ...options
  }: { messageId?: string } & ChatRequestOptions = {}): Promise<void> => {
    return this.jobExecutor.run(() => {
      // Find the message to regenerate from
      let targetIndex = -1;

      if (messageId) {
        targetIndex = this.state.messages.findIndex((m) => m.id === messageId);
      } else {
        // Find the last assistant message
        for (let i = this.state.messages.length - 1; i >= 0; i--) {
          if (this.state.messages[i].role === 'assistant') {
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex >= 0) {
        // Remove the assistant message and all messages after it
        this.state.messages = this.state.messages.slice(0, targetIndex);
      }

      return this.makeRequest({
        trigger: 'regenerate-message',
        messageId,
        ...options,
      });
    });
  };

  /**
   * Attempt to resume an ongoing streaming response.
   */
  resumeStream = (options?: ChatRequestOptions): Promise<void> => {
    return this.jobExecutor.run(() => {
      if (!this.transport) {
        return Promise.reject(
          new Error(
            'Transport is required for resuming stream. Please provide a transport when initializing the chat.'
          )
        );
      }

      if (this.activeResponse) {
        this.activeResponse.abortController.abort();
      }

      const requestChatId = this._chatId;
      const requestAbortController = new AbortController();
      this.activeResponse = { abortController: requestAbortController };

      this.setStatus({ status: 'submitted' });

      return this.transport
        .reconnectToStream({
          chatId: this.id,
          abortSignal: requestAbortController.signal,
          ...options,
        })
        .then(
          (stream) => {
            if (stream) {
              this.activeResponse!.stream = stream;
              return this.processStreamWithCallbacks(
                stream,
                requestChatId,
                requestAbortController
              );
            }

            if (
              this.activeResponse?.abortController === requestAbortController
            ) {
              this.activeResponse = null;
            }
            this.setStatus({ status: 'ready' });
            return Promise.resolve();
          },
          (error) => {
            if ((error as Error).name === 'AbortError') {
              if (
                this.activeResponse?.abortController === requestAbortController
              ) {
                this.activeResponse = null;
              }
              return Promise.resolve();
            }
            this.handleError(error as Error, {
              requestChatId,
              requestAbortController,
            });
            if (
              this.activeResponse?.abortController === requestAbortController
            ) {
              this.activeResponse = null;
            }
            return Promise.resolve();
          }
        );
    });
  };

  /**
   * Clear the error state and set the status to ready if the chat is in an error state.
   */
  clearError = (): void => {
    if (this.state.status === 'error') {
      this.setStatus({ status: 'ready' });
    } else if (this.state.error !== undefined) {
      this.state.error = undefined;
    }
  };

  /**
   * Assigns a new id for the next API request so the server opens a fresh
   * conversation (e.g. after clearing messages or “new conversation”).
   */
  regenerateChatId = (): void => {
    this._chatId = this.generateId();
    // Always drop error state when the conversation id rotates so the UI
    // cannot show a failure tied to the previous thread.
    this.clearError();
  };

  /**
   * Add a tool result for a tool call.
   */
  addToolResult = <TTool extends keyof InferUIMessageTools<TUIMessage>>({
    tool,
    toolCallId,
    output,
  }: {
    tool: TTool;
    toolCallId: string;
    output: InferUIMessageTools<TUIMessage>[TTool]['output'];
  }): Promise<void> => {
    return this.jobExecutor.run(() => {
      // Find the message with this tool call
      const messageIndex = this.state.messages.findIndex(
        (m) =>
          m.parts?.some(
            (p) =>
              ('toolCallId' in p && p.toolCallId === toolCallId) ||
              ('type' in p && p.type === `tool-${String(tool)}`)
          ) ?? false
      );

      if (messageIndex === -1) return Promise.resolve();

      const message = this.state.messages[messageIndex];
      const updatedParts = message.parts.map((part) => {
        if (
          'toolCallId' in part &&
          part.toolCallId === toolCallId &&
          'state' in part
        ) {
          return {
            ...part,
            state: 'output-available' as const,
            output,
          };
        }
        return part;
      });

      this.state.replaceMessage(messageIndex, {
        ...message,
        parts: updatedParts,
      } as TUIMessage);

      // Check if we should auto-send based on sendAutomaticallyWhen
      if (this.sendAutomaticallyWhen) {
        return Promise.resolve(
          this.sendAutomaticallyWhen({
            messages: this.state.messages,
          })
        ).then((shouldSend) => {
          if (shouldSend) {
            return this.makeRequest({
              trigger: 'submit-message',
            });
          }
          return Promise.resolve();
        });
      }

      return Promise.resolve();
    });
  };

  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop = (): Promise<void> => {
    if (this.activeResponse) {
      this.activeResponse.abortController.abort();
      this.activeResponse = null;
    }
    this.setStatus({ status: 'ready' });
    return Promise.resolve();
  };

  private makeRequest(
    options: {
      trigger: 'submit-message' | 'regenerate-message';
      messageId?: string;
    } & ChatRequestOptions
  ): Promise<void> {
    if (!this.transport) {
      return Promise.reject(
        new Error(
          'Transport is required for sending messages. Please provide a transport when initializing the chat.'
        )
      );
    }

    // Abort any existing request
    if (this.activeResponse) {
      this.activeResponse.abortController.abort();
    }

    /** Binds failures from this request to the conversation id at send time (see {@link handleError}). */
    const requestChatId = this._chatId;

    const abortController = new AbortController();
    this.activeResponse = { abortController };

    this.setStatus({ status: 'submitted' });

    return this.transport
      .sendMessages({
        chatId: this.id,
        messages: this.state.messages,
        abortSignal: abortController.signal,
        trigger: options.trigger,
        messageId: options.messageId,
        headers: options.headers,
        body: options.body,
        requestMetadata: options.metadata,
      })
      .then(
        (stream) => {
          this.activeResponse!.stream = stream;
          return this.processStreamWithCallbacks(
            stream,
            requestChatId,
            abortController
          );
        },
        (error) => {
          if ((error as Error).name === 'AbortError') {
            // Request was aborted, don't treat as error
            return Promise.resolve();
          }
          this.handleError(error as Error, {
            requestChatId,
            requestAbortController: abortController,
          });
          return Promise.resolve();
        }
      );
  }

  private processStreamWithCallbacks(
    stream: ReadableStream<UIMessageChunk>,
    requestChatId: string,
    requestAbortController: AbortController
  ): Promise<void> {
    this.setStatus({ status: 'streaming' });

    let currentMessageId: string | undefined;
    let currentMessage: TUIMessage | undefined;
    let currentMessageIndex = -1;
    let isAbort = false;
    let isDisconnect = false;
    let isError = false;

    // Track current text/reasoning part state
    let currentTextPartId: string | undefined;
    let currentReasoningPartId: string | undefined;

    // Promise chain for handling tool calls that return promises
    let pendingToolCall: Promise<void> = Promise.resolve();

    /** After a mid-stream `error` chunk, ignore further deltas until the stream closes. */
    let streamHalted = false;

    return new Promise((resolve) => {
      processStream<UIMessageChunk>(
        stream,
        // eslint-disable-next-line complexity
        (chunk) => {
          if (streamHalted) {
            return;
          }
          if (
            this.activeResponse?.abortController !== requestAbortController ||
            requestAbortController.signal.aborted
          ) {
            return;
          }
          switch (chunk.type) {
            case 'start': {
              currentMessageId = chunk.messageId || this.generateId();

              // Check if we're continuing an existing message or creating a new one
              const lastMessage = this.lastMessage;
              if (
                lastMessage &&
                lastMessage.role === 'assistant' &&
                lastMessage.id === currentMessageId
              ) {
                currentMessage = lastMessage;
                currentMessageIndex = this.state.messages.length - 1;
              } else {
                currentMessage = {
                  id: currentMessageId,
                  role: 'assistant',
                  parts: [],
                  metadata: chunk.messageMetadata,
                } as unknown as TUIMessage;
                this.state.pushMessage(currentMessage);
                currentMessageIndex = this.state.messages.length - 1;
              }
              break;
            }

            case 'text-start': {
              if (!currentMessage) break;
              currentTextPartId = chunk.id;

              const textPart = {
                type: 'text' as const,
                text: '',
                state: 'streaming' as const,
                providerMetadata: chunk.providerMetadata,
              };

              currentMessage = {
                ...currentMessage,
                parts: [...currentMessage.parts, textPart],
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'text-delta': {
              if (!currentMessage || !currentTextPartId) break;

              const partIndex = currentMessage.parts.findIndex(
                (p) => p.type === 'text' && p.state === 'streaming'
              );
              if (partIndex === -1) break;

              const updatedParts = [...currentMessage.parts];
              const textPart = updatedParts[partIndex] as {
                type: 'text';
                text: string;
                state?: 'streaming' | 'done';
              };
              updatedParts[partIndex] = {
                ...textPart,
                text: textPart.text + chunk.delta,
              };

              currentMessage = {
                ...currentMessage,
                parts: updatedParts,
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'text-end': {
              if (!currentMessage) break;

              const partIndex = currentMessage.parts.findIndex(
                (p) => p.type === 'text' && p.state === 'streaming'
              );
              if (partIndex === -1) break;

              const updatedParts = [...currentMessage.parts];
              const textPart = updatedParts[partIndex] as {
                type: 'text';
                text: string;
                state?: 'streaming' | 'done';
              };
              updatedParts[partIndex] = {
                ...textPart,
                state: 'done' as const,
              };

              currentMessage = {
                ...currentMessage,
                parts: updatedParts,
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              currentTextPartId = undefined;
              break;
            }

            case 'reasoning-start': {
              if (!currentMessage) break;
              currentReasoningPartId = chunk.id;

              const reasoningPart = {
                type: 'reasoning' as const,
                text: '',
                state: 'streaming' as const,
                providerMetadata: chunk.providerMetadata,
              };

              currentMessage = {
                ...currentMessage,
                parts: [...currentMessage.parts, reasoningPart],
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'reasoning-delta': {
              if (!currentMessage || !currentReasoningPartId) break;

              const partIndex = currentMessage.parts.findIndex(
                (p) => p.type === 'reasoning' && p.state === 'streaming'
              );
              if (partIndex === -1) break;

              const updatedParts = [...currentMessage.parts];
              const reasoningPart = updatedParts[partIndex] as {
                type: 'reasoning';
                text: string;
                state?: 'streaming' | 'done';
              };
              updatedParts[partIndex] = {
                ...reasoningPart,
                text: reasoningPart.text + chunk.delta,
              };

              currentMessage = {
                ...currentMessage,
                parts: updatedParts,
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'reasoning-end': {
              if (!currentMessage) break;

              const partIndex = currentMessage.parts.findIndex(
                (p) => p.type === 'reasoning' && p.state === 'streaming'
              );
              if (partIndex === -1) break;

              const updatedParts = [...currentMessage.parts];
              const reasoningPart = updatedParts[partIndex] as {
                type: 'reasoning';
                text: string;
                state?: 'streaming' | 'done';
              };
              updatedParts[partIndex] = {
                ...reasoningPart,
                state: 'done' as const,
              };

              currentMessage = {
                ...currentMessage,
                parts: updatedParts,
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              currentReasoningPartId = undefined;
              break;
            }

            case 'tool-input-start': {
              if (!currentMessage) break;

              const toolPart = {
                type: `tool-${chunk.toolName}` as const,
                toolCallId: chunk.toolCallId,
                state: 'input-streaming' as const,
                input: chunk.input,
                providerExecuted: chunk.providerExecuted,
              };

              currentMessage = {
                ...currentMessage,
                parts: [...currentMessage.parts, toolPart],
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'tool-input-delta': {
              // Tool input streaming - we'd need to parse partial JSON
              // For now, we'll wait for tool-input-available
              break;
            }

            case 'tool-input-available': {
              if (!currentMessage) break;

              // Find existing tool part or create new one
              const existingIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );

              const toolPart = {
                type: `tool-${chunk.toolName}` as const,
                toolCallId: chunk.toolCallId,
                state: 'input-available' as const,
                input: chunk.input,
                callProviderMetadata: chunk.callProviderMetadata,
                providerExecuted: chunk.providerExecuted,
              };

              if (existingIndex >= 0) {
                const updatedParts = [...currentMessage.parts];
                updatedParts[existingIndex] = toolPart;
                currentMessage = {
                  ...currentMessage,
                  parts: updatedParts,
                } as TUIMessage;
              } else {
                currentMessage = {
                  ...currentMessage,
                  parts: [...currentMessage.parts, toolPart],
                } as TUIMessage;
              }
              this.state.replaceMessage(currentMessageIndex, currentMessage);

              // Trigger onToolCall callback only for client-executed tools
              // (server-executed tools have providerExecuted: true and don't need client handling)
              if (this.onToolCall && !chunk.providerExecuted) {
                const result = this.onToolCall({
                  toolCall: {
                    toolName: chunk.toolName,
                    toolCallId: chunk.toolCallId,
                    input: chunk.input,
                  } as any,
                });
                if (result && typeof result.then === 'function') {
                  pendingToolCall = pendingToolCall.then(() => result);
                }
              }
              break;
            }

            case 'tool-output-available': {
              if (!currentMessage) break;

              const toolIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );

              if (toolIndex >= 0) {
                const updatedParts = [...currentMessage.parts];
                const existingPart = updatedParts[toolIndex] as any;
                updatedParts[toolIndex] = {
                  ...existingPart,
                  state: 'output-available',
                  output: chunk.output,
                  callProviderMetadata: chunk.callProviderMetadata,
                  preliminary: chunk.preliminary,
                };
                currentMessage = {
                  ...currentMessage,
                  parts: updatedParts,
                } as TUIMessage;
                this.state.replaceMessage(currentMessageIndex, currentMessage);
              }
              break;
            }

            case 'tool-error': {
              if (!currentMessage) break;

              const toolIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );

              if (toolIndex >= 0) {
                const updatedParts = [...currentMessage.parts];
                const existingPart = updatedParts[toolIndex] as any;
                updatedParts[toolIndex] = {
                  ...existingPart,
                  state: 'output-error',
                  errorText: chunk.errorText,
                  input: chunk.input ?? existingPart.input,
                  callProviderMetadata: chunk.callProviderMetadata,
                };
                currentMessage = {
                  ...currentMessage,
                  parts: updatedParts,
                } as TUIMessage;
                this.state.replaceMessage(currentMessageIndex, currentMessage);
              }
              break;
            }

            case 'source-url': {
              if (!currentMessage) break;

              const sourcePart = {
                type: 'source-url' as const,
                sourceId: chunk.sourceId,
                url: chunk.url,
                title: chunk.title,
              };

              currentMessage = {
                ...currentMessage,
                parts: [...currentMessage.parts, sourcePart],
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'source-document': {
              if (!currentMessage) break;

              const docPart = {
                type: 'source-document' as const,
                sourceId: chunk.sourceId,
                mediaType: chunk.mediaType,
                title: chunk.title,
                filename: chunk.filename,
                providerMetadata: chunk.providerMetadata,
              };

              currentMessage = {
                ...currentMessage,
                parts: [...currentMessage.parts, docPart],
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'file': {
              if (!currentMessage) break;

              const filePart = {
                type: 'file' as const,
                url: chunk.url,
                mediaType: chunk.mediaType,
              };

              currentMessage = {
                ...currentMessage,
                parts: [...currentMessage.parts, filePart],
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'start-step': {
              if (!currentMessage) break;

              const stepPart = { type: 'step-start' as const };

              currentMessage = {
                ...currentMessage,
                parts: [...currentMessage.parts, stepPart],
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'message-metadata': {
              if (!currentMessage) break;

              currentMessage = {
                ...currentMessage,
                metadata: chunk.messageMetadata,
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'error': {
              isError = true;
              streamHalted = true;

              if (currentMessage && currentMessageIndex >= 0) {
                const finalizedParts = currentMessage.parts.map((p) => {
                  if (
                    (p.type === 'text' || p.type === 'reasoning') &&
                    'state' in p &&
                    p.state === 'streaming'
                  ) {
                    return { ...p, state: 'done' as const };
                  }
                  return p;
                });
                currentMessage = {
                  ...currentMessage,
                  parts: finalizedParts,
                } as TUIMessage;
                this.state.replaceMessage(currentMessageIndex, currentMessage);
              }

              this.handleError(
                new Error(normalizeStreamChunkErrorText(chunk.errorText)),
                { requestChatId, requestAbortController }
              );
              break;
            }

            case 'abort': {
              isAbort = true;
              break;
            }

            case 'finish': {
              if (currentMessage && chunk.messageMetadata !== undefined) {
                currentMessage = {
                  ...currentMessage,
                  metadata: chunk.messageMetadata,
                } as TUIMessage;
                this.state.replaceMessage(currentMessageIndex, currentMessage);
              }
              break;
            }

            default: {
              // Handle data parts (data-*)
              const chunkType = (chunk as any).type as string;
              if (chunkType?.startsWith('data-') && currentMessage) {
                const dataPart = {
                  type: chunkType,
                  id: (chunk as any).id,
                  data: (chunk as any).data,
                };

                currentMessage = {
                  ...currentMessage,
                  parts: [...currentMessage.parts, dataPart],
                } as TUIMessage;
                this.state.replaceMessage(currentMessageIndex, currentMessage);

                // Trigger onData callback
                if (this.onData) {
                  this.onData(dataPart as any);
                }
              }
            }
          }
        },
        () => {
          // Wait for any pending tool calls to complete
          pendingToolCall.then(() => {
            const completionStillOwnsActiveResponse =
              this.activeResponse?.abortController === requestAbortController;

            // Mid-stream error chunks set status to `error` via handleError; do not overwrite with `ready`.
            // Never clear `activeResponse` or set `ready` from a superseded stream (new send / resume).
            if (!isError && completionStillOwnsActiveResponse) {
              this.setStatus({ status: 'ready' });
            }
            if (completionStillOwnsActiveResponse) {
              this.activeResponse = null;
            }

            // Trigger onFinish callback
            if (
              this.onFinish &&
              currentMessage &&
              completionStillOwnsActiveResponse
            ) {
              this.onFinish({
                message: currentMessage,
                messages: this.state.messages,
                isAbort,
                isDisconnect,
                isError,
              });
            }

            // Note: sendAutomaticallyWhen is only checked in addToolResult,
            // not here. For server-executed tools, the server continues the
            // conversation. For client-executed tools, addToolResult handles it.
            resolve();
          });
        },
        (error) => {
          const completionStillOwnsActiveResponse =
            this.activeResponse?.abortController === requestAbortController;

          if (completionStillOwnsActiveResponse) {
            this.activeResponse = null;
          }

          if (error.name === 'AbortError') {
            isAbort = true;
            if (completionStillOwnsActiveResponse) {
              this.setStatus({ status: 'ready' });
            }
          } else {
            isDisconnect = true;
            this.handleError(error, {
              requestChatId,
              requestAbortController,
            });
          }

          // Still call onFinish even on error/abort
          if (
            this.onFinish &&
            currentMessage &&
            completionStillOwnsActiveResponse
          ) {
            this.onFinish({
              message: currentMessage,
              messages: this.state.messages,
              isAbort,
              isDisconnect,
              isError,
            });
          }

          resolve();
        }
      );
    });
  }

  /**
   * When {@link regenerateChatId} runs (e.g. after “new conversation”), late
   * stream / transport callbacks from the previous id must not repopulate
   * {@link AbstractChat#error} or the UI stays on the old failure text.
   *
   * When {@link requestAbortController} is set, errors from a superseded in-flight
   * request (same {@link _chatId} but a newer {@link makeRequest} replaced
   * {@link activeResponse}) are ignored as well.
   */
  private handleError(
    error: Error,
    options?: {
      requestChatId?: string;
      requestAbortController?: AbortController;
    }
  ): void {
    if (options?.requestAbortController !== undefined) {
      if (
        this.activeResponse?.abortController !== options.requestAbortController
      ) {
        return;
      }
    } else if (
      options?.requestChatId !== undefined &&
      options.requestChatId !== this._chatId
    ) {
      return;
    }

    this.setStatus({ status: 'error', error });

    if (this.onError) {
      this.onError(error);
    }
  }

  private convertFilesToParts(
    files: FileList | FileUIPart[]
  ): Promise<FileUIPart[]> {
    if (Array.isArray(files)) {
      return Promise.resolve(files);
    }

    const promises: Array<Promise<FileUIPart>> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      promises.push(
        this.fileToDataUrl(file).then((dataUrl) => ({
          type: 'file' as const,
          mediaType: file.type,
          filename: file.name,
          url: dataUrl,
        }))
      );
    }
    return Promise.all(promises);
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
