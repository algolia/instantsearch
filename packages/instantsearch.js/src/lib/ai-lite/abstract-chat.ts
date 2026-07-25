/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { isEqual } from '../utils/isEqual';

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
  ProviderMetadata,
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
  isResume: boolean;
  isRetired: boolean;
  requiredToolCallIds: Set<string>;
  resolvedToolCallIds: Set<string>;
  returnedToolCallbacks: Array<Promise<void>>;
  pendingToolCallbacks: number;
  forwardToolOutcomeTo: Map<string, ResponseRecord>;
  pendingToolCallFailures: Map<string, unknown>;
  failToolCall?: (reason: unknown, toolCallId?: string) => void;
  didNotifyFinish: boolean;
  didEvaluateContinuation: boolean;
};

const getToolOutcomeOwnerChain = (
  response: ResponseRecord,
  toolCallId: string
): ResponseRecord[] => {
  const owners: ResponseRecord[] = [];
  const visited = new Set<ResponseRecord>();
  let owner: ResponseRecord | undefined = response;

  while (owner && !visited.has(owner)) {
    owners.push(owner);
    visited.add(owner);
    owner = owner.forwardToolOutcomeTo.get(toolCallId);
  }

  return owners;
};

type ToolResultSubmission<TUIMessage extends UIMessage> = <
  TTool extends keyof InferUIMessageTools<TUIMessage>
>(options: {
  tool: TTool;
  toolCallId: string;
  output: InferUIMessageTools<TUIMessage>[TTool]['output'];
}) => Promise<void>;

