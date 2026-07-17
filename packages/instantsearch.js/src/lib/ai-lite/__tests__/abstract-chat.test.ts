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
    onToolCall?: (options: { toolCall: any }) => void | Promise<void>;
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
        onToolCall: ({ toolCall }) =>
          chat.addToolResult({
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
        onToolCall: ({ toolCall }) => {
          submitOldResult ??= () =>
            setup.chat.addToolResult({
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
      expect(onToolCall).toHaveBeenCalledWith({
        toolCall: expect.objectContaining({
          toolName: 'search',
          toolCallId: 'call-1',
          input: { q: 'hello' },
        }),
      });
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
