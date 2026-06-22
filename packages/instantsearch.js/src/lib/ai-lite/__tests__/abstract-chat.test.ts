/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { AbstractChat } from '../abstract-chat';
import { parseJsonEventStream } from '../stream-parser';

import type {
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
    sse,
    onToolCall,
  }: {
    chunks?: UIMessageChunk[];
    sse?: string;
    onToolCall?: (options: { toolCall: any }) => void | Promise<void>;
  } = { chunks: [] }
) {
  const makeStream = (): ReadableStream<UIMessageChunk> =>
    sse !== undefined ? streamFromSse(sse) : chunksToStream(chunks ?? []);
  const sendMessages = jest.fn(
    (_options: SendMessagesCall): Promise<ReadableStream<UIMessageChunk>> =>
      Promise.resolve(makeStream())
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
    onToolCall,
  });

  return { chat, state, transport, sendMessages };
}

const startChunk = (id = 'msg-1'): UIMessageChunk => ({
  type: 'start',
  messageId: id,
});
const finishChunk = (): UIMessageChunk => ({ type: 'finish' });

function assistantPart(state: InMemoryChatState): any {
  const assistant = state.messages.find((m) => m.role === 'assistant');
  return assistant?.parts[0];
}

describe('AbstractChat.processStreamWithCallbacks', () => {
  describe('tool-input lifecycle (existing chunks)', () => {
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
