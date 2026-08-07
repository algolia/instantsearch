/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 *
 * Streamed-identifier completeness for the Display Results tool.
 *
 * Driven through the production `Chat` reducer rather than hand-built parts,
 * because it is partial-JSON repair closing an open string literal that lets a
 * mid-delta identifier reach `input` looking complete.
 */
import { render, screen } from '@testing-library/react';
import { Chat } from 'instantsearch.js/es/lib/chat';
import React from 'react';

import { createDisplayResultsTool } from '../DisplayResultsTool';

import type {
  ChatComponentContext,
  ClientSideToolComponentProps,
} from 'instantsearch-ui-components';
import type { UIMessageChunk } from 'instantsearch.js/es/lib/ai-lite';
import type { UIMessage } from 'instantsearch.js/es/lib/chat';

type TestResult = { objectID: string; name?: string; __position: number };

const HITS = [
  { objectID: '12', name: 'PREFIX-12' },
  { objectID: '1234', name: 'FULL-1234' },
  { objectID: 'AB"', name: 'PREFIX-ESCAPED' },
  { objectID: 'AB"CD', name: 'FULL-ESCAPED' },
];

const itemComponent = ({ item }: { item: TestResult }) => (
  <div data-testid={`item-${item.objectID}`}>{item.name}</div>
);

function chunkStream(chunks: UIMessageChunk[]) {
  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

/**
 * Streams `deltas` as the display tool's input and returns every committed
 * frame of its message part. No `tool-input-available` is sent, so the final
 * frame is still `input-streaming`, the state that must already render.
 */
async function streamDisplayInput(deltas: string[]) {
  const frames: Array<ClientSideToolComponentProps['context']['message']> = [];
  const chat = new Chat<UIMessage>({
    persistence: false,
    transport: {
      sendMessages: () =>
        Promise.resolve(
          chunkStream([
            { type: 'start', messageId: 'msg-1' },
            {
              type: 'tool-input-start',
              toolName: 'algolia_display_results',
              toolCallId: 'display',
            },
            ...deltas.map((inputTextDelta) => ({
              type: 'tool-input-delta' as const,
              toolName: 'algolia_display_results',
              toolCallId: 'display',
              inputTextDelta,
            })),
          ] as UIMessageChunk[])
        ),
      reconnectToStream: () => Promise.resolve(null),
    },
    // Mirrors what `connectChat` derives from the tool's `streamInput: true`.
    shouldRepairToolInput: () => true,
  });

  chat._state._messagesCallbacks.add(() => {
    const parts = chat.messages[chat.messages.length - 1]?.parts ?? [];
    const part = parts.find((candidate) =>
      candidate.type.startsWith('tool-algolia_display_results')
    );
    if (part) {
      frames.push({
        ...part,
      } as ClientSideToolComponentProps['context']['message']);
    }
  });

  await chat.sendMessage({ text: 'show me shoes' });
  return frames;
}

function renderFrame(part: ClientSideToolComponentProps['context']['message']) {
  const tool = createDisplayResultsTool<TestResult>(itemComponent);
  const LayoutComponent = tool.layoutComponent!;
  const messages = [
    {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index',
          toolCallId: 'search',
          state: 'output-available',
          input: {},
          output: { hits: HITS },
        },
        part,
      ],
    },
  ] as unknown as ChatComponentContext['messages'];

  const { unmount } = render(
    <LayoutComponent
      context={{
        messages,
        status: 'streaming',
        isClearing: false,
        open: true,
        maximized: false,
        tools: {},
        regenerate: jest.fn(),
        stop: jest.fn(),
        onReload: jest.fn(),
        onClose: jest.fn(),
        message: part,
        applyFilters: jest.fn(),
        indexUiState: {},
        addToolResult: jest.fn(),
        setIndexUiState: jest.fn(),
        sendEvent: jest.fn(),
      }}
    />
  );
  const visible = HITS.filter((hit) =>
    screen.queryByTestId(`item-${hit.objectID}`)
  ).map((hit) => hit.name);
  unmount();
  return visible;
}

const renderAllFrames = (
  frames: Array<ClientSideToolComponentProps['context']['message']>
) => frames.map(renderFrame);

