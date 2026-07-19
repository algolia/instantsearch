/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { AbstractChat } from '../abstract-chat';
import { parseJsonEventStream } from '../stream-parser';

import type {
  ChatOnErrorCallback,
  ChatOnFinishCallback,
  ChatState,
  ChatTransport,
  UIMessage,
  UIMessageChunk,
} from '../types';

class InMemoryChatState implements ChatState<UIMessage> {
  status: ChatState<UIMessage>['status'] = 'ready';
  error: Error | undefined = undefined;
  messages: UIMessage[] = [];

  pushMessage = (message: UIMessage): void => {
    this.messages = [...this.messages, message];
  };

  popMessage = (): void => {
    this.messages = this.messages.slice(0, -1);
  };

  replaceMessage = (index: number, message: UIMessage): void => {
    this.messages = [
      ...this.messages.slice(0, index),
      message,
      ...this.messages.slice(index + 1),
    ];
  };

  snapshot = <T>(thing: T): T => thing;
}

class TestChat extends AbstractChat<UIMessage> {}

class ConcurrentTestChat extends TestChat {
  startResponse(stream: ReadableStream<UIMessageChunk>): Promise<void> {
    return (this as any).consume(() => Promise.resolve(stream));
  }
}

/**
 * Builds a `ReadableStream<Uint8Array>` from raw SSE text, flushing one line
 * at a time (one `Uint8Array` per line). This mimics how a server flushes
 * events and exercises the parser's cross-chunk buffering, just like the bytes
 * a real `fetch` response body would yield.
 */
function sseToByteStream(raw: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const lines = raw.split('\n');
  let index = 0;

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < lines.length) {
        const isLast = index === lines.length - 1;
        controller.enqueue(encoder.encode(lines[index] + (isLast ? '' : '\n')));
        index += 1;
      } else {
        controller.close();
      }
    },
  });
}

/**
 * Wraps already-parsed chunk objects in a `ReadableStream<UIMessageChunk>` —
 * what the transport hands `AbstractChat` after parsing SSE itself. The default
 * path: reducer tests don't need the byte round-trip (the parser has its own
 * suite in `stream-parser.test.ts`), so they feed chunks straight in.
 */
