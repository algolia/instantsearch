/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { processStream } from './stream-parser';
import {
  generateId as defaultGenerateId,
  SerialJobExecutor,
  tryParseErrorMessage,
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
  InferUIMessageChunk,
  InferUIMessageMetadata,
  InferUIMessageToolCall,
  InferUIMessageTools,
  UIMessage,
  UIMessageChunk,
  ChatOnErrorCallback,
  ChatOnToolCallCallback,
  ChatOnFinishCallback,
  ChatOnDataCallback,
} from './types';

type ActiveResponse<TChunk extends UIMessageChunk = UIMessageChunk> = {
  abortController: AbortController;
  stream?: ReadableStream<TChunk>;
  messageId?: string;
  requiredToolCallIds: Set<string>;
  resolvedToolCallIds: Set<string>;
  outcome: 'active' | 'success' | 'error' | 'abort';
  finishNotified: boolean;
  continuationChecked: boolean;
  errorHandled: boolean;
};

const tryParseJson = (value: string): unknown | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const repairPartialJson = (value: string): string => {
  let repaired = value.trim();

  if (!repaired) {
    return repaired;
  }

  let inString = false;
  let isEscaped = false;
  const stack: Array<'{' | '['> = [];

  for (let index = 0; index < repaired.length; index++) {
    const char = repaired[index];
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
      continue;
    }

    if (char === '}' && stack[stack.length - 1] === '{') {
      stack.pop();
      continue;
    }

    if (char === ']' && stack[stack.length - 1] === '[') {
      stack.pop();
    }
  }

  if (inString && !isEscaped) {
    repaired += '"';
  }

  repaired = repaired.replace(/,\s*$/u, '');

  if (stack.length > 0) {
    repaired += stack
      .reverse()
      .map((opening) => (opening === '{' ? '}' : ']'))
      .join('');
  }

  return repaired.replace(/,\s*([}\]])/gu, '$1');
};

const parseToolInputDelta = (
  accumulatedRawInput: string,
  fallbackInput: unknown
): unknown => {
  const normalized = accumulatedRawInput.trim();
  if (!normalized) {
    return fallbackInput;
  }

  const directParsed = tryParseJson(normalized);
  if (directParsed !== undefined) {
    return directParsed;
  }

  const repairedParsed = tryParseJson(repairPartialJson(normalized));
  if (repairedParsed !== undefined) {
    return repairedParsed;
  }

  return fallbackInput;
};

const defaultGuardrailFallbackResponse =
  'Sorry, we are not able to generate a response at the moment.';

/**
 * Abstract base class for chat implementations.
 */
export abstract class AbstractChat<TUIMessage extends UIMessage> {
  private conversationId: string;
  readonly generateId: IdGenerator;

  get id(): string {
    return this.conversationId;
  }
  protected state: ChatState<TUIMessage>;

  private readonly transport?: ChatTransport<TUIMessage>;
  private onError?: ChatOnErrorCallback;
  private onToolCall?: ChatOnToolCallCallback<TUIMessage>;
  private onFinish?: ChatOnFinishCallback<TUIMessage>;
  private onData?: ChatOnDataCallback<TUIMessage>;
  private sendAutomaticallyWhen?: (options: {
    messages: TUIMessage[];
  }) => boolean | PromiseLike<boolean>;
  private shouldRepairToolInput?: (toolName: string) => boolean;