describe('display results, streamed identifier completeness', () => {
  test('a split identifier never renders the record its prefix matches', async () => {
    const frames = await streamDisplayInput([
      '{"intro":"Top picks","groups":[{"title":"Best value","results":[{"objectID":"12',
      '34"}]}]}',
    ]);

    const midFrame = frames.find(
      (frame) => (frame as any).input?.groups?.[0]?.results?.length
    ) as any;
    expect(midFrame.rawInput).toContain('"objectID":"12');
    expect(midFrame.input.groups[0].results[0].objectID).toBe('12');

    const rendered = renderAllFrames(frames);
    expect(rendered.flat()).not.toContain('PREFIX-12');
    expect(rendered[rendered.length - 1]).toEqual(['FULL-1234']);
  });

  test('a split escaped identifier never renders the record its decoded prefix matches', async () => {
    const frames = await streamDisplayInput([
      '{"groups":[{"results":[{"objectID":"AB\\"',
      'CD"}]}]}',
    ]);

    // Repair decodes the escape, so `input` carries `AB"` while the raw text
    // still carries the escape sequence.
    const midFrame = frames.find(
      (frame) => (frame as any).input?.groups?.[0]?.results?.length
    ) as any;
    expect(midFrame.input.groups[0].results[0].objectID).toBe('AB"');
    expect(midFrame.rawInput).toContain('AB\\"');

    const rendered = renderAllFrames(frames);
    expect(rendered.flat()).not.toContain('PREFIX-ESCAPED');
    expect(rendered[rendered.length - 1]).toEqual(['FULL-ESCAPED']);
  });

  test('a split identifier is withheld when every path key uses an escaped spelling', async () => {
    // All three path keys decode to the names the payload is read by, so the
    // renderer sees an ordinary group while the raw text spells none of them.
    const frames = await streamDisplayInput([
      '{"gro\\u0075ps":[{"res\\u0075lts":[{"object\\u0049D":"12',
      '34"}]}]}',
    ]);

    const midFrame = frames.find(
      (frame) => (frame as any).input?.groups?.[0]?.results?.length
    ) as any;
    expect(midFrame.input.groups[0].results[0].objectID).toBe('12');
    expect(midFrame.rawInput).not.toContain('objectID');
    expect(midFrame.rawInput).not.toContain('groups');
    expect(midFrame.rawInput).not.toContain('results');

    const rendered = renderAllFrames(frames);
    expect(rendered.flat()).not.toContain('PREFIX-12');
    expect(rendered[rendered.length - 1]).toEqual(['FULL-1234']);
  });

  test('a fully emitted single result renders while input is still streaming', async () => {
    const frames = await streamDisplayInput([
      '{"intro":"Top picks","groups":[{"title":"Best value","results":[{"objectID":"1234"}]}]}',
    ]);
    const last = frames[frames.length - 1];

    expect(last.state).toBe('input-streaming');
    expect(renderFrame(last)).toEqual(['FULL-1234']);
  });

  test('a completed result stays visible when a later truncated field repeats its identifier', async () => {
    const frames = await streamDisplayInput([
      '{"groups":[{"results":[{"objectID":"1234"}],"why":"1234',
    ]);
    const last = frames[frames.length - 1] as any;

    // The open string is a `why` value whose text equals the identifier above it.
    expect(last.state).toBe('input-streaming');
    expect(last.input.groups[0].results[0].objectID).toBe('1234');
    expect(renderFrame(last)).toEqual(['FULL-1234']);
  });

  test('a persisted intermediate frame cannot restore the record its prefix matches', async () => {
    const frames = await streamDisplayInput([
      '{"groups":[{"results":[{"objectID":"12',
    ]);
    const last = frames[frames.length - 1];

    // `Chat` persists with `JSON.stringify(this.messages)`, so a stream aborted
    // here is restored verbatim, `rawInput` included.
    const restored = JSON.parse(
      JSON.stringify(last)
    ) as ClientSideToolComponentProps['context']['message'];

    expect((restored as any).input.groups[0].results[0].objectID).toBe('12');
    expect(renderFrame(restored)).toEqual([]);
  });
});