function chunksToStream(
  chunks: UIMessageChunk[]
): ReadableStream<UIMessageChunk> {
  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

/**
 * Parses raw SSE text the same way the production transport does
 * (`parseJsonEventStream`). Reserved for the verbatim-capture test, which is
 * authored as real server bytes and so must flow through the real parser.
 */
function streamFromSse(raw: string): ReadableStream<UIMessageChunk> {
  return parseJsonEventStream<UIMessageChunk>(sseToByteStream(raw));
}

type SendMessagesCall = Parameters<ChatTransport<UIMessage>['sendMessages']>[0];

function createTestSetup(
  {
    chunks,
    chunksByRequest,
    sse,
    streamFactory,
    sendMessagesFactory,
    onToolCall,
    onFinish,
    onError,
    sendAutomaticallyWhen,
  }: {
    chunks?: UIMessageChunk[];
    chunksByRequest?: UIMessageChunk[][];
    sse?: string;
    streamFactory?: (requestIndex: number) => ReadableStream<UIMessageChunk>;
    sendMessagesFactory?: (
      requestIndex: number,
      options: SendMessagesCall
    ) => Promise<ReadableStream<UIMessageChunk>>;
    onToolCall?: (
      options: { toolCall: any },
      addToolResult?: TestChat['addToolResult']
    ) => void | Promise<void>;
    onFinish?: ChatOnFinishCallback<UIMessage>;
    onError?: ChatOnErrorCallback;
    sendAutomaticallyWhen?: (options: {
      messages: UIMessage[];
    }) => boolean | PromiseLike<boolean>;
  } = { chunks: [] }
) {
  let requestIndex = 0;
  const makeStream = (index: number): ReadableStream<UIMessageChunk> => {
    if (streamFactory) return streamFactory(index);
    if (sse !== undefined) return streamFromSse(sse);
    return chunksToStream(chunksByRequest?.[index] ?? chunks ?? []);
  };
  const sendMessages = jest.fn(
    (options: SendMessagesCall): Promise<ReadableStream<UIMessageChunk>> => {
      const index = requestIndex;
      requestIndex += 1;
      return sendMessagesFactory
        ? sendMessagesFactory(index, options)
        : Promise.resolve(makeStream(index));
    }
  );
  const reconnectToStream = jest.fn(() => Promise.resolve(null));
  const transport: ChatTransport<UIMessage> = {
    sendMessages: sendMessages as any,
    reconnectToStream: reconnectToStream as any,
  };

  const state = new InMemoryChatState();
  const chat = new TestChat({
    id: 'test-chat',
    state,
    transport,
    generateId: (() => {
      let i = 0;
      // eslint-disable-next-line no-plusplus
      return () => `gen-${++i}`;
    })(),
    onError,
    onFinish,
    onToolCall,
    sendAutomaticallyWhen,
  });

  return { chat, state, transport, sendMessages };
}

const startChunk = (id = 'msg-1'): UIMessageChunk => ({
  type: 'start',
  messageId: id,
});
const finishChunk = (): UIMessageChunk => ({ type: 'finish' });

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function assistantPart(state: InMemoryChatState): any {
  const assistant = state.messages.find((m) => m.role === 'assistant');
  return assistant?.parts[0];
}

function assistantToolPart(state: InMemoryChatState, toolCallId: string): any {
  const assistant = state.messages.find(
    (message) => message.role === 'assistant'
  );
  return assistant?.parts.find(
    (part) => 'toolCallId' in part && part.toolCallId === toolCallId
  );
}

function messageById(state: InMemoryChatState, messageId: string): UIMessage {
  return state.messages.find((message) => message.id === messageId)!;
}

describe('AbstractChat.processStreamWithCallbacks', () => {
  describe('guardrail violations', () => {
    it('replaces partial assistant content with the fallback and finishes ready', async () => {
      const fallbackResponse =
        "I can't help with that request, but I can help with product questions.";
      const onFinish = jest.fn();
      const onError = jest.fn();
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          { type: 'text-start', id: 'text-1' },
          {
            type: 'text-delta',
            id: 'text-1',
            delta: 'Unsafe partial content',
          },
          {
            type: 'data-guardrail-violation',
            data: {
              category: 'blocked',
              guardrailType: 'output',
              fallbackResponse,
            },
          },
          finishChunk(),
        ],
        onError,
        onFinish,
      });

      await chat.sendMessage({ text: 'blocked request' });

      const assistant = state.messages.find((m) => m.role === 'assistant')!;

      expect(state.status).toBe('ready');
      expect(state.error).toBeUndefined();
      expect(onError).not.toHaveBeenCalled();
      expect(assistant).toMatchObject({
        id: 'msg-1',
        role: 'assistant',
        parts: [{ type: 'text', text: fallbackResponse, state: 'done' }],
      });
      expect(JSON.stringify(assistant.parts)).not.toContain(
        'Unsafe partial content'
      );
      expect(onFinish).toHaveBeenCalledWith({
        message: assistant,
        messages: state.messages,
        isAbort: false,
        isDisconnect: false,
        isError: false,
      });
    });

    it('creates a fallback assistant message when violation arrives before an assistant message starts', async () => {
      const onFinish = jest.fn();
      const onError = jest.fn();
      const { chat, state } = createTestSetup({
        chunks: [
          {
            type: 'data-guardrail-violation',
            data: {
              category: 'blocked',
              guardrailType: 'input',
              fallbackResponse: 'I cannot process this request.',
            },
          },
          finishChunk(),
        ],
        onError,
        onFinish,
      });

      await chat.sendMessage({ text: 'blocked request' });

      const assistant = state.messages.find((m) => m.role === 'assistant')!;

      expect(state.status).toBe('ready');
      expect(state.error).toBeUndefined();
      expect(onError).not.toHaveBeenCalled();
      expect(assistant).toMatchObject({
        id: 'gen-2',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'I cannot process this request.',
            state: 'done',
          },
        ],
      });
      expect(onFinish).toHaveBeenCalledWith({
        message: assistant,
        messages: state.messages,
        isAbort: false,
        isDisconnect: false,
        isError: false,
      });
    });
  });

  describe('tool-input lifecycle (existing chunks)', () => {
    it('settles when onToolCall returns addToolResult and commits the output', async () => {
      let chat!: TestChat;
      const onFinish = jest.fn();
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }) =>
          chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { hits: ['hello'] },
          }),
        onFinish,
      });
      chat = setup.chat;

      const outcome = await Promise.race([
        chat.sendMessage({ text: 'search for hello' }).then(() => 'settled'),
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timed out'), 100)
        ),
      ]);

      expect(outcome).toBe('settled');
      expect(assistantPart(setup.state)).toMatchObject({
        type: 'tool-search',
        toolCallId: 'call-1',
        state: 'output-available',
        output: { hits: ['hello'] },
      });
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            parts: [
              expect.objectContaining({
                toolCallId: 'call-1',
                state: 'output-available',
              }),
            ],
          }),
        })
      );
    });

    it('settles when an async onToolCall awaits addToolResult', async () => {
      let chat!: TestChat;
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          finishChunk(),
        ],
        onToolCall: async ({ toolCall }) => {
          await chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { hits: ['hello'] },
          });
        },
      });
      chat = setup.chat;

      await expect(
        chat.sendMessage({ text: 'search for hello' })
      ).resolves.toBeUndefined();
      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { hits: ['hello'] },
      });
    });

    it('passes the canonical delayed tool result to onFinish after the stream closes', async () => {
      let chat!: TestChat;
      const toolCallStarted = deferred<undefined>();
      const releaseToolResult = deferred<undefined>();
      const onFinish = jest.fn();
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          finishChunk(),
        ],
        onToolCall: async ({ toolCall }) => {
          toolCallStarted.resolve(undefined);
          await releaseToolResult.promise;
          await chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { hits: ['delayed'] },
          });
        },
        onFinish,
      });
      chat = setup.chat;

      const send = chat.sendMessage({ text: 'search for hello' });
      await toolCallStarted.promise;
      await new Promise((resolve) => setTimeout(resolve, 0));
      releaseToolResult.resolve(undefined);
      await send;

      const assistant = setup.state.messages.find(
        (message) => message.role === 'assistant'
      );
      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { hits: ['delayed'] },
      });
      expect(setup.state.status).toBe('ready');
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({ message: assistant })
      );
    });

    it('does not let later input chunks downgrade a committed tool result', async () => {
      let chat!: TestChat;
      const onFinish = jest.fn();
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          {
            type: 'tool-input-start',
            toolName: 'search',
            toolCallId: 'call-1',
          },
          {
            type: 'tool-input-delta',
            toolName: 'search',
            toolCallId: 'call-1',
            inputTextDelta: '{"q":"stale"}',
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }) =>
          chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { hits: ['canonical'] },
          }),
        onFinish,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search' });

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { hits: ['canonical'] },
      });
      expect(onFinish.mock.calls[0][0].message.parts[0]).toMatchObject({
        state: 'output-available',
        output: { hits: ['canonical'] },
      });
    });

    it.each([
      [
        'tool-input-error',
        {
          type: 'tool-input-error',
          toolName: 'search',
          toolCallId: 'call-1',
          input: '{"q":"stale"}',
          errorText: 'stale input error',
        },
      ],
      [
        'tool-output-error',
        {
          type: 'tool-output-error',
          toolName: 'search',
          toolCallId: 'call-1',
          errorText: 'stale output error',
        },
      ],
    ] as const)(
      'does not let a later %s downgrade a committed tool result',
      async (_name, staleChunk) => {
        let chat!: TestChat;
        const onFinish = jest.fn();
        const setup = createTestSetup({
          chunks: [
            startChunk(),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'hello' },
            },
            staleChunk,
            finishChunk(),
          ],
          onToolCall: ({ toolCall }) =>
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { hits: ['canonical'] },
            }),
          onFinish,
        });
        chat = setup.chat;

        await chat.sendMessage({ text: 'search' });

        expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
          state: 'output-available',
          output: { hits: ['canonical'] },
        });
        expect(onFinish.mock.calls[0][0].message.parts[0]).toMatchObject({
          state: 'output-available',
          output: { hits: ['canonical'] },
        });
      }
    );

    it('continues once after reverse-order results and ignores duplicate submissions', async () => {
      let chat!: TestChat;
      let submitLateResult!: () => Promise<void>;
      const sendAutomaticallyWhen = jest.fn(() => true);
      const onFinish = jest.fn();
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'first' },
            },
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-2',
              input: { q: 'second' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-2'), finishChunk()],
        ],
        onToolCall: ({ toolCall }) => {
          const submit = () =>
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { id: toolCall.toolCallId },
            });
          if (toolCall.toolCallId === 'call-1') {
            submitLateResult = submit;
          } else {
            void submit();
          }
        },
        onFinish,
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search twice' });
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledTimes(1);

      await submitLateResult();
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledTimes(2);
      expect(onFinish.mock.invocationCallOrder[0]).toBeLessThan(
        setup.sendMessages.mock.invocationCallOrder[1]
      );
      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        output: { id: 'call-1' },
      });
      expect(assistantToolPart(setup.state, 'call-2')).toMatchObject({
        output: { id: 'call-2' },
      });

      await submitLateResult();
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(1);
    });

    it('keeps response ownership when the same messages are restored', async () => {
      let chat!: TestChat;
      const submitResults = new Map<string, () => Promise<void>>();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'first' },
            },
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-2',
              input: { q: 'second' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-2'), finishChunk()],
        ],
        onToolCall: ({ toolCall }) => {
          submitResults.set(toolCall.toolCallId, () =>
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { id: toolCall.toolCallId },
            })
          );
        },
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search twice' });
      chat.messages = [...chat.messages];

      await submitResults.get('call-1')!();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();

      await submitResults.get('call-2')!();
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(1);
    });

    it('keeps a completed result pending until its follow-up request settles', async () => {
      let chat!: TestChat;
      let submitLateResult!: () => Promise<void>;
      const followUpRequest = deferred<ReadableStream<UIMessageChunk>>();
      const followUpStarted = deferred<undefined>();
      const setup = createTestSetup({
        sendMessagesFactory: (requestIndex) => {
          if (requestIndex === 0) {
            return Promise.resolve(
              chunksToStream([
                startChunk('assistant-1'),
                {
                  type: 'tool-input-available',
                  toolName: 'search',
                  toolCallId: 'call-1',
                  input: {},
                },
                finishChunk(),
              ])
            );
          }

          followUpStarted.resolve(undefined);
          return followUpRequest.promise;
        },
        onToolCall: ({ toolCall }) => {
          submitLateResult = () =>
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { ok: true },
            });
        },
        sendAutomaticallyWhen: () => true,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search' });

      let didSettle = false;
      const resultPromise = submitLateResult().then(() => {
        didSettle = true;
      });
      await followUpStarted.promise;

      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(didSettle).toBe(false);

      followUpRequest.resolve(
        chunksToStream([startChunk('assistant-2'), finishChunk()])
      );
      await resultPromise;

      expect(didSettle).toBe(true);
    });

    it.each([
      ['synchronous', () => false],
      ['asynchronous', () => Promise.resolve(false)],
    ])(
      'does not continue when a %s sendAutomaticallyWhen returns false',
      async (_name, sendAutomaticallyWhen) => {
        let chat!: TestChat;
        const setup = createTestSetup({
          chunks: [
            startChunk(),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: {},
            },
            finishChunk(),
          ],
          onToolCall: ({ toolCall }) =>
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { ok: true },
            }),
          sendAutomaticallyWhen,
        });
        chat = setup.chat;

        await chat.sendMessage({ text: 'search' });

        expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      }
    );

    it('does not continue when an awaited tool callback commits then rejects without onFinish', async () => {
      let chat!: TestChat;
      const onError = jest.fn();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: async ({ toolCall }) => {
          await chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          });
          throw new Error('tool failed after commit');
        },
        onError,
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search' });

      expect(setup.state.status).toBe('error');
      expect(setup.state.error).toEqual(new Error('tool failed after commit'));
      expect(onError).toHaveBeenCalledTimes(1);
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it.each([
      [
        'throws synchronously',
        () => {
          throw new Error('tool failed');
        },
      ],
      [
        'rejects asynchronously',
        () => Promise.reject(new Error('tool failed')),
      ],
    ])(
      'uses the existing error path when onToolCall %s',
      async (_name, onToolCall) => {
        const onError = jest.fn();
        const onFinish = jest.fn();
        const setup = createTestSetup({
          chunks: [
            startChunk(),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: {},
            },
            finishChunk(),
          ],
          onToolCall,
          onError,
          onFinish,
          sendAutomaticallyWhen: () => true,
        });

        await setup.chat.sendMessage({ text: 'search' });

        expect(setup.state.status).toBe('error');
        expect(setup.state.error).toEqual(new Error('tool failed'));
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onFinish).toHaveBeenCalledTimes(1);
        expect(onFinish).toHaveBeenCalledWith(
          expect.objectContaining({
            isAbort: false,
            isDisconnect: false,
            isError: true,
          })
        );
        expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      }
    );

    it('keeps a successful onFinish and reports a rejected continuation predicate once', async () => {
      let chat!: TestChat;
      const onError = jest.fn();
      const onFinish = jest.fn();
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }) =>
          chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          }),
        onError,
        onFinish,
        sendAutomaticallyWhen: () =>
          Promise.reject(new Error('predicate failed')),
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search' });

      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({ isError: false })
      );
      expect(onError).toHaveBeenCalledTimes(1);
      expect(setup.state.status).toBe('error');
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['aborts', [{ type: 'abort' } as UIMessageChunk, finishChunk()], 'ready'],
      [
        'fails',
        [{ type: 'error', errorText: 'stream failed' } as UIMessageChunk],
        'error',
      ],
    ])(
      'does not continue when the owning stream %s before a late result',
      async (_name, terminalChunks, expectedStatus) => {
        let submitLateResult!: () => Promise<void>;
        const sendAutomaticallyWhen = jest.fn(() => true);
        const setup = createTestSetup({
          chunks: [
            startChunk(),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: {},
            },
            ...terminalChunks,
          ],
          onToolCall: ({ toolCall }) => {
            submitLateResult = () =>
              setup.chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { ok: true },
              });
          },
          sendAutomaticallyWhen,
        });

        await setup.chat.sendMessage({ text: 'search' });
        await submitLateResult();

        expect(setup.state.status).toBe(expectedStatus);
        expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
          state: 'output-available',
        });
        expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
        expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      }
    );

    it('settles an awaited late result after stop without continuing', async () => {
      let chat!: TestChat;
      const toolCallStarted = deferred<undefined>();
      const releaseToolResult = deferred<undefined>();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: async ({ toolCall }) => {
          toolCallStarted.resolve(undefined);
          await releaseToolResult.promise;
          await chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          });
        },
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      const send = chat.sendMessage({ text: 'search' });
      await toolCallStarted.promise;
      await chat.stop();
      releaseToolResult.resolve(undefined);

      const outcome = await Promise.race([
        send.then(() => 'settled'),
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timed out'), 100)
        ),
      ]);

      expect(outcome).toBe('settled');
      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { ok: true },
      });
      expect(setup.state.status).toBe('ready');
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('settles an awaited late result after stop and messages are cleared', async () => {
      let chat!: TestChat;
      const toolCallStarted = deferred<undefined>();
      const releaseToolResult = deferred<undefined>();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: async ({ toolCall }) => {
          toolCallStarted.resolve(undefined);
          await releaseToolResult.promise;
          await chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          });
        },
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      const send = chat.sendMessage({ text: 'search' });
      await toolCallStarted.promise;
      await chat.stop();
      chat.messages = [];
      releaseToolResult.resolve(undefined);

      const outcome = await Promise.race([
        send.then(() => 'settled'),
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timed out'), 100)
        ),
      ]);

      expect(outcome).toBe('settled');
      expect(setup.state.messages).toEqual([]);
      expect(setup.state.status).toBe('ready');
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('settles when onToolCall synchronously stops, clears and returns a result', async () => {
      let chat!: TestChat;
      const onError = jest.fn();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }) => {
          chat.stop();
          chat.messages = [];
          return chat.addToolResult({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          });
        },
        onError,
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      await expect(
        chat.sendMessage({ text: 'search' })
      ).resolves.toBeUndefined();
      expect(setup.state.messages).toEqual([]);
      expect(setup.state.status).toBe('ready');
      expect(onError).not.toHaveBeenCalled();
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('does not let a detached response overwrite its replacement message', async () => {
      let chat!: TestChat;
      const replacementMessage: UIMessage = {
        id: 'assistant-replacement',
        role: 'assistant',
        parts: [{ type: 'text', text: 'replacement', state: 'done' }],
      };
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-detached'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', delta: 'stale' },
          finishChunk(),
        ],
        onToolCall: () => {
          chat.messages = [chat.messages[0], replacementMessage];
        },
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search' });

      expect(setup.state.messages).toEqual([
        expect.objectContaining({ role: 'user' }),
        replacementMessage,
      ]);
      expect(
        setup.state.messages.some(
          (message) => message.id === 'assistant-detached'
        )
      ).toBe(false);
    });

    it('does not continue a response removed by onFinish', async () => {
      let chat!: TestChat;
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: {},
            },
            finishChunk(),
          ],
          [startChunk('assistant-2'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          }),
        onFinish: () => {
          chat.messages = [];
        },
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search' });

      expect(setup.state.messages).toEqual([]);
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('does not continue when its message is removed while the predicate is pending', async () => {
      let chat!: TestChat;
      const predicateStarted = deferred<undefined>();
      const predicateResult = deferred<boolean>();
      const sendAutomaticallyWhen = jest.fn(() => {
        predicateStarted.resolve(undefined);
        return predicateResult.promise;
      });
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: {},
            },
            finishChunk(),
          ],
          [startChunk('assistant-2'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          }),
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      const send = chat.sendMessage({ text: 'search' });
      await predicateStarted.promise;
      chat.messages = [];
      predicateResult.resolve(true);
      await send;

      expect(setup.state.messages).toEqual([]);
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(1);
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('does not surface a predicate error after its message is removed', async () => {
      let chat!: TestChat;
      const predicateStarted = deferred<undefined>();
      const predicateResult = deferred<boolean>();
      const sendAutomaticallyWhen = jest.fn(() => {
        predicateStarted.resolve(undefined);
        return predicateResult.promise;
      });
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { ok: true },
          }),
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      const send = chat.sendMessage({ text: 'search' });
      await predicateStarted.promise;
      chat.messages = [];
      predicateResult.reject(new Error('stale predicate failure'));
      await send;

      expect(setup.state.messages).toEqual([]);
      expect(setup.state.status).toBe('ready');
      expect(setup.state.error).toBeUndefined();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('does not let an older response predicate change newer response state', async () => {
      let submitOldResult!: TestChat['addToolResult'];
      const newerResponseStarted = deferred<undefined>();
      const finishNewerResponse = deferred<undefined>();
      const sendAutomaticallyWhen = jest.fn(() =>
        Promise.reject(new Error('old continuation predicate failed'))
      );
      const onError = jest.fn();
      const setup = createTestSetup({
        sendMessagesFactory: (requestIndex) => {
          if (requestIndex === 0) {
            return Promise.resolve(
              chunksToStream([
                startChunk('assistant-old'),
                {
                  type: 'tool-input-available',
                  toolName: 'search',
                  toolCallId: 'call-old',
                  input: {},
                },
                finishChunk(),
              ])
            );
          }

          return Promise.resolve(
            new ReadableStream<UIMessageChunk>({
              start(controller) {
                controller.enqueue(startChunk('assistant-new'));
                newerResponseStarted.resolve(undefined);
                void finishNewerResponse.promise.then(() => {
                  controller.enqueue(finishChunk());
                  controller.close();
                });
              },
            })
          );
        },
        onToolCall: ({ toolCall }, addToolResult) => {
          submitOldResult = addToolResult!;
          expect(toolCall.toolCallId).toBe('call-old');
        },
        sendAutomaticallyWhen,
        onError,
      });

      await setup.chat.sendMessage({ text: 'first request' });

      const newerSend = setup.chat.sendMessage({ text: 'second request' });
      await newerResponseStarted.promise;
      const oldResult = submitOldResult({
        tool: 'search',
        toolCallId: 'call-old',
        output: { ok: true },
      });

      finishNewerResponse.resolve(undefined);
      await newerSend;
      await oldResult;

      expect(setup.state.status).toBe('ready');
      expect(setup.state.error).toBeUndefined();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        new Error('old continuation predicate failed')
      );
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
    });

    it('commits a single fire-and-forget result and settles without hanging', async () => {
      let chat!: TestChat;
      const onFinish = jest.fn();
      const setup = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          finishChunk(),
        ],
        // Fire-and-forget: commit but never return or await the promise.
        onToolCall: ({ toolCall }, addToolResult) => {
          void addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { hits: ['hello'] },
          });
        },
        onFinish,
      });
      chat = setup.chat;

      const outcome = await Promise.race([
        chat.sendMessage({ text: 'search for hello' }).then(() => 'settled'),
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timed out'), 100)
        ),
      ]);

      expect(outcome).toBe('settled');
      expect(setup.state.status).toBe('ready');
      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { hits: ['hello'] },
      });
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('keeps response ownership when messages are rehydrated as fresh objects', async () => {
      let chat!: TestChat;
      const submitResults = new Map<string, () => Promise<void>>();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'first' },
            },
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-2',
              input: { q: 'second' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-2'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          submitResults.set(toolCall.toolCallId, () =>
            addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { id: toolCall.toolCallId },
            })
          );
        },
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'search twice' });
      // True cross-session rehydration: structurally-equal but fresh objects,
      // so ownership survives only if it is keyed by message id.
      chat.messages = JSON.parse(JSON.stringify(chat.messages)) as UIMessage[];

      await submitResults.get('call-1')!();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();

      await submitResults.get('call-2')!();
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(1);
      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        output: { id: 'call-1' },
      });
      expect(assistantToolPart(setup.state, 'call-2')).toMatchObject({
        output: { id: 'call-2' },
      });
    });

    it('keeps public results available after equivalent message rehydration', async () => {
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'rehydrated' },
          },
          finishChunk(),
        ],
        onToolCall: () => undefined,
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'search' });
      setup.chat.messages = JSON.parse(
        JSON.stringify(setup.chat.messages)
      ) as UIMessage[];
      await setup.chat.addToolResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'rehydrated' },
      });

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { owner: 'rehydrated' },
      });
    });

    it('does not let an old response retirement disturb a newer active response', async () => {
      let chat!: TestChat;
      let secondController!: ReadableStreamDefaultController<UIMessageChunk>;
      const setup = createTestSetup({
        streamFactory: (index) => {
          if (index === 0) {
            return chunksToStream([
              startChunk('assistant-1'),
              {
                type: 'tool-input-available',
                toolName: 'search',
                toolCallId: 'call-1',
                input: {},
              },
              finishChunk(),
            ]);
          }
          // Second response stays open so it remains the active response.
          return new ReadableStream<UIMessageChunk>({
            start(controller) {
              controller.enqueue(startChunk('assistant-2'));
              secondController = controller;
            },
          });
        },
        // Fire-and-forget so call-1 stays owned by the first response.
        onToolCall: () => {},
        sendAutomaticallyWhen: () => false,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'first' });
      const second = chat.sendMessage({ text: 'second' });
      let guard = 0;
      while (
        !setup.state.messages.some((message) => message.id === 'assistant-2') &&
        guard++ < 500
      ) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      expect(setup.state.status).toBe('streaming');

      // Detach the first (old) response's message while the second is active.
      chat.messages = chat.messages.filter(
        (message) => message.id !== 'assistant-1'
      );

      // Retiring the old response must not clear or finalize the newer one.
      expect(setup.state.status).toBe('streaming');
      expect(
        setup.state.messages.some((message) => message.id === 'assistant-2')
      ).toBe(true);

      secondController.enqueue(finishChunk());
      secondController.close();
      await second;

      expect(setup.state.status).toBe('ready');
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(setup.state.error).toBeUndefined();
    });

    it('settles a tombstoned result after retirement and cleans up ownership', async () => {
      let chat!: TestChat;
      let releaseToolResult!: () => Promise<void>;
      const onError = jest.fn();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        // Returned promise stays pending so the response is held active.
        onToolCall: ({ toolCall }, addToolResult) =>
          new Promise<void>((resolve) => {
            releaseToolResult = async () => {
              await addToolResult!({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { ok: true },
              });
              resolve();
            };
          }),
        onError,
        sendAutomaticallyWhen,
      });
      chat = setup.chat;

      const send = chat.sendMessage({ text: 'search' });
      let guard = 0;
      while (!releaseToolResult && guard++ < 500) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // Detach the message while the callback is in flight (tombstone kept).
      chat.messages = [];

      // The in-flight result now routes through the tombstone and settles.
      await releaseToolResult();
      await send;

      expect(setup.state.status).toBe('ready');
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      // Ownership is cleaned up: a later result for the same id is a no-op.
      await expect(
        chat.addToolResult({
          tool: 'search',
          toolCallId: 'call-1',
          output: { ok: true },
        })
      ).resolves.toBeUndefined();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('ignores a public result routed through a retired response', async () => {
      const callbackStarted = deferred<undefined>();
      const releaseCallback = deferred<undefined>();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'old' },
          },
          finishChunk(),
        ],
        onToolCall: async () => {
          callbackStarted.resolve(undefined);
          await releaseCallback.promise;
        },
        sendAutomaticallyWhen,
      });

      const send = setup.chat.sendMessage({ text: 'old request' });
      await callbackStarted.promise;

      setup.chat.messages = [];
      setup.chat.messages = [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'restored' },
            },
          ],
        },
      ];

      await setup.chat.addToolResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'old' },
      });

      expect(setup.chat.messages[0].parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'restored' },
      });
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();

      releaseCallback.resolve(undefined);
      await send;
      expect(setup.state.status).toBe('ready');
      expect(setup.state.error).toBeUndefined();
    });

    it('lets a newer response replace a retired routing owner', async () => {
      const callbackStarted = deferred<undefined>();
      const releaseCallback = deferred<undefined>();
      const onError = jest.fn();
      let callbackCount = 0;
      const state = new InMemoryChatState();
      const sendMessages = jest.fn(() =>
        Promise.resolve(
          chunksToStream([
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ])
        )
      );
      const onToolCall = (
        { toolCall }: { toolCall: any },
        addToolResult?: TestChat['addToolResult']
      ): void | Promise<void> => {
        callbackCount++;
        if (callbackCount === 1) {
          callbackStarted.resolve(undefined);
          return releaseCallback.promise;
        }
        return addToolResult!({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: { owner: 'new' },
        });
      };
      const chat = new ConcurrentTestChat({
        id: 'test-chat',
        state,
        transport: {
          sendMessages: sendMessages as any,
          reconnectToStream: jest.fn(() => Promise.resolve(null)) as any,
        },
        onError,
        onToolCall,
        sendAutomaticallyWhen: () => false,
      });

      const oldSend = chat.sendMessage({ text: 'old request' });
      await callbackStarted.promise;
      chat.messages = [];

      await chat.startResponse(
        chunksToStream([
          startChunk('assistant-new'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'new' },
          },
          finishChunk(),
        ])
      );

      expect(onError).not.toHaveBeenCalled();
      expect(state.messages[0].parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });

      releaseCallback.resolve(undefined);
      await oldSend;
      expect(state.status).toBe('ready');
    });

    it('makes a transferred routing owner inert after its message is removed', async () => {
      let addFirstResult!: TestChat['addToolResult'];
      let callbackCount = 0;
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          callbackCount++;
          if (callbackCount === 1) {
            addFirstResult = addToolResult!;
          }
          return addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: callbackCount === 1 ? 'old' : 'new' },
          });
        },
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'old request' });
      await setup.chat.sendMessage({ text: 'new request' });

      setup.chat.messages = setup.chat.messages.filter(
        (message) => message.id !== 'assistant-old'
      );
      setup.chat.messages = [
        ...setup.chat.messages,
        {
          id: 'assistant-old',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'restored' },
            },
          ],
        },
      ];

      await addFirstResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'stale' },
      });

      expect(setup.chat.messages.at(-1)?.parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'restored' },
      });
    });

    it('cleans a retired owner when the same message id is restored', async () => {
      let chat!: TestChat;
      let settleFirstToolCall!: () => Promise<void>;
      let toolCallCount = 0;
      const onError = jest.fn();
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'first' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-2'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'second' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          toolCallCount++;
          if (toolCallCount === 1) {
            return new Promise<void>((resolve) => {
              settleFirstToolCall = async () => {
                await addToolResult!({
                  tool: toolCall.toolName,
                  toolCallId: toolCall.toolCallId,
                  output: { owner: 'first' },
                });
                resolve();
              };
            });
          }

          return addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'second' },
          });
        },
        onError,
        sendAutomaticallyWhen: () => false,
      });
      chat = setup.chat;

      const firstSend = chat.sendMessage({ text: 'first search' });
      let guard = 0;
      while (!settleFirstToolCall && guard++ < 500) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      chat.messages = chat.messages.filter(
        (message) => message.id !== 'assistant-1'
      );
      chat.messages = chat.messages.concat({
        id: 'assistant-1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'restored', state: 'done' }],
      });

      await settleFirstToolCall();
      await firstSend;
      await chat.sendMessage({ text: 'second search' });

      expect(onError).not.toHaveBeenCalled();
      expect(setup.state.status).toBe('ready');
      const secondAssistant = setup.state.messages.find(
        (message) => message.id === 'assistant-2'
      );
      const secondToolPart = secondAssistant?.parts.find(
        (part) => 'toolCallId' in part && part.toolCallId === 'call-1'
      );
      expect(secondToolPart).toMatchObject({
        state: 'output-available',
        output: { owner: 'second' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
    });

    it('ignores a scoped result after its response is retired', async () => {
      let chat!: TestChat;
      let settleOldToolCall!: () => Promise<void>;
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'old' },
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          new Promise<void>((resolve) => {
            settleOldToolCall = async () => {
              await addToolResult!({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { owner: 'old' },
              });
              resolve();
            };
          }),
        sendAutomaticallyWhen: () => false,
      });
      chat = setup.chat;

      const send = chat.sendMessage({ text: 'old request' });
      let guard = 0;
      while (!settleOldToolCall && guard++ < 500) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      chat.messages = chat.messages.filter(
        (message) => message.id !== 'assistant-1'
      );
      chat.messages = chat.messages.concat({
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-search',
            toolCallId: 'call-1',
            state: 'input-available',
            input: { q: 'new' },
          },
        ],
      });

      await settleOldToolCall();
      await send;

      const restoredPart = chat.messages
        .find((message) => message.id === 'assistant-1')
        ?.parts.find(
          (part) => 'toolCallId' in part && part.toolCallId === 'call-1'
        );
      expect(restoredPart).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });
    });

    it('preserves the error finish when onError clears messages', async () => {
      let chat!: TestChat;
      const callbackOrder: string[] = [];
      const onError = jest.fn(() => {
        callbackOrder.push('onError');
        chat.messages = [];
      });
      const onFinish = jest.fn(() => {
        callbackOrder.push('onFinish');
      });
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: () => {
          throw new Error('tool failed');
        },
        onError,
        onFinish,
      });
      chat = setup.chat;

      await chat.sendMessage({ text: 'fail tool' });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({ id: 'assistant-1' }),
          messages: [],
          isError: true,
        })
      );
      expect(callbackOrder).toEqual(['onError', 'onFinish']);
      expect(chat.messages).toEqual([]);
    });

    it('commits a reused toolCallId to its owning assistant message', async () => {
      let chat!: TestChat;
      const onFinish = jest.fn();
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-new'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'new' },
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'new' },
          }),
        onFinish,
      });
      chat = setup.chat;
      setup.state.messages = [
        {
          id: 'assistant-old',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'old' },
            },
          ],
        },
      ];

      await chat.sendMessage({ text: 'search again' });

      const oldMessage = setup.state.messages.find(
        (message) => message.id === 'assistant-old'
      );
      const newMessage = setup.state.messages.find(
        (message) => message.id === 'assistant-new'
      );

      expect(oldMessage?.parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'old' },
      });
      expect(newMessage?.parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            id: 'assistant-new',
            parts: [
              expect.objectContaining({
                state: 'output-available',
                output: { owner: 'new' },
              }),
            ],
          }),
        })
      );

      await chat.addToolResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'duplicate' },
      });

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-old')
          ?.parts[0]
      ).toMatchObject({
        state: 'input-available',
        input: { q: 'old' },
      });
      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
    });

    it('rejects overlapping response ownership for a reused toolCallId', async () => {
      let submitOldResult!: () => Promise<void>;
      const onError = jest.fn();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          submitOldResult ??= () =>
            addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
        },
        onError,
        sendAutomaticallyWhen,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      await setup.chat.sendMessage({ text: 'second search' });
      await submitOldResult();

      const oldMessage = setup.state.messages.find(
        (message) => message.id === 'assistant-old'
      );
      const newMessage = setup.state.messages.find(
        (message) => message.id === 'assistant-new'
      );
      expect(oldMessage?.parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'old' },
      });
      expect(newMessage?.parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });
      expect(setup.state.status).toBe('error');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
    });

    it('keeps a stale callback scoped when a later response reuses its resolved toolCallId', async () => {
      let submitOldResult!: TestChat['addToolResult'];
      let submitNewResult!: TestChat['addToolResult'];
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.q === 'old') {
            submitOldResult = addToolResult!;
          } else {
            submitNewResult = addToolResult!;
          }
        },
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      await submitOldResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'old' },
      });
      await setup.chat.sendMessage({ text: 'second search' });

      await submitOldResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'stale' },
      });

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-old')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'old' },
      });
      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });

      await submitNewResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'new' },
      });

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.state.status).toBe('ready');
    });

    it('keeps unrelated tool results active when another call id transfers', async () => {
      let submitPendingOldResult!: TestChat['addToolResult'];
      const sendAutomaticallyWhen = jest.fn(
        ({ messages }: { messages: UIMessage[] }) => {
          const oldMessage = messages.find(
            (message) => message.id === 'assistant-old'
          );
          const pendingPart = oldMessage?.parts.find(
            (part) => 'toolCallId' in part && part.toolCallId === 'call-pending'
          );

          return pendingPart &&
            'state' in pendingPart &&
            pendingPart.state === 'output-available'
            ? true
            : false;
        }
      );
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-reused',
              input: { q: 'old' },
            },
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-pending',
              input: { q: 'pending' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-reused',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-continuation'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.toolCallId === 'call-pending') {
            submitPendingOldResult = addToolResult!;
            return;
          }

          return addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: toolCall.input.q },
          });
        },
        sendAutomaticallyWhen,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      await setup.chat.sendMessage({ text: 'second search' });
      await submitPendingOldResult({
        tool: 'search',
        toolCallId: 'call-pending',
        output: { owner: 'old' },
      });

      const oldMessage = setup.state.messages.find(
        (message) => message.id === 'assistant-old'
      );
      expect(
        oldMessage?.parts.find(
          (part) => 'toolCallId' in part && part.toolCallId === 'call-pending'
        )
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'old' },
      });
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(2);
      expect(setup.sendMessages).toHaveBeenCalledTimes(3);
      expect(setup.state.status).toBe('ready');
    });

    it('allows a newer response to reuse a call id after the older response is stopped', async () => {
      const oldToolCallStarted = deferred<undefined>();
      let closeOldStream!: () => void;
      const onError = jest.fn();
      const setup = createTestSetup({
        streamFactory: (requestIndex) => {
          if (requestIndex > 0) {
            return chunksToStream([
              startChunk('assistant-new'),
              {
                type: 'tool-input-available',
                toolName: 'search',
                toolCallId: 'call-1',
                input: { owner: 'new' },
              },
              finishChunk(),
            ]);
          }

          return new ReadableStream<UIMessageChunk>({
            start(controller) {
              controller.enqueue(startChunk('assistant-old'));
              controller.enqueue({
                type: 'tool-input-available',
                toolName: 'search',
                toolCallId: 'call-1',
                input: { owner: 'old' },
              });
              closeOldStream = () => controller.close();
            },
          });
        },
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.owner === 'old') {
            oldToolCallStarted.resolve(undefined);
            return;
          }

          return addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'new' },
          });
        },
        sendAutomaticallyWhen: () => false,
        onError,
      });

      const oldSend = setup.chat.sendMessage({ text: 'first request' });
      await oldToolCallStarted.promise;
      await setup.chat.stop();
      closeOldStream();
      await oldSend;

      await setup.chat.sendMessage({ text: 'second request' });

      expect(onError).not.toHaveBeenCalled();
      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.state.status).toBe('ready');
    });

    it('ignores an ambiguous public result after call ownership transfers', async () => {
      let submitOldPublicResult!: () => Promise<void>;
      let submitNewScopedResult!: TestChat['addToolResult'];
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.q === 'old') {
            submitOldPublicResult = () =>
              setup.chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { owner: 'old' },
              });
            return addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
          }

          submitNewScopedResult = addToolResult!;
          return;
        },
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      await setup.chat.sendMessage({ text: 'second search' });
      await submitOldPublicResult();

      const newMessage = setup.state.messages.find(
        (message) => message.id === 'assistant-new'
      );
      expect(newMessage?.parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });

      await submitNewScopedResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'new' },
      });

      expect(newMessage?.parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });
      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.state.status).toBe('ready');
    });

    it('routes a message-scoped result to its response when a call id is reused', async () => {
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { owner: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { owner: 'new' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.owner === 'old') {
            return addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
          }
          return;
        },
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'first request' });
      await setup.chat.sendMessage({ text: 'second request' });

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-old')
          ?.parts[0]
      ).toMatchObject({ output: { owner: 'old' } });
      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
    });

    it('settles a message-scoped result for a restored tool call', async () => {
      const followUpStarted = deferred<undefined>();
      const finishFollowUp = deferred<undefined>();
      const setup = createTestSetup({
        sendMessagesFactory: () => {
          followUpStarted.resolve(undefined);
          return Promise.resolve(
            new ReadableStream<UIMessageChunk>({
              start(controller) {
                controller.enqueue(startChunk('assistant-follow-up'));
                finishFollowUp.promise.then(() => {
                  controller.enqueue(finishChunk());
                  controller.close();
                });
              },
            })
          );
        },
        sendAutomaticallyWhen: () => true,
      });
      setup.chat.messages = [
        {
          id: 'assistant-other',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'other' },
            },
          ],
        },
        {
          id: 'assistant-restored',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'restored' },
            },
          ],
        },
      ];

      let settled = false;
      const result = setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-restored'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'restored' },
        }
      ).then(() => {
        settled = true;
      });

      await followUpStarted.promise;
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      expect(settled).toBe(false);
      expect(setup.state.messages[0].parts[0]).toMatchObject({
        state: 'input-available',
      });
      expect(setup.state.messages[1].parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'restored' },
      });

      finishFollowUp.resolve(undefined);
      await result;

      expect(settled).toBe(true);
      expect(setup.state.status).toBe('ready');
    });

    it('ignores a public result when restored messages share a call id', async () => {
      const setup = createTestSetup({
        sendAutomaticallyWhen: () => false,
      });
      setup.chat.messages = [
        {
          id: 'assistant-old',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'old' },
            },
          ],
        },
        {
          id: 'assistant-new',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'new' },
            },
          ],
        },
      ];

      await setup.chat.addToolResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'unknown' },
      });

      expect(setup.state.messages[0].parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'old' },
      });
      expect(setup.state.messages[1].parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(setup.state.messages[0].parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'old' },
      });
      expect(setup.state.messages[1].parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
    });

    it('keeps a call id ambiguous across separate restored messages', async () => {
      const setup = createTestSetup({
        sendAutomaticallyWhen: () => false,
      });
      setup.chat.messages = [
        {
          id: 'assistant-old',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'old' },
            },
          ],
        },
      ];
      setup.chat.messages = [];
      setup.chat.messages = [
        {
          id: 'assistant-new',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'new' },
            },
          ],
        },
      ];

      await setup.chat.addToolResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'old-delayed' },
      });

      expect(setup.state.messages[0].parts[0]).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(setup.state.messages[0].parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.state.status).toBe('ready');
    });

    it('keeps a restored call id ambiguous when a response reuses it', async () => {
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-continuation'), finishChunk()],
        ],
        onToolCall: () => undefined,
        sendAutomaticallyWhen: () => true,
      });
      setup.chat.messages = [
        {
          id: 'assistant-restored',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'restored' },
            },
          ],
        },
      ];

      await setup.chat.sendMessage({ text: 'new search' });
      await setup.chat.addToolResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'restored-delayed' },
      });

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(setup.state.status).toBe('ready');
    });

    it('ignores a public result when an older message is restored after a live owner', async () => {
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-continuation'), finishChunk()],
        ],
        onToolCall: () => undefined,
        sendAutomaticallyWhen: () => true,
      });

      await setup.chat.sendMessage({ text: 'new search' });
      setup.chat.messages = [
        {
          id: 'assistant-old',
          role: 'assistant',
          parts: [
            {
              type: 'tool-search',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { q: 'old' },
            },
          ],
        },
        ...setup.chat.messages,
      ];

      await setup.chat.addToolResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'old-delayed' },
      });

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-old')
          ?.parts[0]
      ).toMatchObject({ state: 'input-available' });
      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({ state: 'input-available' });
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(setup.state.status).toBe('ready');
    });

    it('invokes a client tool once for repeated input chunks in one response', async () => {
      const toolCallStarted = deferred<undefined>();
      const releaseToolResult = deferred<undefined>();
      const onToolCall = jest.fn(({ toolCall }, addToolResult) => {
        toolCallStarted.resolve(undefined);
        return releaseToolResult.promise.then(() =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'client' },
          })
        );
      });
      const repeatedChunk: UIMessageChunk = {
        type: 'tool-input-available',
        toolName: 'search',
        toolCallId: 'call-1',
        input: { q: 'hello' },
      };
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          repeatedChunk,
          repeatedChunk,
          finishChunk(),
        ],
        onToolCall,
        sendAutomaticallyWhen: () => false,
      });

      const result = setup.chat.sendMessage({ text: 'search' });
      await toolCallStarted.promise;
      releaseToolResult.resolve(undefined);
      await result;

      expect(onToolCall).toHaveBeenCalledTimes(1);
      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { owner: 'client' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      expect(setup.state.status).toBe('ready');
    });

    it('keeps a reused call id ambiguous for delayed public results after pruning', async () => {
      let submitDelayedOldResult!: () => Promise<void>;
      const sendAutomaticallyWhen = jest.fn(
        ({ messages }: { messages: UIMessage[] }) =>
          messages.some((message) => message.id === 'assistant-new')
      );
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-continuation'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.q === 'old') {
            submitDelayedOldResult = () =>
              setup.chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { owner: 'old-delayed' },
              });
            return addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
          }
          return;
        },
        sendAutomaticallyWhen,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      await setup.chat.sendMessage({ text: 'second search' });

      setup.chat.messages = setup.chat.messages.filter(
        (message) => message.id !== 'assistant-old'
      );

      await submitDelayedOldResult();

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(
        setup.state.messages
          .find((message) => message.id === 'assistant-new')
          ?.parts.find(
            (part) => 'toolCallId' in part && part.toolCallId === 'call-1'
          )
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(3);
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(2);
      expect(setup.state.status).toBe('ready');
    });

    it('keeps a reused call id ambiguous after every owner is pruned', async () => {
      let submitDelayedOldResult!: () => Promise<void>;
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-latest'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'latest' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-continuation'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.q === 'old') {
            submitDelayedOldResult = () =>
              setup.chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { owner: 'old-delayed' },
              });
            return addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
          }
          return;
        },
        sendAutomaticallyWhen: ({ messages }) =>
          messages.some((message) => message.id === 'assistant-latest'),
      });

      await setup.chat.sendMessage({ text: 'first search' });
      await setup.chat.sendMessage({ text: 'second search' });
      setup.chat.messages = setup.chat.messages.filter(
        (message) =>
          message.id !== 'assistant-old' && message.id !== 'assistant-new'
      );
      await setup.chat.sendMessage({ text: 'third search' });

      await submitDelayedOldResult();

      expect(
        setup.state.messages.find(
          (message) => message.id === 'assistant-latest'
        )?.parts[0]
      ).toMatchObject({
        state: 'input-available',
        input: { q: 'latest' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(3);

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-latest'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'latest' },
        }
      );

      expect(
        setup.state.messages.find(
          (message) => message.id === 'assistant-latest'
        )?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'latest' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(4);
      expect(setup.state.status).toBe('ready');
    });

    it('keeps a call id ambiguous when its first owner is pruned before reuse', async () => {
      let submitDelayedOldResult!: () => Promise<void>;
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-continuation'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.q === 'old') {
            submitDelayedOldResult = () =>
              setup.chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { owner: 'old-delayed' },
              });
            return addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
          }
          return;
        },
        sendAutomaticallyWhen: ({ messages }) =>
          messages.some((message) => message.id === 'assistant-new'),
      });

      await setup.chat.sendMessage({ text: 'first search' });
      setup.chat.messages = setup.chat.messages.filter(
        (message) => message.id !== 'assistant-old'
      );
      await setup.chat.sendMessage({ text: 'second search' });

      await submitDelayedOldResult();

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(
        setup.state.messages.find((message) => message.id === 'assistant-new')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(3);
      expect(setup.state.status).toBe('ready');
    });

    it('keeps a regenerated call ambiguous when the message id is reused', async () => {
      let submitDelayedOldResult!: () => Promise<void>;
      let submitNewScopedResult!: TestChat['addToolResult'];
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-shared'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { owner: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-shared'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { owner: 'new' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.owner === 'old') {
            submitDelayedOldResult = () =>
              setup.chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { owner: 'old-delayed' },
              });
            return addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
          }

          submitNewScopedResult = addToolResult!;
          return;
        },
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      await setup.chat.regenerate({ messageId: 'assistant-shared' });
      await submitDelayedOldResult();

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'input-available',
        input: { owner: 'new' },
      });

      await submitNewScopedResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'new' },
      });

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(setup.state.status).toBe('ready');
    });

    it('ignores a layout result captured before regenerating the same message id', async () => {
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-shared'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { owner: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-shared'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { owner: 'new' },
            },
            finishChunk(),
          ],
        ],
        onToolCall: () => undefined,
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      const oldMessage = setup.state.messages.find(
        (message) => message.id === 'assistant-shared'
      )!;
      await setup.chat.regenerate({ messageId: 'assistant-shared' });

      await setup.chat['~addToolResultForMessage'](oldMessage, {
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'old-layout' },
      });

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'input-available',
        input: { owner: 'new' },
      });
    });

    it('retires a response when its message occurrence is replaced with the same id', async () => {
      let submitOldScopedResult!: TestChat['addToolResult'];
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-shared'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { owner: 'old' },
          },
          finishChunk(),
        ],
        onToolCall: (_options, addToolResult) => {
          submitOldScopedResult = addToolResult!;
        },
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'first search' });
      const replacement = {
        id: 'assistant-shared',
        role: 'assistant' as const,
        parts: [
          {
            type: 'tool-search' as const,
            toolCallId: 'call-1',
            state: 'input-available' as const,
            input: { owner: 'new' },
          },
        ],
      };
      setup.chat.messages = setup.chat.messages.map((message) =>
        message.id === replacement.id ? replacement : message
      );

      await submitOldScopedResult({
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'old-delayed' },
      });

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'input-available',
        input: { owner: 'new' },
      });

      await setup.chat['~addToolResultForMessage'](replacement, {
        tool: 'search',
        toolCallId: 'call-1',
        output: { owner: 'new' },
      });

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
    });

    it('prunes detached tool ownership after every reset', async () => {
      const requestCount = 100;
      const setup = createTestSetup({
        chunksByRequest: Array.from({ length: requestCount }, (_, index) => [
          startChunk(`assistant-${index}`),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: `call-${index}`,
            input: { index },
          },
          finishChunk(),
        ]),
        onToolCall: () => undefined,
        sendAutomaticallyWhen: () => false,
      });

      for (let index = 0; index < requestCount; index++) {
        await setup.chat.sendMessage({ text: `search ${index}` });
        expect((setup.chat as any).responsesByToolCallId.size).toBe(1);
        setup.chat.messages = [];
        setup.chat.resetConversationId();
        expect((setup.chat as any).responsesByToolCallId.size).toBe(0);
      }

      expect(setup.sendMessages).toHaveBeenCalledTimes(requestCount);
      expect(setup.chat.messages).toEqual([]);
      expect((setup.chat as any).responsesByToolCallId.size).toBe(0);
    });

    it('keeps stale public results inert after clearing and resetting', async () => {
      let submitDelayedOldResult!: () => Promise<void>;
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-old'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'old' },
            },
            finishChunk(),
          ],
          [
            startChunk('assistant-new'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'new' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-continuation'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) => {
          if (toolCall.input.q === 'old') {
            submitDelayedOldResult = () =>
              setup.chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { owner: 'old-delayed' },
              });
            return addToolResult!({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { owner: 'old' },
            });
          }
          return;
        },
        sendAutomaticallyWhen: ({ messages }) =>
          messages.some((message) => message.id === 'assistant-new'),
      });

      await setup.chat.sendMessage({ text: 'old search' });
      setup.chat.messages = [];
      setup.chat.resetConversationId();
      await setup.chat.sendMessage({ text: 'new search' });

      await submitDelayedOldResult();

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'input-available',
        input: { q: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);

      await setup.chat['~addToolResultForMessage'](
        messageById(setup.state, 'assistant-new'),
        {
          tool: 'search',
          toolCallId: 'call-1',
          output: { owner: 'new' },
        }
      );

      expect(assistantToolPart(setup.state, 'call-1')).toMatchObject({
        state: 'output-available',
        output: { owner: 'new' },
      });
      expect(setup.sendMessages).toHaveBeenCalledTimes(3);
      expect(setup.state.status).toBe('ready');
    });

    it('settles an awaited client result after a server result for the same call', async () => {
      const toolCallStarted = deferred<undefined>();
      const releaseToolResult = deferred<undefined>();
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'call-1',
              input: { q: 'hello' },
            },
            {
              type: 'tool-output-available',
              toolName: 'search',
              toolCallId: 'call-1',
              output: { owner: 'server' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-2'), finishChunk()],
        ],
        onToolCall: async ({ toolCall }, addToolResult) => {
          toolCallStarted.resolve(undefined);
          await releaseToolResult.promise;
          await addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'client' },
          });
        },
        sendAutomaticallyWhen,
      });

      const send = setup.chat.sendMessage({ text: 'search' });
      await toolCallStarted.promise;
      releaseToolResult.resolve(undefined);

      const outcome = await Promise.race([
        send.then(() => 'settled'),
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timed out'), 100)
        ),
      ]);

      expect(outcome).toBe('settled');
      expect(
        setup.state.messages.find((message) => message.id === 'assistant-1')
          ?.parts[0]
      ).toMatchObject({
        state: 'output-available',
        output: { owner: 'server' },
      });
      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(1);
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(setup.state.status).toBe('ready');
    });

    it('lets an awaited client result replace preliminary server output', async () => {
      const toolCallStarted = deferred<undefined>();
      const releaseToolResult = deferred<undefined>();
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          {
            type: 'tool-output-available',
            toolName: 'search',
            toolCallId: 'call-1',
            output: { owner: 'server', phase: 'partial' },
            preliminary: true,
          },
          finishChunk(),
        ],
        onToolCall: async ({ toolCall }, addToolResult) => {
          toolCallStarted.resolve(undefined);
          await releaseToolResult.promise;
          await addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'client', phase: 'final' },
          });
        },
        sendAutomaticallyWhen: () => false,
      });

      const send = setup.chat.sendMessage({ text: 'search' });
      await toolCallStarted.promise;
      releaseToolResult.resolve(undefined);
      await send;

      const part = setup.state.messages.find(
        (message) => message.id === 'assistant-1'
      )?.parts[0];
      expect(part).toMatchObject({
        state: 'output-available',
        output: { owner: 'client', phase: 'final' },
      });
      expect((part as any).preliminary).toBeUndefined();
      expect((part as any).rawOutput).toBeUndefined();
      expect(setup.state.status).toBe('ready');
    });

    it('merges later server metadata without replacing a committed client result', async () => {
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          {
            type: 'tool-output-available',
            toolName: 'search',
            toolCallId: 'call-1',
            output: { owner: 'server' },
            callProviderMetadata: { openai: { itemId: 'fc_123' } },
            preliminary: true,
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'client' },
          }),
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'search' });

      const part = setup.state.messages.find(
        (message) => message.id === 'assistant-1'
      )?.parts[0] as any;
      expect(part).toMatchObject({
        state: 'output-available',
        output: { owner: 'client' },
        callProviderMetadata: { openai: { itemId: 'fc_123' } },
      });
      expect(part.preliminary).toBeUndefined();
    });

    it('merges metadata from a later input error without replacing a committed client result', async () => {
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          {
            type: 'tool-input-error',
            toolName: 'search',
            toolCallId: 'call-1',
            errorText: 'late input error',
            providerMetadata: { openai: { itemId: 'fc_input' } },
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'client' },
          }),
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'search' });

      expect(setup.state.messages[1].parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'client' },
        callProviderMetadata: { openai: { itemId: 'fc_input' } },
      });
    });

    it('merges metadata from a later output error without replacing a committed client result', async () => {
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          {
            type: 'tool-output-error',
            toolCallId: 'call-1',
            errorText: 'late output error',
            providerMetadata: { openai: { itemId: 'fc_output' } },
          },
          finishChunk(),
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'client' },
          }),
        sendAutomaticallyWhen: () => false,
      });

      await setup.chat.sendMessage({ text: 'search' });

      expect(setup.state.messages[1].parts[0]).toMatchObject({
        state: 'output-available',
        output: { owner: 'client' },
        callProviderMetadata: { openai: { itemId: 'fc_output' } },
      });
    });

    it('continues once after mixed server and client tool results', async () => {
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({
        chunksByRequest: [
          [
            startChunk('assistant-1'),
            {
              type: 'tool-input-available',
              toolName: 'search',
              toolCallId: 'client-call',
              input: { q: 'client' },
            },
            {
              type: 'tool-input-available',
              toolName: 'lookup',
              toolCallId: 'server-call',
              input: { q: 'server' },
              providerExecuted: true,
            },
            {
              type: 'tool-output-available',
              toolName: 'lookup',
              toolCallId: 'server-call',
              output: { owner: 'server' },
            },
            finishChunk(),
          ],
          [startChunk('assistant-2'), finishChunk()],
        ],
        onToolCall: ({ toolCall }, addToolResult) =>
          addToolResult!({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: { owner: 'client' },
          }),
        sendAutomaticallyWhen,
      });

      await setup.chat.sendMessage({ text: 'use both tools' });

      expect(sendAutomaticallyWhen).toHaveBeenCalledTimes(1);
      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(setup.state.status).toBe('ready');
    });

    it('quietly ignores an unknown toolCallId', async () => {
      const sendAutomaticallyWhen = jest.fn(() => true);
      const setup = createTestSetup({ sendAutomaticallyWhen });

      await setup.chat.addToolResult({
        tool: 'search',
        toolCallId: 'missing',
        output: { ok: true },
      });

      expect(setup.state.messages).toEqual([]);
      expect(sendAutomaticallyWhen).not.toHaveBeenCalled();
      expect(setup.sendMessages).not.toHaveBeenCalled();
    });

    it('settles an unknown public result returned from onToolCall', async () => {
      let chat!: TestChat;
      const setup = createTestSetup({
        chunks: [
          startChunk('assistant-1'),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: {},
          },
          finishChunk(),
        ],
        onToolCall: () =>
          chat.addToolResult({
            tool: 'search',
            toolCallId: 'missing',
            output: { ok: true },
          }),
      });
      chat = setup.chat;

      const outcome = await Promise.race([
        chat.sendMessage({ text: 'search' }).then(() => 'settled'),
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timed out'), 100)
        ),
      ]);

      expect(outcome).toBe('settled');
      expect(setup.state.status).toBe('ready');
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
    });

    it('does not let a stopped response rejection overwrite the next response', async () => {
      const firstRequest = deferred<ReadableStream<UIMessageChunk>>();
      const setup = createTestSetup({
        sendMessagesFactory: (requestIndex) =>
          requestIndex === 0
            ? firstRequest.promise
            : Promise.resolve(
                chunksToStream([startChunk('assistant-2'), finishChunk()])
              ),
      });

      const stoppedSend = setup.chat.sendMessage({ text: 'first' });
      await Promise.resolve();
      expect(setup.sendMessages).toHaveBeenCalledTimes(1);
      await setup.chat.stop();
      const nextSend = setup.chat.sendMessage({ text: 'second' });
      firstRequest.reject(new Error('stale transport failure'));

      await stoppedSend;
      await nextSend;

      expect(setup.sendMessages).toHaveBeenCalledTimes(2);
      expect(setup.state.status).toBe('ready');
      expect(setup.state.error).toBeUndefined();
    });

    it('tool-input-start, tool-input-delta and tool-input-available drive a part through input-streaming to input-available, repairing partial JSON and triggering onToolCall', async () => {
      const onToolCall = jest.fn();
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-start',
            toolName: 'search',
            toolCallId: 'call-1',
          },
          {
            type: 'tool-input-delta',
            toolName: 'search',
            toolCallId: 'call-1',
            inputTextDelta: '{"q":"hello',
          },
          {
            type: 'tool-input-delta',
            toolName: 'search',
            toolCallId: 'call-1',
            inputTextDelta: '"',
          },
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          },
          finishChunk(),
        ],
        onToolCall,
      });

      await chat.sendMessage({ text: 'hi' });

      const part = assistantPart(state);
      expect(part).toMatchObject({
        type: 'tool-search',
        toolCallId: 'call-1',
        state: 'input-available',
        input: { q: 'hello' },
      });
      expect(onToolCall).toHaveBeenCalledTimes(1);
      expect(onToolCall).toHaveBeenCalledWith(
        {
          toolCall: expect.objectContaining({
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hello' },
          }),
        },
        expect.any(Function)
      );
    });

    it('repairs partial JSON during streaming and exposes intermediate input on rawInput', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-start',
            toolName: 'search',
            toolCallId: 'call-1',
          },
          {
            type: 'tool-input-delta',
            toolName: 'search',
            toolCallId: 'call-1',
            inputTextDelta: '{"q":"hel',
          },
        ],
      });

      await chat.sendMessage({ text: 'hi' });

      const part = assistantPart(state);
      expect(part.state).toBe('input-streaming');
      expect(part.rawInput).toBe('{"q":"hel');
      expect(part.input).toEqual({ q: 'hel' });
    });

    it('does not trigger onToolCall when providerExecuted is true', async () => {
      const onToolCall = jest.fn();
      const { chat } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hi' },
            providerExecuted: true,
          },
          finishChunk(),
        ],
        onToolCall,
      });

      await chat.sendMessage({ text: 'hi' });
      expect(onToolCall).not.toHaveBeenCalled();
    });

    it('tool-output-available strips rawOutput and preliminary, sets output', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hi' },
          },
          {
            type: 'data-tool-output-delta',
            data: { toolCallId: 'call-1', toolName: 'search', delta: '{"r":1' },
          },
          {
            type: 'tool-output-available',
            toolName: 'search',
            toolCallId: 'call-1',
            output: { r: 1 },
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const part = assistantPart(state);
      expect(part).toMatchObject({
        state: 'output-available',
        input: { q: 'hi' },
        output: { r: 1 },
      });
      expect(part.rawOutput).toBeUndefined();
      expect(part.preliminary).toBeUndefined();
    });

    it('keeps a final server result after preliminary output for a client-owned tool', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hi' },
          },
          {
            type: 'tool-output-available',
            toolName: 'search',
            toolCallId: 'call-1',
            output: { r: 'partial' },
            preliminary: true,
          },
          {
            type: 'tool-output-available',
            toolName: 'search',
            toolCallId: 'call-1',
            output: { r: 'final' },
          },
          finishChunk(),
        ],
        onToolCall: () => Promise.resolve(),
      });

      await chat.sendMessage({ text: 'hi' });

      expect(assistantPart(state)).toMatchObject({
        state: 'output-available',
        output: { r: 'final' },
      });
    });
  });

  describe('tool-input-error', () => {
    it('transitions an in-progress part to output-error, moving the partial input to rawInput and preserving provider metadata', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-start',
            toolName: 'search',
            toolCallId: 'call-1',
          },
          {
            type: 'tool-input-delta',
            toolName: 'search',
            toolCallId: 'call-1',
            inputTextDelta: '{"q":',
          },
          {
            type: 'tool-input-error',
            toolName: 'search',
            toolCallId: 'call-1',
            input: '{"q":',
            errorText: 'truncated args',
            providerMetadata: { openai: { itemId: 'fc_123' } },
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const part = assistantPart(state);
      expect(part).toMatchObject({
        type: 'tool-search',
        toolCallId: 'call-1',
        state: 'output-error',
        input: undefined,
        rawInput: '{"q":',
        errorText: 'truncated args',
        callProviderMetadata: { openai: { itemId: 'fc_123' } },
      });
    });

    it('preserves a dict-shaped chunk input on rawInput', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-error',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { partial: true },
            errorText: 'bad args',
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const part = assistantPart(state);
      expect(part.rawInput).toEqual({ partial: true });
      expect(part.input).toBeUndefined();
    });

    it('falls back to the prior part rawInput when the chunk omits input', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-start',
            toolName: 'search',
            toolCallId: 'call-1',
          },
          {
            type: 'tool-input-delta',
            toolName: 'search',
            toolCallId: 'call-1',
            inputTextDelta: '{"q":"buffered',
          },
          {
            type: 'tool-input-error',
            toolName: 'search',
            toolCallId: 'call-1',
            errorText: 'agent forgot to echo input',
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const part = assistantPart(state);
      expect(part.state).toBe('output-error');
      expect(part.input).toBeUndefined();
      expect(part.rawInput).toBe('{"q":"buffered');
    });

    it('creates a new output-error part when no prior part exists (degenerate stream where tool-input-start never fired)', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-error',
            toolName: 'search',
            toolCallId: 'call-orphan',
            input: '   ',
            errorText: 'unbounded whitespace',
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const assistant = state.messages.find((m) => m.role === 'assistant')!;
      expect(assistant.parts).toHaveLength(1);
      expect(assistant.parts[0]).toMatchObject({
        type: 'tool-search',
        toolCallId: 'call-orphan',
        state: 'output-error',
        input: undefined,
        rawInput: '   ',
        errorText: 'unbounded whitespace',
      });
    });
  });

  describe('tool-output-error', () => {
    it('updates an existing part to output-error, preserving its prior input and inheriting fields the chunk omits', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hi' },
            providerExecuted: true,
          },
          {
            type: 'tool-output-error',
            toolCallId: 'call-1',
            errorText: 'tool blew up',
            providerMetadata: { openai: { itemId: 'fc_456' } },
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const part = assistantPart(state);
      expect(part).toMatchObject({
        type: 'tool-search',
        toolCallId: 'call-1',
        state: 'output-error',
        input: { q: 'hi' },
        errorText: 'tool blew up',
        providerExecuted: true,
        callProviderMetadata: { openai: { itemId: 'fc_456' } },
      });
      expect(part.output).toBeUndefined();
    });

    it('strips rawOutput and preliminary from the prior part', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { q: 'hi' },
          },
          {
            type: 'data-tool-output-delta',
            data: { toolCallId: 'call-1', toolName: 'search', delta: '{' },
          },
          {
            type: 'tool-output-error',
            toolCallId: 'call-1',
            errorText: 'execution failed',
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const part = assistantPart(state);
      expect(part.state).toBe('output-error');
      expect(part.rawOutput).toBeUndefined();
      expect(part.preliminary).toBeUndefined();
      expect(part.output).toBeUndefined();
    });

    it('silently drops when no prior part exists', async () => {
      const { chat, state } = createTestSetup({
        chunks: [
          startChunk(),
          {
            type: 'tool-output-error',
            toolCallId: 'unknown',
            errorText: 'oops',
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'hi' });
      const assistant = state.messages.find((m) => m.role === 'assistant')!;
      expect(assistant.parts).toHaveLength(0);
    });
  });

  describe('outbound message body', () => {
    it('round-trips rawInput on an output-error tool part through transport.sendMessages on the next turn', async () => {
      const { chat, sendMessages } = createTestSetup({
        chunks: [
          startChunk('msg-1'),
          {
            type: 'tool-input-error',
            toolName: 'search',
            toolCallId: 'call-1',
            input: '{"q":',
            errorText: 'truncated args',
          },
          finishChunk(),
        ],
      });

      await chat.sendMessage({ text: 'first' });
      // Swap stream for second turn so we can capture the outbound messages.
      sendMessages.mockResolvedValueOnce(
        chunksToStream([startChunk('msg-2'), finishChunk()])
      );
      await chat.sendMessage({ text: 'second' });

      const secondCall = sendMessages.mock.calls[1][0];
      const assistantMessage = secondCall.messages.find(
        (m) => m.role === 'assistant'
      )!;
      const toolPart: any = assistantMessage.parts.find(
        (p) => 'toolCallId' in p && (p as any).toolCallId === 'call-1'
      );
      expect(toolPart).toMatchObject({
        state: 'output-error',
        rawInput: '{"q":',
        errorText: 'truncated args',
      });
      // And it survives JSON serialization.
      const serialized = JSON.parse(JSON.stringify(secondCall.messages));
      const roundTrippedPart = serialized
        .find((m: any) => m.role === 'assistant')
        .parts.find((p: any) => p.toolCallId === 'call-1');
      expect(roundTrippedPart.rawInput).toBe('{"q":');
    });
  });

  describe('verbatim AI SDK 5 server stream', () => {
    // Captured verbatim from a real AI SDK 5 server where the model produced
    // malformed tool-call JSON (a missing closing brace).
    const REAL_ERROR_STREAM = [
      'data: {"type":"start"}',
      'data: {"type":"start-step"}',
      'data: {"type":"tool-input-start","toolCallId":"call_1","toolName":"algolia_search_index"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"{\\""}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"index"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"Name"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"\\":\\""}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"sh"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"oes"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"_index"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"\\",\\""}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"query"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"\\":\\""}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"running"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":" shoes"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":" under"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":" $"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"100"}',
      'data: {"type":"tool-input-delta","toolCallId":"call_1","inputTextDelta":"\\""}',
      'data: {"type":"tool-input-error","toolCallId":"call_1","toolName":"algolia_search_index","input":"{\\"indexName\\":\\"shoes_index\\",\\"query\\":\\"running shoes under $100\\"","providerMetadata":{"openai":{"itemId":"fc_1"}},"errorText":"Invalid input for tool algolia_search_index: JSON parsing failed: Text: {\\"indexName\\":\\"shoes_index\\",\\"query\\":\\"running shoes under $100\\".\\nError message: Expected \',\' or \'}\' after property value in JSON at position 61 (line 1 column 62)"}',
      'data: {"type":"tool-output-error","toolCallId":"call_1","errorText":"Invalid input for tool algolia_search_index: JSON parsing failed: Text: {\\"indexName\\":\\"shoes_index\\",\\"query\\":\\"running shoes under $100\\".\\nError message: Expected \',\' or \'}\' after property value in JSON at position 61 (line 1 column 62)"}',
      'data: {"type":"finish-step"}',
      'data: {"type":"start-step"}',
      'data: {"type":"text-start","id":"msg_1","providerMetadata":{"openai":{"itemId":"msg_1"}}}',
      'data: {"type":"text-delta","id":"msg_1","delta":"Sorry"}',
      'data: {"type":"text-delta","id":"msg_1","delta":","}',
      'data: {"type":"text-delta","id":"msg_1","delta":" search"}',
      'data: {"type":"text-delta","id":"msg_1","delta":" is"}',
      'data: {"type":"text-delta","id":"msg_1","delta":" unavailable"}',
      'data: {"type":"text-delta","id":"msg_1","delta":" right"}',
      'data: {"type":"text-delta","id":"msg_1","delta":" now"}',
      'data: {"type":"text-delta","id":"msg_1","delta":"."}',
      'data: {"type":"text-end","id":"msg_1","providerMetadata":{"openai":{"itemId":"msg_1"}}}',
      'data: {"type":"finish-step"}',
      'data: {"type":"finish","finishReason":"stop"}',
      'data: [DONE]',
    ].join('\n\n');

    const TOOL_CALL_ID = 'call_1';

    it('lands the malformed tool call in output-error then recovers with the apology text', async () => {
      const onToolCall = jest.fn();
      const { chat, state } = createTestSetup({
        sse: REAL_ERROR_STREAM,
        onToolCall,
      });

      await chat.sendMessage({ text: 'find running shoes under $100' });

      const assistant = state.messages.find((m) => m.role === 'assistant')!;

      // The model never produced valid input, so the client-side tool handler
      // must never fire.
      expect(onToolCall).not.toHaveBeenCalled();

      const toolPart: any = assistant.parts.find(
        (p) => 'toolCallId' in p && (p as any).toolCallId === TOOL_CALL_ID
      );
      expect(toolPart).toMatchObject({
        type: 'tool-algolia_search_index',
        state: 'output-error',
        input: undefined,
      });
      // `tool-input-error` carries the partial JSON the model emitted; it is
      // preserved on `rawInput` and survives the later `tool-output-error`.
      expect(toolPart.rawInput).toBe(
        '{"indexName":"shoes_index","query":"running shoes under $100"'
      );
      // The final errorText is the one from `tool-output-error`.
      expect(toolPart.errorText).toContain('JSON parsing failed');
      // `providerMetadata` rode in on `tool-input-error` and must survive the
      // later `tool-output-error` (which carries none), mapped onto the part's
      // `callProviderMetadata`.
      expect(toolPart.callProviderMetadata).toEqual({
        openai: {
          itemId: 'fc_1',
        },
      });

      // The recovery text streamed after the error is assembled in full.
      const textPart: any = assistant.parts.find((p) => p.type === 'text');
      expect(textPart).toMatchObject({
        state: 'done',
        text: 'Sorry, search is unavailable right now.',
      });
    });
  });
});