  private activeResponse: ActiveResponse<
    InferUIMessageChunk<TUIMessage>
  > | null = null;
  private toolCallResponses = new Map<
    string,
    ActiveResponse<InferUIMessageChunk<TUIMessage>>
  >();
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
    shouldRepairToolInput,
  }: Omit<ChatInit<TUIMessage>, 'messages'> & {
    state: ChatState<TUIMessage>;
  }) {
    this.conversationId = id;
    this.generateId = generateId;
    this.state = state;
    this.transport = transport;
    this.onError = onError;
    this.onToolCall = onToolCall;
    this.onFinish = onFinish;
    this.onData = onData;
    this.sendAutomaticallyWhen = sendAutomaticallyWhen;
    this.shouldRepairToolInput = shouldRepairToolInput;
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

  protected setStatus({
    status,
    error,
  }: {
    status: ChatStatus;
    error?: Error;
  }): void {
    this.state.status = status;
    if (error !== undefined) {
      this.state.error = error;
    }
  }

  get error(): Error | undefined {
    return this.state.error;
  }

  /**
   * Starts a new server-side conversation thread by rotating the id sent as
   * `chatId` / `id` on the next request. The InstantSearch connector calls this
   * after the user clears the transcript so completions are not tied to prior
   * context.
   */
  resetConversationId(): void {
    this.conversationId = this.generateId();
  }

  get messages(): TUIMessage[] {
    return this.state.messages;
  }

  set messages(messages: TUIMessage[]) {
    this.state.messages = messages;
    this.toolCallResponses.clear();
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
        this.pruneToolCallResponses();
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
        this.activeResponse.outcome = 'abort';
        this.activeResponse.abortController.abort();
      }

      const response = this.createResponse();
      this.activeResponse = response;
      this.setStatus({ status: 'submitted' });

      return this.transport
        .reconnectToStream({
          chatId: this.id,
          ...options,
        })
        .then(
          (stream) => {
            if (stream) {
              if (this.activeResponse !== response) return Promise.resolve();
              response.stream = stream;
              return this.processStreamWithCallbacks(stream, response);
            } else {
              response.outcome = 'success';
              if (this.activeResponse === response) {
                this.activeResponse = null;
                this.setStatus({ status: 'ready' });
              }
              return Promise.resolve();
            }
          },
          (error) => {
            if (
              response.outcome === 'abort' ||
              this.activeResponse !== response
            ) {
              return Promise.resolve();
            }
            this.failResponse(response, error as Error);
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
      this.setStatus({ status: 'ready', error: undefined });
    }
  };

  private createResponse(): ActiveResponse<InferUIMessageChunk<TUIMessage>> {
    return {
      abortController: new AbortController(),
      requiredToolCallIds: new Set(),
      resolvedToolCallIds: new Set(),
      outcome: 'active',
      finishNotified: false,
      continuationChecked: false,
      errorHandled: false,
    };
  }

  private getResponseForToolCall(
    toolCallId: string
  ): ActiveResponse<InferUIMessageChunk<TUIMessage>> | undefined {
    this.pruneToolCallResponses();
    return this.toolCallResponses.get(toolCallId);
  }

  private pruneToolCallResponses(): void {
    const messageIds = new Set(
      this.state.messages.map((message) => message.id)
    );

    this.toolCallResponses.forEach((response, toolCallId) => {
      if (response.messageId && !messageIds.has(response.messageId)) {
        this.toolCallResponses.delete(toolCallId);
      }
    });
  }

  private commitToolResult(toolCallId: string, output: unknown): boolean {
    const messageIndex = this.state.messages.findIndex((message) =>
      message.parts?.some(
        (part) => 'toolCallId' in part && part.toolCallId === toolCallId
      )
    );

    if (messageIndex === -1) return false;

    const message = this.state.messages[messageIndex];
    let didUpdate = false;
    const updatedParts = message.parts.map((part) => {
      if (
        'toolCallId' in part &&
        part.toolCallId === toolCallId &&
        'state' in part
      ) {
        if (
          part.state === 'output-available' ||
          part.state === 'output-error'
        ) {
          return part;
        }
        didUpdate = true;
        return {
          ...part,
          state: 'output-available' as const,
          output,
        };
      }
      return part;
    });

    if (!didUpdate) return false;

    this.state.replaceMessage(messageIndex, {
      ...message,
      parts: updatedParts,
    } as TUIMessage);
    return true;
  }

  private hasAllToolResults(
    response: ActiveResponse<InferUIMessageChunk<TUIMessage>>
  ): boolean {
    return (
      response.requiredToolCallIds.size > 0 &&
      Array.from(response.requiredToolCallIds).every((toolCallId) =>
        response.resolvedToolCallIds.has(toolCallId)
      )
    );
  }

  private continueResponseIfReady(
    response: ActiveResponse<InferUIMessageChunk<TUIMessage>>
  ): Promise<void> {
    if (
      response.outcome !== 'success' ||
      !response.finishNotified ||
      response.continuationChecked ||
      !this.hasAllToolResults(response)
    ) {
      return Promise.resolve();
    }

    response.continuationChecked = true;
    if (!this.sendAutomaticallyWhen) return Promise.resolve();

    return Promise.resolve()
      .then(() =>
        this.sendAutomaticallyWhen!({
          messages: this.state.messages,
        })
      )
      .then((shouldSend) => {
        if (!shouldSend) return Promise.resolve();
        return this.makeRequest({ trigger: 'submit-message' });
      })
      .catch((error) => {
        this.failResponse(response, error as Error, true);
      });
  }

  private continueUnownedResult(): Promise<void> {
    if (!this.sendAutomaticallyWhen) return Promise.resolve();

    return Promise.resolve()
      .then(() =>
        this.sendAutomaticallyWhen!({ messages: this.state.messages })
      )
      .then((shouldSend) => {
        if (!shouldSend) return Promise.resolve();
        return this.makeRequest({ trigger: 'submit-message' });
      })
      .catch((error) => {
        this.handleError(error as Error);
      });
  }

  /**
   * Add a tool result for a tool call.
   */
  addToolResult = <TTool extends keyof InferUIMessageTools<TUIMessage>>({
    tool: _tool,
    toolCallId,
    output,
  }: {
    tool: TTool;
    toolCallId: string;
    output: InferUIMessageTools<TUIMessage>[TTool]['output'];
  }): Promise<void> => {
    const response = this.getResponseForToolCall(toolCallId);
    const commitResult = (): Promise<void> => {
      if (!this.commitToolResult(toolCallId, output)) {
        return Promise.resolve();
      }

      if (response) {
        response.resolvedToolCallIds.add(toolCallId);
        return this.continueResponseIfReady(response);
      }

      return this.continueUnownedResult();
    };

    if (response?.outcome === 'active') {
      return commitResult();
    }

    return this.jobExecutor.run(commitResult);
  };

  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop = (): Promise<void> => {
    if (this.activeResponse) {
      const response = this.activeResponse;
      response.outcome = 'abort';
      this.activeResponse = null;
      response.abortController.abort();
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
      const previousResponse = this.activeResponse;
      previousResponse.outcome = 'abort';
      previousResponse.abortController.abort();
    }

    const response = this.createResponse();
    this.activeResponse = response;

    this.setStatus({ status: 'submitted' });

    return this.transport
      .sendMessages({
        chatId: this.id,
        messages: this.state.messages,
        abortSignal: response.abortController.signal,
        trigger: options.trigger,
        messageId: options.messageId,
        headers: options.headers,
        body: options.body,
        requestMetadata: options.metadata,
      })
      .then(
        (stream) => {
          if (this.activeResponse !== response) return Promise.resolve();
          response.stream = stream;
          return this.processStreamWithCallbacks(stream, response);
        },
        (error) => {
          if ((error as Error).name === 'AbortError') {
            response.outcome = 'abort';
            if (this.activeResponse === response) {
              this.activeResponse = null;
              this.setStatus({ status: 'ready' });
            }
            return Promise.resolve();
          }
          if (
            response.outcome === 'abort' ||
            this.activeResponse !== response
          ) {
            return Promise.resolve();
          }
          this.failResponse(response, error as Error);
          return Promise.resolve();
        }
      );
  }

  private getResponseMessage(
    response: ActiveResponse<InferUIMessageChunk<TUIMessage>>
  ): TUIMessage | undefined {
    if (!response.messageId) return undefined;
    return this.state.messages.find(
      (message) => message.id === response.messageId
    );
  }

  private notifyResponseFinish(
    response: ActiveResponse<InferUIMessageChunk<TUIMessage>>,
    flags: {
      isAbort: boolean;
      isDisconnect: boolean;
      isError: boolean;
    }
  ): void {
    if (response.finishNotified) return;
    response.finishNotified = true;

    const message = this.getResponseMessage(response);
    if (this.onFinish && message) {
      this.onFinish({
        message,
        messages: this.state.messages,
        ...flags,
      });
    }
  }

  private failResponse(
    response: ActiveResponse<InferUIMessageChunk<TUIMessage>>,
    error: Error,
    allowInactive = false
  ): void {
    if (response.errorHandled) return;

    response.errorHandled = true;
    response.outcome = 'error';
    response.continuationChecked = true;
    response.abortController.abort();

    if (this.activeResponse === response || allowInactive) {
      if (this.activeResponse === response) {
        this.activeResponse = null;
      }
      this.handleError(error);
    }

    this.notifyResponseFinish(response, {
      isAbort: false,
      isDisconnect: false,
      isError: true,
    });
  }

  private processStreamWithCallbacks(
    stream: ReadableStream<InferUIMessageChunk<TUIMessage>>,
    response: ActiveResponse<InferUIMessageChunk<TUIMessage>>
  ): Promise<void> {
    if (this.activeResponse === response) {
      this.setStatus({ status: 'streaming' });
    }

    let currentMessageId: string | undefined;
    let currentMessage: TUIMessage | undefined;
    let currentMessageIndex = -1;
    let isAbort = false;
    let isDisconnect = false;
    let isError = false;

    // Track current text/reasoning part state
    let currentTextPartId: string | undefined;
    let currentReasoningPartId: string | undefined;
    const toolRawInputByCallId: Record<string, string> = {};
    const toolRawOutputByCallId: Record<string, string> = {};

    const pendingToolCalls: Array<Promise<void>> = [];

    return new Promise((resolve) => {
      processStream<UIMessageChunk>(
        stream as ReadableStream<UIMessageChunk>,
        // eslint-disable-next-line complexity
        (chunk) => {
          if (response.outcome !== 'active') return;

          if (currentMessageId) {
            const canonicalMessageIndex = this.state.messages.findIndex(
              (message) => message.id === currentMessageId
            );
            if (canonicalMessageIndex >= 0) {
              currentMessageIndex = canonicalMessageIndex;
              currentMessage = this.state.messages[canonicalMessageIndex];
            }
          }

          switch (chunk.type) {
            case 'start': {
              currentMessageId = chunk.messageId || this.generateId();
              response.messageId = currentMessageId;

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

              const completedPart = currentMessage.parts.find(
                (part) =>
                  'toolCallId' in part &&
                  part.toolCallId === chunk.toolCallId &&
                  'state' in part &&
                  (part.state === 'output-available' ||
                    part.state === 'output-error')
              );
              if (completedPart) break;

              const initialRawInput =
                typeof chunk.input === 'string'
                  ? chunk.input
                  : chunk.input !== undefined
                  ? JSON.stringify(chunk.input)
                  : '';

              toolRawInputByCallId[chunk.toolCallId] = initialRawInput;

              const toolPart = {
                type: `tool-${chunk.toolName}` as const,
                toolCallId: chunk.toolCallId,
                state: 'input-streaming' as const,
                input: chunk.input,
                rawInput: initialRawInput || undefined,
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
              if (!currentMessage) break;

              const toolIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );

              const existingPart =
                toolIndex >= 0
                  ? (currentMessage.parts[toolIndex] as any)
                  : null;
              if (
                existingPart?.state === 'output-available' ||
                existingPart?.state === 'output-error'
              ) {
                break;
              }
              const previousRawInput =
                existingPart?.rawInput ??
                toolRawInputByCallId[chunk.toolCallId] ??
                '';
              const nextRawInput = `${previousRawInput}${chunk.inputTextDelta}`;
              toolRawInputByCallId[chunk.toolCallId] = nextRawInput;

              const toolName =
                chunk.toolName ?? existingPart?.type?.replace('tool-', '');
              const shouldRepair = toolName
                ? this.shouldRepairToolInput?.(toolName) ?? true
                : true;
              const parsedInput = shouldRepair
                ? parseToolInputDelta(nextRawInput, existingPart?.input)
                : existingPart?.input;

              const nextToolPart = {
                ...(existingPart ?? {
                  type: `tool-${chunk.toolName}` as const,
                  toolCallId: chunk.toolCallId,
                }),
                state: 'input-streaming' as const,
                input: parsedInput,
                rawInput: nextRawInput,
              };

              if (toolIndex >= 0) {
                const updatedParts = [...currentMessage.parts];
                updatedParts[toolIndex] = nextToolPart;
                currentMessage = {
                  ...currentMessage,
                  parts: updatedParts,
                } as TUIMessage;
              } else {
                currentMessage = {
                  ...currentMessage,
                  parts: [...currentMessage.parts, nextToolPart],
                } as TUIMessage;
              }

              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'tool-input-available': {
              if (!currentMessage) break;

              delete toolRawInputByCallId[chunk.toolCallId];

              // Find existing tool part or create new one
              const existingIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );
              const existingPart =
                existingIndex >= 0
                  ? (currentMessage.parts[existingIndex] as any)
                  : null;
              if (
                existingPart?.state === 'output-available' ||
                existingPart?.state === 'output-error'
              ) {
                break;
              }

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
                response.requiredToolCallIds.add(chunk.toolCallId);
                this.toolCallResponses.set(chunk.toolCallId, response);

                try {
                  const result = this.onToolCall({
                    toolCall: {
                      toolName: chunk.toolName,
                      toolCallId: chunk.toolCallId,
                      input: chunk.input,
                      dynamic: 'dynamic' in chunk ? chunk.dynamic : undefined,
                    } as InferUIMessageToolCall<TUIMessage>,
                  });
                  if (result && typeof result.then === 'function') {
                    pendingToolCalls.push(
                      Promise.resolve(result).catch((error) => {
                        this.failResponse(
                          response,
                          error instanceof Error
                            ? error
                            : new Error(String(error))
                        );
                      })
                    );
                  }
                } catch (error) {
                  this.failResponse(
                    response,
                    error instanceof Error ? error : new Error(String(error))
                  );
                }
              }
              break;
            }

            case 'data-tool-output-delta': {
              if (!currentMessage) break;

              const { toolCallId, toolName, delta } = chunk.data as {
                toolCallId: string;
                toolName: string;
                delta: string;
              };

              const toolIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === toolCallId
              );

              const existingPart =
                toolIndex >= 0
                  ? (currentMessage.parts[toolIndex] as any)
                  : null;
              const previousRawOutput =
                existingPart?.rawOutput ??
                toolRawOutputByCallId[toolCallId] ??
                '';
              const nextRawOutput = `${previousRawOutput}${delta}`;
              toolRawOutputByCallId[toolCallId] = nextRawOutput;

              const parsedOutput = parseToolInputDelta(
                nextRawOutput,
                existingPart?.output
              );

              const nextToolPart = {
                ...(existingPart ?? {
                  type: `tool-${toolName}` as const,
                  toolCallId,
                  input: undefined,
                }),
                state: 'output-available' as const,
                output: parsedOutput,
                rawOutput: nextRawOutput,
                preliminary: true,
              };

              if (toolIndex >= 0) {
                const updatedParts = [...currentMessage.parts];
                updatedParts[toolIndex] = nextToolPart;
                currentMessage = {
                  ...currentMessage,
                  parts: updatedParts,
                } as TUIMessage;
              } else {
                currentMessage = {
                  ...currentMessage,
                  parts: [...currentMessage.parts, nextToolPart],
                } as TUIMessage;
              }

              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'tool-output-available': {
              if (!currentMessage) break;

              const toolIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );

              if (toolIndex >= 0) {
                delete toolRawInputByCallId[chunk.toolCallId];
                delete toolRawOutputByCallId[chunk.toolCallId];

                const updatedParts = [...currentMessage.parts];
                const existingPart = updatedParts[toolIndex] as any;
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                const { rawOutput: _ignored, ...rest } = existingPart;
                updatedParts[toolIndex] = {
                  ...rest,
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

            case 'tool-input-error': {
              if (!currentMessage) break;
              delete toolRawInputByCallId[chunk.toolCallId];
              delete toolRawOutputByCallId[chunk.toolCallId];

              const toolIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );
              const existingPart =
                toolIndex >= 0
                  ? (currentMessage.parts[toolIndex] as any)
                  : null;

              const {
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                output: _ignoredOutput,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                rawOutput: _ignoredRawOutput,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                preliminary: _ignoredPreliminary,
                ...carryOver
              } = existingPart ?? {};

              const nextToolPart = {
                ...carryOver,
                type: `tool-${chunk.toolName}` as const,
                toolCallId: chunk.toolCallId,
                state: 'output-error' as const,
                input: undefined,
                rawInput: chunk.input ?? carryOver.rawInput,
                errorText: chunk.errorText,
                providerExecuted:
                  chunk.providerExecuted ?? carryOver.providerExecuted,
                callProviderMetadata:
                  chunk.providerMetadata ?? carryOver.callProviderMetadata,
              };

              if (toolIndex >= 0) {
                const updatedParts = [...currentMessage.parts];
                updatedParts[toolIndex] = nextToolPart;
                currentMessage = {
                  ...currentMessage,
                  parts: updatedParts,
                } as TUIMessage;
              } else {
                currentMessage = {
                  ...currentMessage,
                  parts: [...currentMessage.parts, nextToolPart],
                } as TUIMessage;
              }
              this.state.replaceMessage(currentMessageIndex, currentMessage);
              break;
            }

            case 'tool-output-error': {
              if (!currentMessage) break;

              const toolIndex = currentMessage.parts.findIndex(
                (p) => 'toolCallId' in p && p.toolCallId === chunk.toolCallId
              );
              if (toolIndex < 0) break;

              delete toolRawInputByCallId[chunk.toolCallId];
              delete toolRawOutputByCallId[chunk.toolCallId];

              const updatedParts = [...currentMessage.parts];
              const existingPart = updatedParts[toolIndex] as any;
              const {
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                rawOutput: _ignoredRawOutput,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                preliminary: _ignoredPreliminary,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                output: _ignoredOutput,
                ...rest
              } = existingPart;
              updatedParts[toolIndex] = {
                ...rest,
                state: 'output-error',
                errorText: chunk.errorText,
                providerExecuted:
                  chunk.providerExecuted ?? rest.providerExecuted,
                callProviderMetadata:
                  chunk.providerMetadata ?? rest.callProviderMetadata,
              };
              currentMessage = {
                ...currentMessage,
                parts: updatedParts,
              } as TUIMessage;
              this.state.replaceMessage(currentMessageIndex, currentMessage);
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
              const text = chunk.errorText.trim();
              throw new Error(
                tryParseErrorMessage(text) || text || 'Unknown error'
              );
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

            case 'data-guardrail-violation': {
              // `chunk.data` widens to `unknown` here: the chunk union also
              // carries a generic `data-${string}` member, and the literal
              // matches both, so narrowing can't pick the specific shape.
              const { fallbackResponse } = chunk.data as {
                fallbackResponse?: string;
              };
              const fallbackText =
                fallbackResponse || defaultGuardrailFallbackResponse;

              // The stream closes after a guardrail violation; keep the
              // fallback as the current message so the normal finish path runs.
              currentMessage = {
                id: currentMessage?.id || currentMessageId || this.generateId(),
                role: 'assistant',
                metadata: currentMessage?.metadata,
                parts: [
                  {
                    type: 'text',
                    text: fallbackText,
                    state: 'done',
                  },
                ],
              } as unknown as TUIMessage;

              if (currentMessageIndex >= 0) {
                this.state.replaceMessage(currentMessageIndex, currentMessage);
              } else {
                this.state.pushMessage(currentMessage);
                currentMessageIndex = this.state.messages.length - 1;
              }

              currentMessageId = currentMessage.id;
              response.messageId = currentMessageId;
              currentTextPartId = undefined;
              currentReasoningPartId = undefined;
              break;
            }

            default: {
              // Handle generic data parts (data-*)
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
          Promise.all(pendingToolCalls).then(() => {
            if (response.outcome === 'error') {
              resolve();
              return;
            }

            if (response.outcome === 'abort') {
              this.notifyResponseFinish(response, {
                isAbort: true,
                isDisconnect: false,
                isError: false,
              });
              resolve();
              return;
            }

            response.outcome = isAbort ? 'abort' : 'success';
            if (this.activeResponse === response) {
              this.activeResponse = null;
              this.setStatus({ status: 'ready' });
            }

            this.notifyResponseFinish(response, {
              isAbort,
              isDisconnect,
              isError,
            });

            if (response.outcome === 'success') {
              this.continueResponseIfReady(response).then(resolve);
            } else {
              resolve();
            }
          });
        },
        (error) => {
          if (response.outcome === 'error') {
            resolve();
            return;
          }

          if (response.outcome === 'abort') {
            this.notifyResponseFinish(response, {
              isAbort: true,
              isDisconnect: false,
              isError: false,
            });
            resolve();
            return;
          }

          if (error.name === 'AbortError') {
            isAbort = true;
            response.outcome = 'abort';
            if (this.activeResponse === response) {
              this.activeResponse = null;
              this.setStatus({ status: 'ready' });
            }
          } else {
            isDisconnect = true;
            response.outcome = 'error';
            response.continuationChecked = true;
            if (this.activeResponse === response) {
              this.activeResponse = null;
              this.handleError(error);
            }
          }

          this.notifyResponseFinish(response, {
            isAbort,
            isDisconnect,
            isError,
          });

          resolve();
        }
      );
    });
  }

  private handleError(error: Error): void {
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