/** @internal */
export type ResponseScopedOnToolCallCallback<TUIMessage extends UIMessage> = (
  options: Parameters<ChatOnToolCallCallback<TUIMessage>>[0],
  addToolResult: ToolResultSubmission<TUIMessage>
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
  private latestResponse: ResponseRecord | null = null;
  private responsesByToolCallId = new Map<string, Set<ResponseRecord>>();
  private responseByMessage = new WeakMap<TUIMessage, ResponseRecord>();
  // Once tool ownership is discarded, an identifier-only result cannot prove
  // which response generation submitted it. Scoped submissions remain safe.
  private acceptsIdentifierOnlyToolResults = true;
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
    if (
      this.responsesByToolCallId.size > 0 ||
      this.messages.some((message) =>
        message.parts?.some((part) => 'toolCallId' in part)
      )
    ) {
      this.acceptsIdentifierOnlyToolResults = false;
    }
    this.conversationId = this.generateId();
  }

  get messages(): TUIMessage[] {
    return this.state.messages;
  }

  set messages(messages: TUIMessage[]) {
    const getToolOccurrences = (message: TUIMessage) =>
      message.parts
        .filter(
          (
            part
          ): part is TUIMessage['parts'][number] & { toolCallId: string } =>
            'toolCallId' in part
        )
        .map((part) => ({
          type: part.type,
          toolCallId: part.toolCallId,
          state: 'state' in part ? part.state : undefined,
          input: 'input' in part ? part.input : undefined,
          output: 'output' in part ? part.output : undefined,
          errorText: 'errorText' in part ? part.errorText : undefined,
          providerExecuted:
            'providerExecuted' in part ? part.providerExecuted : undefined,
        }));
    const isEquivalentRehydration = (message: TUIMessage): boolean => {
      const replacements = messages.filter(
        (candidate) => candidate.id === message.id
      );
      if (replacements.length !== 1) return false;

      const toolOccurrences = getToolOccurrences(message);
      const replacementToolOccurrences = getToolOccurrences(replacements[0]);
      return toolOccurrences.length > 0 || replacementToolOccurrences.length > 0
        ? isEqual(toolOccurrences, replacementToolOccurrences)
        : isEqual(message.parts, replacements[0].parts);
    };
    const detachedResponses = new Set<ResponseRecord>();
    this.state.messages.forEach((message) => {
      if (!messages.includes(message)) {
        const response = this.responseByMessage.get(message);
        if (response && !isEquivalentRehydration(message)) {
          detachedResponses.add(response);
        }
      }
    });
    const removedToolOwner = this.state.messages.some(
      (message) =>
        message.parts?.some((part) => 'toolCallId' in part) &&
        !messages.includes(message) &&
        !isEquivalentRehydration(message)
    );
    const toolCallIds = new Set<string>();
    const hasDuplicateToolCallId = messages.some(
      (message) =>
        message.parts?.some((part) => {
          if (!('toolCallId' in part)) {
            return false;
          }
          if (toolCallIds.has(part.toolCallId)) {
            return true;
          }
          toolCallIds.add(part.toolCallId);
          return false;
        }) === true
    );
    if (removedToolOwner || hasDuplicateToolCallId) {
      this.acceptsIdentifierOnlyToolResults = false;
    }
    this.state.messages = messages;
    const retainedMessageIds = new Set(messages.map((message) => message.id));
    const responses = new Set<ResponseRecord>();
    this.responsesByToolCallId.forEach((owners) => {
      owners.forEach((response) => responses.add(response));
    });
    if (this.activeResponse) {
      responses.add(this.activeResponse);
    }
    detachedResponses.forEach((response) => {
      responses.add(response);
      this.retireResponse(response);
    });
    responses.forEach((response) => {
      const message = response.messageId
        ? messages.find((candidate) => candidate.id === response.messageId)
        : undefined;
      if (message && !response.isRetired && !detachedResponses.has(response)) {
        this.responseByMessage.set(message, response);
      }
    });
    responses.forEach((response) => {
      if (
        detachedResponses.has(response) ||
        (response.messageId && !retainedMessageIds.has(response.messageId))
      ) {
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

      return this.consume(
        () =>
          this.transport!.reconnectToStream({
            chatId: this.id,
            ...options,
          }),
        { isResume: true }
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

  private replaceMessage(
    index: number,
    message: TUIMessage,
    response?: ResponseRecord
  ): TUIMessage {
    this.state.replaceMessage(index, message);
    const canonicalMessage = this.messages[index] ?? message;
    if (response && this.messages.includes(canonicalMessage)) {
      this.responseByMessage.set(canonicalMessage, response);
    }
    return canonicalMessage;
  }

  private completeReasoningParts(
    response: ResponseRecord
  ): TUIMessage | undefined {
    const messageIndex = this.messages.findIndex(
      (message) => this.responseByMessage.get(message) === response
    );
    if (messageIndex === -1) return undefined;

    const message = this.messages[messageIndex];
    if (
      !message.parts.some(
        (part) => part.type === 'reasoning' && part.state === 'streaming'
      )
    ) {
      return message;
    }

    return this.replaceMessage(
      messageIndex,
      {
        ...message,
        parts: message.parts.map((part) =>
          part.type === 'reasoning' && part.state === 'streaming'
            ? { ...part, state: 'done' as const }
            : part
        ),
      } as TUIMessage,
      response
    );
  }

  private commit(
    toolCallId: string,
    output: unknown,
    messageId?: string,
    response?: ResponseRecord,
    expectedMessage?: TUIMessage
  ): boolean {
    const isTargetPart = (part: TUIMessage['parts'][number]): boolean =>
      'toolCallId' in part && part.toolCallId === toolCallId;
    const messageIndex = this.messages.findIndex(
      (message) =>
        (!messageId || message.id === messageId) &&
        (!expectedMessage || message === expectedMessage) &&
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

    const updatedMessage = {
      ...message,
      parts: updatedParts,
    } as TUIMessage;
    this.replaceMessage(messageIndex, updatedMessage, response);
    return true;
  }

  private continueResponse(response?: ResponseRecord): Promise<void> {
    if (response) {
      this.pruneDetachedResponse(response);
      if (
        response.isRetired ||
        response.outcome !== 'succeeded' ||
        response.requiredToolCallIds.size === 0 ||
        Array.from(response.requiredToolCallIds).some(
          (toolCallId) => !response.resolvedToolCallIds.has(toolCallId)
        ) ||
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
          this.handleError(error as Error, {
            updateState: this.latestResponse === response,
          });
          return;
        }
        this.handleError(error as Error);
      });
  }

  private retireResponse(response: ResponseRecord): void {
    if (response.isRetired) return;

    response.isRetired = true;
    response.didEvaluateContinuation = true;
    if (this.activeResponse === response) {
      this.completeReasoningParts(response);
      response.outcome = 'aborted';
      this.activeResponse = null;
      response.abortController.abort();
      this.setStatus({ status: 'ready' });
    }
  }

  private pruneDetachedResponse(response: ResponseRecord): void {
    if (!response.isRetired) {
      if (
        !response.messageId ||
        this.messages.some((message) => message.id === response.messageId)
      ) {
        return;
      }

      this.retireResponse(response);
    }

    // Keep a routing tombstone while a callback is running so public
    // addToolResult calls settle directly instead of entering the executor.
    if (response.pendingToolCallbacks > 0) return;

    this.responsesByToolCallId.forEach((owners, toolCallId) => {
      owners.delete(response);
      if (owners.size === 0) {
        this.responsesByToolCallId.delete(toolCallId);
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
    },
    messageId = response?.messageId,
    expectedMessage = messageId
      ? this.messages.find((message) => message.id === messageId)
      : undefined
  ): Promise<void> {
    if (response?.isRetired) return Promise.resolve();

    const commitResult = (): Promise<void> => {
      if (
        !this.commit(toolCallId, output, messageId, response, expectedMessage)
      ) {
        return Promise.resolve();
      }

      if (!response) {
        return this.continueResponse();
      }
      const forwardedResponse = response.forwardToolOutcomeTo.get(toolCallId);
      const resultOwners = forwardedResponse
        ? [response, forwardedResponse]
        : [response];
      resultOwners.forEach((owner) => {
        if (owner.requiredToolCallIds.has(toolCallId)) {
          owner.resolvedToolCallIds.add(toolCallId);
        }
      });
      return Promise.all(
        resultOwners.map((owner) => this.continueResponse(owner))
      ).then(() => undefined);
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
    if (!this.acceptsIdentifierOnlyToolResults) {
      return Promise.resolve();
    }

    const owners = this.responsesByToolCallId.get(options.toolCallId);
    const response =
      owners?.size === 1 ? owners.values().next().value : undefined;
    if (response) return this.submitToolResult(response, options);

    const findMatchingMessage = (): TUIMessage | undefined => {
      const matchingMessages = this.messages.filter((message) =>
        message.parts?.some(
          (part) =>
            'toolCallId' in part && part.toolCallId === options.toolCallId
        )
      );
      return matchingMessages.length === 1 ? matchingMessages[0] : undefined;
    };
    if (!findMatchingMessage()) return Promise.resolve();

    return this.jobExecutor.run(() => {
      if (!this.acceptsIdentifierOnlyToolResults) return Promise.resolve();

      const message = findMatchingMessage();
      if (
        !message ||
        !this.commit(
          options.toolCallId,
          options.output,
          message.id,
          undefined,
          message
        )
      ) {
        return Promise.resolve();
      }
      return this.continueResponse();
    });
  };

  /** @internal */
  '~addToolResultForMessage' = <
    TTool extends keyof InferUIMessageTools<TUIMessage>
  >(
    message: TUIMessage,
    options: {
      tool: TTool;
      toolCallId: string;
      output: InferUIMessageTools<TUIMessage>[TTool]['output'];
    }
  ): Promise<void> => {
    const hasToolCall = (candidate: TUIMessage): boolean =>
      candidate.parts?.some(
        (part) => 'toolCallId' in part && part.toolCallId === options.toolCallId
      ) === true;
    if (!hasToolCall(message)) {
      return Promise.resolve();
    }

    const response = this.responseByMessage.get(message);
    const currentMessage = this.messages.includes(message)
      ? message
      : response && !response.isRetired
      ? this.messages.find(
          (candidate) =>
            candidate.id === message.id &&
            this.responseByMessage.get(candidate) === response &&
            hasToolCall(candidate)
        )
      : undefined;
    if (!currentMessage) return Promise.resolve();

    return this.submitToolResult(
      response,
      options,
      currentMessage.id,
      currentMessage
    );
  };

  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop = (): Promise<void> => {
    if (this.activeResponse) {
      const response = this.activeResponse;
      this.completeReasoningParts(response);
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
    ) => Promise<ReadableStream<InferUIMessageChunk<TUIMessage>> | null>,
    { isResume = false }: { isResume?: boolean } = {}
  ): Promise<void> {
    if (this.activeResponse) {
      this.completeReasoningParts(this.activeResponse);
      this.activeResponse.outcome = 'aborted';
      this.activeResponse.abortController.abort();
    }
    const response: ResponseRecord = {
      abortController: new AbortController(),
      outcome: 'active',
      isResume,
      isRetired: false,
      requiredToolCallIds: new Set(),
      resolvedToolCallIds: new Set(),
      returnedToolCallbacks: [],
      pendingToolCallbacks: 0,
      forwardToolOutcomeTo: new Map(),
      pendingToolCallFailures: new Map(),
      didNotifyFinish: false,
      didEvaluateContinuation: false,
    };
    this.activeResponse = response;
    this.latestResponse = response;
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
    const replayedToolOriginalRawInputByCallId = new Map<string, string>();
    const replayedToolOriginalRawOutputByCallId = new Map<string, string>();
    const streamPartIndexById = new Map<string, number>();
    // A resumed stream replays buffered content in order. The persisted parts
    // do not all retain stream ids, so reuse the saved part sequence while the
    // replay catches up without duplicating the message.
    const reusablePartIndexes: number[] = [];
    const replayByPartKey = new Map<
      string,
      {
        type: 'text' | 'reasoning';
        originalPartIndex: number;
        originalText: string;
        replayedText: string;
        providerMetadata?: ProviderMetadata;
        replayPartIndex?: number;
      }
    >();
    const terminalContentMessageIds = new Set<string>();
    const streamPartKey = (type: 'text' | 'reasoning', id: string): string =>
      `${type}:${id}`;
    const invalidateStreamParts = (): void => {
      streamPartIndexById.clear();
      reusablePartIndexes.length = 0;
      replayByPartKey.clear();
      replayedToolOriginalRawInputByCallId.clear();
      replayedToolOriginalRawOutputByCallId.clear();
    };
    const consumeReusablePartsThrough = (partIndex: number): void => {
      const reusableIndex = reusablePartIndexes.indexOf(partIndex);
      if (reusableIndex >= 0) {
        reusablePartIndexes.splice(0, reusableIndex + 1);
      }
    };
    const claimNextReusablePart = (
      predicate: (part: TUIMessage['parts'][number]) => boolean
    ): number | undefined => {
      if (!response.isResume || !currentMessage) return undefined;

      const partIndex = reusablePartIndexes[0];
      if (
        partIndex === undefined ||
        !predicate(currentMessage.parts[partIndex])
      ) {
        return undefined;
      }

      reusablePartIndexes.shift();
      return partIndex;
    };
    const claimReusablePartByIdentity = (
      predicate: (part: TUIMessage['parts'][number]) => boolean
    ): number | undefined => {
      if (!response.isResume || !currentMessage) return undefined;

      const reusableIndex = reusablePartIndexes.findIndex((partIndex) =>
        predicate(currentMessage!.parts[partIndex])
      );
      if (reusableIndex < 0) return undefined;

      const partIndex = reusablePartIndexes[reusableIndex];
      reusablePartIndexes.splice(0, reusableIndex + 1);
      return partIndex;
    };
    const claimUnfinishedPart = (
      type: 'text' | 'reasoning',
      partKey: string
    ): number | undefined => {
      const partIndexes = currentMessage?.parts.flatMap((part, index) =>
        part.type === type && part.state === 'streaming' ? [index] : []
      );
      if (partIndexes?.length !== 1) return undefined;

      consumeReusablePartsThrough(partIndexes[0]);
      streamPartIndexById.set(partKey, partIndexes[0]);
      return partIndexes[0];
    };

    const findToolPart = (toolCallId: string): number =>
      currentMessage!.parts.findIndex(
        (part) => 'toolCallId' in part && part.toolCallId === toolCallId
      );
    const setPart = (index: number, part: any): void => {
      const parts = [...currentMessage!.parts];
      parts[index < 0 ? parts.length : index] = part;
      currentMessage = { ...currentMessage!, parts } as TUIMessage;
      currentMessage = this.replaceMessage(
        currentMessageIndex,
        currentMessage,
        response
      );
    };
    const insertPart = (index: number, part: any): void => {
      const parts = [...currentMessage!.parts];
      parts.splice(index, 0, part);

      reusablePartIndexes.forEach((partIndex, reusableIndex) => {
        if (partIndex >= index) {
          reusablePartIndexes[reusableIndex] = partIndex + 1;
        }
      });
      streamPartIndexById.forEach((partIndex, partKey) => {
        if (partIndex >= index) {
          streamPartIndexById.set(partKey, partIndex + 1);
        }
      });
      replayByPartKey.forEach((replay) => {
        if (replay.originalPartIndex >= index) {
          replay.originalPartIndex++;
        }
        if (
          replay.replayPartIndex !== undefined &&
          replay.replayPartIndex >= index
        ) {
          replay.replayPartIndex++;
        }
      });

      currentMessage = { ...currentMessage!, parts } as TUIMessage;
      currentMessage = this.replaceMessage(
        currentMessageIndex,
        currentMessage,
        response
      );
    };
    const updateReplayPart = (
      partKey: string,
      state: 'streaming' | 'done'
    ): void => {
      const replay = replayByPartKey.get(partKey);
      if (!replay || !currentMessage) return;

      const originalPart = currentMessage.parts[replay.originalPartIndex];
      if (originalPart?.type !== replay.type) return;

      if (
        replay.replayedText.length < replay.originalText.length &&
        replay.originalText.startsWith(replay.replayedText)
      ) {
        if (state === 'done') {
          setPart(replay.originalPartIndex, {
            ...originalPart,
            state,
            providerMetadata:
              replay.providerMetadata ?? originalPart.providerMetadata,
          });
        }
        return;
      }

      if (replay.replayedText.startsWith(replay.originalText)) {
        setPart(replay.originalPartIndex, {
          ...originalPart,
          text: replay.replayedText,
          state,
          providerMetadata:
            replay.providerMetadata ?? originalPart.providerMetadata,
        });
        streamPartIndexById.set(partKey, replay.originalPartIndex);
        return;
      }

      // Divergent content cannot safely replace a persisted part without a
      // durable stream id. Preserve it and render the new replay separately.
      if (replay.replayPartIndex === undefined) {
        const replayPartIndex =
          reusablePartIndexes[0] ?? currentMessage.parts.length;
        insertPart(replayPartIndex, {
          type: replay.type,
          text: replay.replayedText,
          state,
          providerMetadata: replay.providerMetadata,
        });
        replay.replayPartIndex = replayPartIndex;
      } else {
        setPart(replay.replayPartIndex, {
          type: replay.type,
          text: replay.replayedText,
          state,
          providerMetadata: replay.providerMetadata,
        });
      }
      streamPartIndexById.set(partKey, replay.replayPartIndex);
    };
    const completeReplays = (): void => {
      const messageIndex = this.messages.findIndex(
        (message) =>
          message.id === response.messageId &&
          this.responseByMessage.get(message) === response
      );
      if (response.isRetired || messageIndex === -1) {
        replayByPartKey.clear();
        return;
      }
      currentMessageIndex = messageIndex;
      currentMessage = this.messages[messageIndex];

      replayByPartKey.forEach((_replay, partKey) => {
        updateReplayPart(partKey, 'done');
      });
      replayByPartKey.clear();
    };
    const mergeCallProviderMetadata = (
      toolCallId: string,
      metadata?: ProviderMetadata
    ): void => {
      const toolIndex = findToolPart(toolCallId);
      if (toolIndex < 0) return;

      const existingPart = currentMessage!.parts[toolIndex] as any;
      setPart(toolIndex, {
        ...existingPart,
        callProviderMetadata: metadata ?? existingPart.callProviderMetadata,
      });
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
      message,
      allowRetired = false,
    }: {
      isAbort: boolean;
      isDisconnect: boolean;
      isError: boolean;
      message?: TUIMessage;
      allowRetired?: boolean;
    }): void => {
      this.pruneDetachedResponse(response);
      if ((response.isRetired && !allowRetired) || response.didNotifyFinish) {
        return;
      }
      response.didNotifyFinish = true;

      const canonicalMessage = message ?? getCanonicalMessage();
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
    const failToolCall = (reason: unknown, toolCallId?: string): void => {
      if (response.isRetired) return;

      if (response.outcome === 'aborted') return;

      if (response.outcome === 'failed') {
        const forwardedResponse = toolCallId
          ? response.forwardToolOutcomeTo.get(toolCallId)
          : undefined;
        if (forwardedResponse) {
          forwardedResponse.failToolCall?.(reason, toolCallId);
        } else if (
          toolCallId &&
          response.requiredToolCallIds.has(toolCallId) &&
          !response.resolvedToolCallIds.has(toolCallId)
        ) {
          response.pendingToolCallFailures.set(toolCallId, reason);
        }
        return;
      }
      completeReplays();
      const message =
        this.completeReasoningParts(response) ?? getCanonicalMessage();
      const wasRetired = response.isRetired;
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      response.outcome = 'failed';
      response.abortController.abort();

      if (this.activeResponse === response) {
        this.activeResponse = null;
      }
      this.handleError(error, {
        updateState: this.latestResponse === response,
      });
      notifyFinish({
        isAbort: false,
        isDisconnect: false,
        isError: true,
        message,
        allowRetired: !wasRetired,
      });
    };
    response.failToolCall = failToolCall;
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

        completeReplays();
        isAbort ||=
          response.outcome === 'aborted' ||
          (!!error && error.name === 'AbortError');
        this.completeReasoningParts(response);
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
            this.responseByMessage.set(currentMessage, response);
          }

          if (
            currentMessage &&
            terminalContentMessageIds.has(currentMessage.id) &&
            chunk.type !== 'message-metadata' &&
            chunk.type !== 'error' &&
            chunk.type !== 'abort' &&
            chunk.type !== 'finish'
          ) {
            return;
          }

          switch (chunk.type) {
            case 'start': {
              invalidateStreamParts();
              currentMessageId = chunk.messageId || this.generateId();
              response.messageId = currentMessageId;

              // Check if we're continuing an existing message or creating a new one
              const lastMessage = this.lastMessage;
              if (
                lastMessage &&
                lastMessage.role === 'assistant' &&
                lastMessage.id === currentMessageId
              ) {
                currentMessage = {
                  ...lastMessage,
                  parts: [...lastMessage.parts],
                } as TUIMessage;
                currentMessageIndex = this.messages.length - 1;
                currentMessage = this.replaceMessage(
                  currentMessageIndex,
                  currentMessage,
                  response
                );
                if (response.isResume) {
                  const pendingToolFailures: Array<{
                    reason: unknown;
                    toolCallId: string;
                  }> = [];
                  currentMessage.parts.forEach((part, index) => {
                    reusablePartIndexes.push(index);
                    if ('toolCallId' in part) {
                      const dispatchOwners = Array.from(
                        this.responsesByToolCallId.get(part.toolCallId) ?? []
                      ).filter(
                        (owner) =>
                          owner !== response &&
                          !owner.isRetired &&
                          owner.messageId === currentMessage!.id &&
                          owner.requiredToolCallIds.has(part.toolCallId)
                      );
                      if (
                        'rawInput' in part &&
                        typeof part.rawInput === 'string'
                      ) {
                        replayedToolOriginalRawInputByCallId.set(
                          part.toolCallId,
                          part.rawInput
                        );
                      }
                      if (
                        'rawOutput' in part &&
                        typeof part.rawOutput === 'string'
                      ) {
                        replayedToolOriginalRawOutputByCallId.set(
                          part.toolCallId,
                          part.rawOutput
                        );
                      }
                      if (
                        (!('providerExecuted' in part) ||
                          !part.providerExecuted) &&
                        dispatchOwners.length === 1
                      ) {
                        const ownerChain = getToolOutcomeOwnerChain(
                          dispatchOwners[0],
                          part.toolCallId
                        ).filter(
                          (owner) =>
                            !owner.isRetired &&
                            owner.messageId === currentMessage!.id &&
                            owner.requiredToolCallIds.has(part.toolCallId)
                        );
                        response.requiredToolCallIds.add(part.toolCallId);
                        if (
                          ownerChain.some((owner) =>
                            owner.resolvedToolCallIds.has(part.toolCallId)
                          )
                        ) {
                          response.resolvedToolCallIds.add(part.toolCallId);
                        }
                        ownerChain.forEach((owner) => {
                          owner.forwardToolOutcomeTo.set(
                            part.toolCallId,
                            response
                          );
                          owner.didEvaluateContinuation = true;
                          if (
                            owner.pendingToolCallFailures.has(part.toolCallId)
                          ) {
                            const pendingFailure =
                              owner.pendingToolCallFailures.get(
                                part.toolCallId
                              );
                            owner.pendingToolCallFailures.delete(
                              part.toolCallId
                            );
                            pendingToolFailures.push({
                              reason: pendingFailure,
                              toolCallId: part.toolCallId,
                            });
                          }
                        });
                      }
                    }
                  });
                  pendingToolFailures.forEach(({ reason, toolCallId }) => {
                    failToolCall(reason, toolCallId);
                  });
                }
              } else {
                currentMessage = {
                  id: currentMessageId,
                  role: 'assistant',
                  parts: [],
                  metadata: chunk.messageMetadata,
                } as unknown as TUIMessage;
                this.state.pushMessage(currentMessage);
                currentMessageIndex = this.messages.length - 1;
                this.responseByMessage.set(currentMessage, response);
              }
              break;
            }

            case 'text-start':
            case 'reasoning-start': {
              if (
                !currentMessage ||
                terminalContentMessageIds.has(currentMessage.id)
              ) {
                break;
              }
              const type = chunk.type === 'text-start' ? 'text' : 'reasoning';
              const partKey = streamPartKey(type, chunk.id);
              const reusablePartIndex = claimNextReusablePart(
                (part) => part.type === type
              );
              const reusablePart =
                reusablePartIndex === undefined
                  ? undefined
                  : currentMessage.parts[reusablePartIndex];
              if (
                reusablePartIndex !== undefined &&
                reusablePart?.type === type
              ) {
                replayByPartKey.set(partKey, {
                  type,
                  originalPartIndex: reusablePartIndex,
                  originalText: reusablePart.text,
                  replayedText: '',
                  providerMetadata: chunk.providerMetadata,
                });
                setPart(reusablePartIndex, {
                  ...reusablePart,
                  state: 'streaming',
                  providerMetadata:
                    chunk.providerMetadata ?? reusablePart.providerMetadata,
                });
                break;
              }

              const partIndex = currentMessage.parts.length;
              setPart(-1, {
                type,
                text: '',
                state: 'streaming' as const,
                providerMetadata: chunk.providerMetadata,
              });
              streamPartIndexById.set(partKey, partIndex);
              break;
            }

            case 'text-delta':
            case 'reasoning-delta': {
              const type = chunk.type === 'text-delta' ? 'text' : 'reasoning';
              if (
                !currentMessage ||
                terminalContentMessageIds.has(currentMessage.id)
              ) {
                break;
              }

              const partKey = streamPartKey(type, chunk.id);
              const replay = replayByPartKey.get(partKey);
              if (replay) {
                replay.replayedText += chunk.delta;
                updateReplayPart(partKey, 'streaming');
                break;
              }

              const partIndex =
                streamPartIndexById.get(partKey) ??
                (response.isResume
                  ? claimUnfinishedPart(type, partKey)
                  : undefined);
              if (partIndex === undefined) break;

              const part = currentMessage.parts[partIndex] as
                | {
                    type: 'text' | 'reasoning';
                    text: string;
                    state?: 'streaming' | 'done';
                  }
                | undefined;
              if (!part || part.type !== type || part.state !== 'streaming') {
                streamPartIndexById.delete(partKey);
                break;
              }

              setPart(partIndex, { ...part, text: part.text + chunk.delta });
              break;
            }

            case 'text-end':
            case 'reasoning-end': {
              if (
                !currentMessage ||
                terminalContentMessageIds.has(currentMessage.id)
              ) {
                break;
              }
              const type = chunk.type === 'text-end' ? 'text' : 'reasoning';

              const partKey = streamPartKey(type, chunk.id);
              if (replayByPartKey.has(partKey)) {
                updateReplayPart(partKey, 'done');
                replayByPartKey.delete(partKey);
                streamPartIndexById.delete(partKey);
                break;
              }

              const partIndex =
                streamPartIndexById.get(partKey) ??
                (response.isResume
                  ? claimUnfinishedPart(type, partKey)
                  : undefined);
              if (partIndex === undefined) break;

              const part = currentMessage.parts[partIndex];
              if (!part || part.type !== type || part.state !== 'streaming') {
                streamPartIndexById.delete(partKey);
                break;
              }

              setPart(partIndex, {
                ...part,
                state: 'done',
              });
              streamPartIndexById.delete(partKey);
              break;
            }

            case 'tool-input-start': {
              if (!currentMessage) break;

              const existingIndex = findToolPart(chunk.toolCallId);
              if (existingIndex >= 0) {
                consumeReusablePartsThrough(existingIndex);
              }
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

              const initialRawInput =
                typeof chunk.input === 'string'
                  ? chunk.input
                  : chunk.input !== undefined
                  ? JSON.stringify(chunk.input)
                  : '';

              toolRawInputByCallId[chunk.toolCallId] = initialRawInput;
              const toolPart = {
                ...(response.isResume ? existingPart : null),
                type: `tool-${chunk.toolName}` as const,
                toolCallId: chunk.toolCallId,
                state:
                  response.isResume && existingPart?.state === 'input-available'
                    ? ('input-available' as const)
                    : ('input-streaming' as const),
                input:
                  response.isResume && existingPart
                    ? existingPart.input
                    : chunk.input,
                rawInput:
                  response.isResume && existingPart?.rawInput !== undefined
                    ? existingPart.rawInput
                    : initialRawInput || undefined,
                providerExecuted:
                  chunk.providerExecuted ??
                  (response.isResume
                    ? existingPart?.providerExecuted
                    : undefined),
              };

              setPart(existingIndex, toolPart);
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
                toolRawInputByCallId[chunk.toolCallId] ??
                existingPart?.rawInput ??
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

              const originalRawInput = replayedToolOriginalRawInputByCallId.get(
                chunk.toolCallId
              );
              if (
                originalRawInput !== undefined &&
                nextRawInput.length < originalRawInput.length &&
                originalRawInput.startsWith(nextRawInput)
              ) {
                break;
              }
              replayedToolOriginalRawInputByCallId.delete(chunk.toolCallId);
              setPart(toolIndex, nextToolPart);
              break;
            }

            case 'tool-input-available': {
              if (!currentMessage) break;

              delete toolRawInputByCallId[chunk.toolCallId];
              replayedToolOriginalRawInputByCallId.delete(chunk.toolCallId);

              // Find existing tool part or create new one
              const existingIndex = findToolPart(chunk.toolCallId);
              if (existingIndex >= 0) {
                consumeReusablePartsThrough(existingIndex);
              }
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

              if (response.requiredToolCallIds.has(chunk.toolCallId)) break;

              if (
                this.messages.some(
                  (message) =>
                    message !== currentMessage &&
                    message.parts?.some(
                      (part) =>
                        'toolCallId' in part &&
                        part.toolCallId === chunk.toolCallId
                    )
                )
              ) {
                this.acceptsIdentifierOnlyToolResults = false;
              }

              // Trigger onToolCall callback only for client-executed tools
              // (server-executed tools have providerExecuted: true and don't need client handling)
              if (this.onToolCall && !chunk.providerExecuted) {
                const owners =
                  this.responsesByToolCallId.get(chunk.toolCallId) ??
                  new Set<ResponseRecord>();
                const existingOwners = Array.from(owners).filter(
                  (owner) => owner !== response
                );
                if (existingOwners.length > 0) {
                  this.acceptsIdentifierOnlyToolResults = false;
                  const conflictingOwner = existingOwners.find(
                    (owner) =>
                      !owner.isRetired &&
                      (owner.outcome === 'active' ||
                        (owner.outcome === 'succeeded' &&
                          (!owner.resolvedToolCallIds.has(chunk.toolCallId) ||
                            owner.pendingToolCallbacks > 0)))
                  );
                  if (conflictingOwner) {
                    // Neither response may continue once ownership is ambiguous.
                    conflictingOwner.didEvaluateContinuation = true;
                    failToolCall(
                      new Error(
                        `Tool call "${chunk.toolCallId}" is already owned by another response.`
                      )
                    );
                    break;
                  }
                }
                response.requiredToolCallIds.add(chunk.toolCallId);
                owners.add(response);
                this.responsesByToolCallId.set(chunk.toolCallId, owners);
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
                    (options) =>
                      response.isRetired
                        ? Promise.resolve()
                        : this.submitToolResult(response, options)
                  );
                  if (result) {
                    response.returnedToolCallbacks.push(
                      Promise.resolve(result)
                        .catch((error) => failToolCall(error, chunk.toolCallId))
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
                  failToolCall(error, chunk.toolCallId);
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
              const previousRawOutput = response.isResume
                ? toolRawOutputByCallId[toolCallId] ?? ''
                : existingPart?.rawOutput ??
                  toolRawOutputByCallId[toolCallId] ??
                  '';
              const nextRawOutput = `${previousRawOutput}${delta}`;
              toolRawOutputByCallId[toolCallId] = nextRawOutput;

              const originalRawOutput =
                replayedToolOriginalRawOutputByCallId.get(toolCallId);
              if (
                originalRawOutput !== undefined &&
                nextRawOutput.length < originalRawOutput.length &&
                originalRawOutput.startsWith(nextRawOutput)
              ) {
                break;
              }
              replayedToolOriginalRawOutputByCallId.delete(toolCallId);

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
              const toolIndex = findToolPart(chunk.toolCallId);

              if (toolIndex >= 0) {
                delete toolRawInputByCallId[chunk.toolCallId];
                delete toolRawOutputByCallId[chunk.toolCallId];
                replayedToolOriginalRawInputByCallId.delete(chunk.toolCallId);
                replayedToolOriginalRawOutputByCallId.delete(chunk.toolCallId);

                const existingPart = currentMessage.parts[toolIndex] as any;
                if (response.resolvedToolCallIds.has(chunk.toolCallId)) {
                  mergeCallProviderMetadata(
                    chunk.toolCallId,
                    chunk.callProviderMetadata
                  );
                  break;
                }

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
              if (response.resolvedToolCallIds.has(chunk.toolCallId)) {
                mergeCallProviderMetadata(
                  chunk.toolCallId,
                  chunk.providerMetadata
                );
                break;
              }
              delete toolRawInputByCallId[chunk.toolCallId];
              delete toolRawOutputByCallId[chunk.toolCallId];
              replayedToolOriginalRawInputByCallId.delete(chunk.toolCallId);
              replayedToolOriginalRawOutputByCallId.delete(chunk.toolCallId);

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
              if (response.resolvedToolCallIds.has(chunk.toolCallId)) {
                mergeCallProviderMetadata(
                  chunk.toolCallId,
                  chunk.providerMetadata
                );
                break;
              }

              const toolIndex = findToolPart(chunk.toolCallId);
              if (toolIndex < 0) break;

              delete toolRawInputByCallId[chunk.toolCallId];
              delete toolRawOutputByCallId[chunk.toolCallId];
              replayedToolOriginalRawInputByCallId.delete(chunk.toolCallId);
              replayedToolOriginalRawOutputByCallId.delete(chunk.toolCallId);

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

              const reusablePartIndex = claimReusablePartByIdentity(
                (part) =>
                  part.type === 'source-url' && part.sourceId === chunk.sourceId
              );
              setPart(reusablePartIndex ?? -1, sourcePart);
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

              const reusablePartIndex = claimReusablePartByIdentity(
                (part) =>
                  part.type === 'source-document' &&
                  part.sourceId === chunk.sourceId
              );
              setPart(reusablePartIndex ?? -1, docPart);
              break;
            }

            case 'file': {
              if (!currentMessage) break;

              const filePart = {
                type: 'file' as const,
                url: chunk.url,
                mediaType: chunk.mediaType,
              };

              const reusablePartIndex = claimNextReusablePart(
                (part) =>
                  part.type === 'file' &&
                  part.url === chunk.url &&
                  part.mediaType === chunk.mediaType
              );
              setPart(reusablePartIndex ?? -1, filePart);
              break;
            }

            case 'start-step': {
              if (!currentMessage) break;

              const reusablePartIndex = claimNextReusablePart(
                (part) => part.type === 'step-start'
              );
              setPart(reusablePartIndex ?? -1, { type: 'step-start' });
              break;
            }

            case 'message-metadata': {
              if (!currentMessage) break;

              currentMessage = {
                ...currentMessage,
                metadata: chunk.messageMetadata,
              } as TUIMessage;
              currentMessage = this.replaceMessage(
                currentMessageIndex,
                currentMessage,
                response
              );
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
                currentMessage = this.replaceMessage(
                  currentMessageIndex,
                  currentMessage,
                  response
                );
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

              invalidateStreamParts();

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
                currentMessage = this.replaceMessage(
                  currentMessageIndex,
                  currentMessage,
                  response
                );
              } else {
                this.state.pushMessage(currentMessage);
                currentMessageIndex = this.messages.length - 1;
                this.responseByMessage.set(currentMessage, response);
              }

              currentMessageId = currentMessage.id;
              terminalContentMessageIds.add(currentMessage.id);
              break;
            }

            default: {
              // Handle generic data parts (data-*)
              const chunkType = (chunk as any).type as string;
              if (chunkType?.startsWith('data-') && currentMessage) {
                const chunkId = (chunk as any).id as string | undefined;
                const dataPart = {
                  type: chunkType,
                  id: chunkId,
                  data: (chunk as any).data,
                };

                const reusablePartIndex =
                  chunkId === undefined
                    ? claimNextReusablePart((part) => part.type === chunkType)
                    : claimReusablePartByIdentity(
                        (part) =>
                          part.type === chunkType &&
                          'id' in part &&
                          part.id === chunkId
                      );
                setPart(reusablePartIndex ?? -1, dataPart);

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

  private handleError(
    error: Error,
    { updateState = true }: { updateState?: boolean } = {}
  ): void {
    if (updateState) {
      this.setStatus({ status: 'error', error });
    }

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
