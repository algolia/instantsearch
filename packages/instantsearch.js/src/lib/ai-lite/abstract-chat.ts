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

type ResponseOutcome = 'active' | 'succeeded' | 'aborted' | 'failed';

type ResponseRecord = {
  abortController: AbortController;
  messageId?: string;
  outcome: ResponseOutcome;
  isRetired: boolean;
  requiredToolCallIds: Set<string>;
  resolvedToolCallIds: Set<string>;
  returnedToolCallbacks: Array<Promise<void>>;
  pendingToolCallbacks: number;
  didNotifyFinish: boolean;
  didEvaluateContinuation: boolean;
};

type ToolResultSubmission<TUIMessage extends UIMessage> = <
  TTool extends keyof InferUIMessageTools<TUIMessage>
>(options: {
  tool: TTool;
  toolCallId: string;
  output: InferUIMessageTools<TUIMessage>[TTool]['output'];
}) => Promise<void>;

type ResponseScopedOnToolCallCallback<TUIMessage extends UIMessage> = (
  options: Parameters<ChatOnToolCallCallback<TUIMessage>>[0],
  addToolResult?: ToolResultSubmission<TUIMessage>
) => ReturnType<ChatOnToolCallCallback<TUIMessage>>;

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
  private onToolCall?: ResponseScopedOnToolCallCallback<TUIMessage>;
  private onFinish?: ChatOnFinishCallback<TUIMessage>;
  private onData?: ChatOnDataCallback<TUIMessage>;
  private sendAutomaticallyWhen?: (options: {
    messages: TUIMessage[];
  }) => boolean | PromiseLike<boolean>;
  private shouldRepairToolInput?: (toolName: string) => boolean;

  private activeResponse: ResponseRecord | null = null;
  private responseByToolCallId = new Map<string, ResponseRecord>();
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
    const retainedMessageIds = new Set(messages.map((message) => message.id));
    const responses = new Set(this.responseByToolCallId.values());
    if (this.activeResponse) {
      responses.add(this.activeResponse);
    }
    responses.forEach((response) => {
      if (response.messageId && !retainedMessageIds.has(response.messageId)) {
        this.pruneDetachedResponse(response);
      }
    });
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
        targetIndex = this.messages.findIndex((m) => m.id === messageId);
      } else {
        // Find the last assistant message
        for (let i = this.messages.length - 1; i >= 0; i--) {
          if (this.messages[i].role === 'assistant') {
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex >= 0) {
        // Remove the assistant message and all messages after it
        this.messages = this.messages.slice(0, targetIndex);
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

      return this.consume(() =>
        this.transport!.reconnectToStream({
          chatId: this.id,
          ...options,
        })
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

  private commit(
    toolCallId: string,
    output: unknown,
    messageId?: string
  ): boolean {
    const isTargetPart = (part: TUIMessage['parts'][number]): boolean =>
      'toolCallId' in part && part.toolCallId === toolCallId;
    const messageIndex = this.messages.findIndex(
      (message) =>
        (!messageId || message.id === messageId) &&
        message.parts.some(isTargetPart)
    );

    if (messageIndex === -1) return false;

    const message = this.messages[messageIndex];
    const partIndex = message.parts.findIndex(isTargetPart);
    const part = message.parts[partIndex];
    if (
      !('state' in part) ||
      (part.state === 'output-available' && !part.preliminary) ||
      part.state === 'output-error'
    ) {
      return false;
    }
    const {
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      preliminary: _ignoredPreliminary,
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      rawOutput: _ignoredRawOutput,
      ...committedPart
    } = part as any;
    const updatedParts = [...message.parts];
    updatedParts[partIndex] = {
      ...committedPart,
      state: 'output-available' as const,
      output,
    };

    this.state.replaceMessage(messageIndex, {
      ...message,
      parts: updatedParts,
    } as TUIMessage);
    return true;
  }

  private continueResponse(response?: ResponseRecord): Promise<void> {
    if (response) {
      this.pruneDetachedResponse(response);
      if (
        response.isRetired ||
        response.outcome !== 'succeeded' ||
        response.requiredToolCallIds.size === 0 ||
        response.resolvedToolCallIds.size !==
          response.requiredToolCallIds.size ||
        !response.didNotifyFinish ||
        response.didEvaluateContinuation
      ) {
        return Promise.resolve();
      }
      response.didEvaluateContinuation = true;
    }

    if (!this.sendAutomaticallyWhen) return Promise.resolve();

    return Promise.resolve()
      .then(() =>
        this.sendAutomaticallyWhen!({
          messages: this.messages,
        })
      )
      .then((shouldSend) => {
        if (response) {
          this.pruneDetachedResponse(response);
          if (response.isRetired) return undefined;
        }
        return shouldSend
          ? this.makeRequest({ trigger: 'submit-message' })
          : undefined;
      })
      .catch((error) => {
        if (response) {
          this.pruneDetachedResponse(response);
          if (response.isRetired) return;
        }
        this.handleError(error as Error);
      });
  }

  private pruneDetachedResponse(response: ResponseRecord): void {
    if (
      !response.messageId ||
      this.messages.some((message) => message.id === response.messageId)
    ) {
      return;
    }

    if (!response.isRetired) {
      response.isRetired = true;
      response.didEvaluateContinuation = true;

      if (this.activeResponse === response) {
        response.outcome = 'aborted';
        this.activeResponse = null;
        response.abortController.abort();
        this.setStatus({ status: 'ready' });
      }
    }

    // Keep a routing tombstone while a callback is running so public
    // addToolResult calls settle directly instead of entering the executor.
    if (response.pendingToolCallbacks > 0) return;

    this.responseByToolCallId.forEach((owner, toolCallId) => {
      if (owner === response) {
        this.responseByToolCallId.delete(toolCallId);
      }
    });
  }

  private submitToolResult<TTool extends keyof InferUIMessageTools<TUIMessage>>(
    response: ResponseRecord | undefined,
    {
      toolCallId,
      output,
    }: {
      tool: TTool;
      toolCallId: string;
      output: InferUIMessageTools<TUIMessage>[TTool]['output'];
    }
  ): Promise<void> {
    const commitResult = (): Promise<void> => {
      if (!this.commit(toolCallId, output, response?.messageId)) {
        return Promise.resolve();
      }

      if (response) {
        response.resolvedToolCallIds.add(toolCallId);
      }
      return this.continueResponse(response);
    };

    if (
      response &&
      (this.activeResponse === response ||
        response.outcome !== 'succeeded' ||
        response.didEvaluateContinuation)
    ) {
      return commitResult();
    }

    return this.jobExecutor.run(commitResult);
  }

  /**
   * Add a tool result for a tool call.
   */
  addToolResult: ToolResultSubmission<TUIMessage> = (options) => {
    const response = this.responseByToolCallId.get(options.toolCallId);
    const hasRestoredToolCall = this.messages.some((message) =>
      message.parts.some(
        (part) => 'toolCallId' in part && part.toolCallId === options.toolCallId
      )
    );

    if (!response && !hasRestoredToolCall) return Promise.resolve();

    return this.submitToolResult(response, options);
  };

  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop = (): Promise<void> => {
    if (this.activeResponse) {
      const response = this.activeResponse;
      response.outcome = 'aborted';
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

    return this.consume((abortSignal) =>
      this.transport!.sendMessages({
        chatId: this.id,
        messages: this.messages,
        abortSignal,
        trigger: options.trigger,
        messageId: options.messageId,
        headers: options.headers,
        body: options.body,
        requestMetadata: options.metadata,
      })
    );
  }

  private consume(
    createStream: (
      abortSignal: AbortSignal
    ) => Promise<ReadableStream<InferUIMessageChunk<TUIMessage>> | null>
  ): Promise<void> {
    if (this.activeResponse) {
      this.activeResponse.outcome = 'aborted';
      this.activeResponse.abortController.abort();
    }
    const response: ResponseRecord = {
      abortController: new AbortController(),
      outcome: 'active',
      isRetired: false,
      requiredToolCallIds: new Set(),
      resolvedToolCallIds: new Set(),
      returnedToolCallbacks: [],
      pendingToolCallbacks: 0,
      didNotifyFinish: false,
      didEvaluateContinuation: false,
    };
    this.activeResponse = response;
    this.setStatus({ status: 'submitted' });

    return createStream(response.abortController.signal).then(
      (stream) => {
        if (this.activeResponse === response) {
          if (stream) return this.processStream(stream, response);
          response.outcome = 'succeeded';
          this.activeResponse = null;
          this.setStatus({ status: 'ready' });
        }
        return undefined;
      },
      (error) => {
        if (this.activeResponse !== response) return;
        this.activeResponse = null;
        if ((error as Error).name === 'AbortError') {
          response.outcome = 'aborted';
          this.setStatus({ status: 'ready' });
        } else {
          response.outcome = 'failed';
          this.handleError(error as Error);
        }
      }
    );
  }

  private processStream(
    stream: ReadableStream<InferUIMessageChunk<TUIMessage>>,
    response: ResponseRecord
  ): Promise<void> {
    this.setStatus({ status: 'streaming' });

    let currentMessageId: string | undefined;
    let currentMessage: TUIMessage | undefined;
    let currentMessageIndex = -1;
    let isAbort = false;
    let isError = false;

    const toolRawInputByCallId: Record<string, string> = {};
    const toolRawOutputByCallId: Record<string, string> = {};

    const findToolPart = (toolCallId: string): number =>
      currentMessage!.parts.findIndex(
        (part) => 'toolCallId' in part && part.toolCallId === toolCallId
      );
    const setPart = (index: number, part: any): void => {
      const parts = [...currentMessage!.parts];
      parts[index < 0 ? parts.length : index] = part;
      currentMessage = { ...currentMessage!, parts } as TUIMessage;
      this.state.replaceMessage(currentMessageIndex, currentMessage);
    };
    const getCanonicalMessage = (): TUIMessage | undefined =>
      response.messageId
        ? this.messages.find((message) => message.id === response.messageId) ??
          currentMessage
        : currentMessage;
    const notifyFinish = ({
      isAbort,
      isDisconnect,
      isError,
    }: {
      isAbort: boolean;
      isDisconnect: boolean;
      isError: boolean;
    }): void => {
      this.pruneDetachedResponse(response);
      if (response.isRetired || response.didNotifyFinish) return;
      response.didNotifyFinish = true;

      const canonicalMessage = getCanonicalMessage();
      if (this.onFinish && canonicalMessage) {
        this.onFinish({
          message: canonicalMessage,
          messages: this.messages,
          isAbort,
          isDisconnect,
          isError,
        });
      }
    };
    const failToolCall = (reason: unknown): void => {
      if (response.outcome !== 'active') return;
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      response.outcome = 'failed';
      response.abortController.abort();

      if (this.activeResponse === response) {
        this.activeResponse = null;
        this.handleError(error);
      }
      notifyFinish({
        isAbort: false,
        isDisconnect: false,
        isError: true,
      });
    };
    const acceptServerToolResult = (toolCallId: string): void => {
      if (response.requiredToolCallIds.has(toolCallId)) {
        response.resolvedToolCallIds.add(toolCallId);
      }
    };

    return new Promise((resolve) => {
      const finish = (error?: Error): void => {
        if (response.outcome === 'failed') {
          resolve();
          return;
        }

        isAbort ||=
          response.outcome === 'aborted' ||
          (!!error && error.name === 'AbortError');
        response.outcome = isAbort ? 'aborted' : error ? 'failed' : 'succeeded';
        if (this.activeResponse === response) {
          this.activeResponse = null;
          if (error && !isAbort) {
            this.handleError(error);
          } else {
            this.setStatus({ status: 'ready' });
          }
        }

        notifyFinish({
          isAbort,
          isDisconnect: !!error && !isAbort,
          isError,
        });
        resolve(isAbort || error ? undefined : this.continueResponse(response));
      };

      processStream<UIMessageChunk>(
        stream as ReadableStream<UIMessageChunk>,
        // eslint-disable-next-line complexity
        (chunk) => {
          if (this.activeResponse !== response || response.isRetired) return;

          if (currentMessageId) {
            const canonicalMessageIndex = this.messages.findIndex(
              (message) => message.id === currentMessageId
            );
            if (canonicalMessageIndex === -1) {
              this.pruneDetachedResponse(response);
              return;
            }
            currentMessageIndex = canonicalMessageIndex;
            currentMessage = this.messages[canonicalMessageIndex];
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
                currentMessageIndex = this.messages.length - 1;
              } else {
                currentMessage = {
                  id: currentMessageId,
                  role: 'assistant',
                  parts: [],
                  metadata: chunk.messageMetadata,
                } as unknown as TUIMessage;
                this.state.pushMessage(currentMessage);
                currentMessageIndex = this.messages.length - 1;
              }
              break;
            }

            case 'text-start':
            case 'reasoning-start': {
              if (!currentMessage) break;
              const type = chunk.type === 'text-start' ? 'text' : 'reasoning';
              setPart(-1, {
                type,
                text: '',
                state: 'streaming' as const,
                providerMetadata: chunk.providerMetadata,
              });
              break;
            }

            case 'text-delta':
            case 'reasoning-delta': {
              const type = chunk.type === 'text-delta' ? 'text' : 'reasoning';
              if (!currentMessage) break;

              const partIndex = currentMessage.parts.findIndex(
                (part) => part.type === type && part.state === 'streaming'
              );
              if (partIndex === -1) break;

              const part = currentMessage.parts[partIndex] as {
                type: 'text' | 'reasoning';
                text: string;
                state?: 'streaming' | 'done';
              };
              setPart(partIndex, { ...part, text: part.text + chunk.delta });
              break;
            }

            case 'text-end':
            case 'reasoning-end': {
              if (!currentMessage) break;
              const type = chunk.type === 'text-end' ? 'text' : 'reasoning';

              const partIndex = currentMessage.parts.findIndex(
                (part) => part.type === type && part.state === 'streaming'
              );
              if (partIndex === -1) break;

              setPart(partIndex, {
                ...currentMessage.parts[partIndex],
                state: 'done',
              });
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

              setPart(-1, toolPart);
              break;
            }

            case 'tool-input-delta': {
              if (!currentMessage) break;

              const toolIndex = findToolPart(chunk.toolCallId);

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

              setPart(toolIndex, nextToolPart);
              break;
            }

            case 'tool-input-available': {
              if (!currentMessage) break;

              delete toolRawInputByCallId[chunk.toolCallId];

              // Find existing tool part or create new one
              const existingIndex = findToolPart(chunk.toolCallId);
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

              setPart(existingIndex, toolPart);

              // Trigger onToolCall callback only for client-executed tools
              // (server-executed tools have providerExecuted: true and don't need client handling)
              if (this.onToolCall && !chunk.providerExecuted) {
                const existingOwner = this.responseByToolCallId.get(
                  chunk.toolCallId
                );
                if (existingOwner && existingOwner !== response) {
                  const canTransferOwnership =
                    existingOwner.outcome === 'succeeded' &&
                    existingOwner.resolvedToolCallIds.has(chunk.toolCallId) &&
                    existingOwner.pendingToolCallbacks === 0;
                  if (!canTransferOwnership) {
                    // Neither response may continue once ownership is ambiguous.
                    existingOwner.didEvaluateContinuation = true;
                    failToolCall(
                      new Error(
                        `Tool call "${chunk.toolCallId}" is already owned by another response.`
                      )
                    );
                    break;
                  }
                  existingOwner.didEvaluateContinuation = true;
                }

                response.requiredToolCallIds.add(chunk.toolCallId);
                this.responseByToolCallId.set(chunk.toolCallId, response);
                response.pendingToolCallbacks++;

                try {
                  const result = this.onToolCall(
                    {
                      toolCall: {
                        toolName: chunk.toolName,
                        toolCallId: chunk.toolCallId,
                        input: chunk.input,
                        dynamic: 'dynamic' in chunk ? chunk.dynamic : undefined,
                      } as InferUIMessageToolCall<TUIMessage>,
                    },
                    (options) => this.submitToolResult(response, options)
                  );
                  if (result) {
                    response.returnedToolCallbacks.push(
                      Promise.resolve(result)
                        .catch(failToolCall)
                        .then(() => {
                          response.pendingToolCallbacks--;
                          this.pruneDetachedResponse(response);
                        })
                    );
                  } else {
                    response.pendingToolCallbacks--;
                    this.pruneDetachedResponse(response);
                  }
                } catch (error) {
                  response.pendingToolCallbacks--;
                  failToolCall(error);
                  this.pruneDetachedResponse(response);
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
              if (response.resolvedToolCallIds.has(toolCallId)) break;

              const toolIndex = findToolPart(toolCallId);

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

              setPart(toolIndex, nextToolPart);
              break;
            }

            case 'tool-output-available': {
              if (!currentMessage) break;
              if (response.resolvedToolCallIds.has(chunk.toolCallId)) break;

              const toolIndex = findToolPart(chunk.toolCallId);

              if (toolIndex >= 0) {
                delete toolRawInputByCallId[chunk.toolCallId];
                delete toolRawOutputByCallId[chunk.toolCallId];

                const existingPart = currentMessage.parts[toolIndex] as any;
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                const { rawOutput: _ignored, ...rest } = existingPart;
                setPart(toolIndex, {
                  ...rest,
                  state: 'output-available',
                  output: chunk.output,
                  callProviderMetadata: chunk.callProviderMetadata,
                  preliminary: chunk.preliminary,
                });
                if (!chunk.preliminary) {
                  acceptServerToolResult(chunk.toolCallId);
                }
              }
              break;
            }

            case 'tool-input-error': {
              if (!currentMessage) break;
              if (response.resolvedToolCallIds.has(chunk.toolCallId)) break;
              delete toolRawInputByCallId[chunk.toolCallId];
              delete toolRawOutputByCallId[chunk.toolCallId];

              const toolIndex = findToolPart(chunk.toolCallId);
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

              setPart(toolIndex, nextToolPart);
              acceptServerToolResult(chunk.toolCallId);
              break;
            }

            case 'tool-output-error': {
              if (!currentMessage) break;
              if (response.resolvedToolCallIds.has(chunk.toolCallId)) break;

              const toolIndex = findToolPart(chunk.toolCallId);
              if (toolIndex < 0) break;

              delete toolRawInputByCallId[chunk.toolCallId];
              delete toolRawOutputByCallId[chunk.toolCallId];

              const existingPart = currentMessage.parts[toolIndex] as any;
              const {
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                rawOutput: _ignoredRawOutput,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                preliminary: _ignoredPreliminary,
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                output: _ignoredOutput,
                ...rest
              } = existingPart;
              setPart(toolIndex, {
                ...rest,
                state: 'output-error',
                errorText: chunk.errorText,
                providerExecuted:
                  chunk.providerExecuted ?? rest.providerExecuted,
                callProviderMetadata:
                  chunk.providerMetadata ?? rest.callProviderMetadata,
              });
              acceptServerToolResult(chunk.toolCallId);
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

              setPart(-1, sourcePart);
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

              setPart(-1, docPart);
              break;
            }

            case 'file': {
              if (!currentMessage) break;

              const filePart = {
                type: 'file' as const,
                url: chunk.url,
                mediaType: chunk.mediaType,
              };

              setPart(-1, filePart);
              break;
            }

            case 'start-step': {
              if (!currentMessage) break;

              setPart(-1, { type: 'step-start' });
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
                currentMessageIndex = this.messages.length - 1;
              }

              currentMessageId = currentMessage.id;
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

                setPart(-1, dataPart);

                // Trigger onData callback
                if (this.onData) {
                  this.onData(dataPart as any);
                }
              }
            }
          }
        },
        () => Promise.all(response.returnedToolCallbacks).then(() => finish()),
        (error) => finish(error)
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
