/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { createChatRecordsStore } from 'instantsearch-ui-components';

import { AbstractChat } from '../../ai-lite';
import { getChatTurnState } from '../turnState';

import type { ChatState, UIMessage } from '../../ai-lite';
import type { ClientSideTool } from 'instantsearch-ui-components';

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

function createChat(
  status: ChatState<UIMessage>['status'],
  parts: UIMessage['parts'],
  metadata?: unknown
) {
  const state = new InMemoryChatState();
  state.status = status;
  state.messages = [{ id: '1', role: 'assistant', parts, metadata }];

  return new TestChat({ state });
}

function createTool(overrides: Partial<ClientSideTool> = {}): ClientSideTool {
  return {
    layoutComponent: () => null as unknown as JSX.Element,
    addToolResult: jest.fn(),
    applyFilters: jest.fn(),
    ...overrides,
  };
}

function turnState(
  chat: ReturnType<typeof createChat>,
  {
    tools = {},
    showReasoning = false,
  }: { tools?: Record<string, ClientSideTool>; showReasoning?: boolean } = {}
) {
  return getChatTurnState({
    chat,
    tools,
    showReasoning,
    indexUiState: {},
    setIndexUiState: jest.fn(),
    getFallbackRecords: () => createChatRecordsStore(),
    onReload: jest.fn(),
    onClose: jest.fn(),
    onNewConversation: jest.fn(),
    setInput: jest.fn(),
    open: true,
  });
}

function run(...args: Parameters<typeof turnState>) {
  return turnState(...args).showLoader;
}

const textPart: UIMessage['parts'][number] = {
  type: 'text',
  text: 'Here you go',
  state: 'streaming',
};

const toolPart = (
  state: 'input-streaming' | 'output-available'
): UIMessage['parts'][number] =>
  ({
    type: 'tool-test_tool',
    toolCallId: 'call-1',
    state,
    input: {},
  }) as UIMessage['parts'][number];

describe('getChatTurnState showLoader', () => {
  it.each([['ready'], ['error']] as const)(
    'hides the loader once the request settles (%s)',
    (status) => {
      expect(run(createChat(status, [textPart]))).toBe(false);
    }
  );

  it('shows the loader while awaiting the first part', () => {
    expect(run(createChat('submitted', []))).toBe(true);
  });

  it('hides the loader while prose streams', () => {
    expect(run(createChat('streaming', [textPart]))).toBe(false);
  });

  it('shows the loader once a tool call has settled', () => {
    expect(
      run(createChat('streaming', [toolPart('output-available')]), {
        tools: { test_tool: createTool() },
      })
    ).toBe(true);
  });

  describe('reasoning disclosure', () => {
    const streamingReasoning: UIMessage['parts'] = [
      { type: 'reasoning', text: 'Thinking', state: 'streaming' },
    ];

    it('stands down for a visible, streaming disclosure', () => {
      expect(
        run(createChat('streaming', streamingReasoning), {
          showReasoning: true,
        })
      ).toBe(false);
    });

    it('stays up when the disclosure is not rendered', () => {
      expect(
        run(createChat('streaming', streamingReasoning), {
          showReasoning: false,
        })
      ).toBe(true);
    });

    it('stays up once the reasoning settles', () => {
      expect(
        run(
          createChat('streaming', [
            { type: 'reasoning', text: 'Thought', state: 'done' },
          ]),
          { showReasoning: true }
        )
      ).toBe(true);
    });
  });

  describe('a tool streaming its input', () => {
    it('stands the loader down, since the tool renders as input arrives', () => {
      expect(
        run(createChat('streaming', [toolPart('input-streaming')]), {
          tools: { test_tool: createTool({ streamInput: true }) },
        })
      ).toBe(false);
    });

    it('keeps the loader up when the tool does not stream input', () => {
      expect(
        run(createChat('streaming', [toolPart('input-streaming')]), {
          tools: { test_tool: createTool() },
        })
      ).toBe(true);
    });
  });

  describe('a tool declining the turn', () => {
    // The case that matters: the tool would otherwise have rendered, so nothing
    // else keeps the turn looking in progress.
    const chat = () => createChat('streaming', [toolPart('input-streaming')]);

    it('keeps the loader up', () => {
      expect(
        run(chat(), {
          tools: {
            test_tool: createTool({
              streamInput: true,
              shouldRender: () => false,
            }),
          },
        })
      ).toBe(true);
    });

    it('leaves the decision alone when the tool renders', () => {
      expect(
        run(chat(), {
          tools: {
            test_tool: createTool({
              streamInput: true,
              shouldRender: () => true,
            }),
          },
        })
      ).toBe(false);
    });

    it('passes the tool call and its message to the predicate', () => {
      const shouldRender = jest.fn(() => true);
      const parts = [toolPart('input-streaming')];
      const instance = createChat('streaming', parts, {
        displayResultsEnabled: true,
      });

      run(instance, {
        tools: { test_tool: createTool({ streamInput: true, shouldRender }) },
      });

      expect(shouldRender).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'streaming',
          phase: 'calling-tool',
          message: parts[0],
          parentMessage: instance.messages[0],
        })
      );
    });

    // The MCP server suffixes tool names with the index name.
    it('resolves the tool through the prefix shim', () => {
      const state = new InMemoryChatState();
      state.status = 'streaming';
      state.messages = [
        {
          id: '1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-test_tool_products',
              toolCallId: 'call-1',
              state: 'input-streaming',
              input: {},
            } as UIMessage['parts'][number],
          ],
        },
      ];

      expect(
        run(new TestChat({ state }), {
          tools: {
            test_tool: createTool({
              streamInput: true,
              shouldRender: () => false,
            }),
          },
        })
      ).toBe(true);
    });
  });
});

describe('getChatTurnState', () => {
  it('reports the chat instance as-is for everything but the loader', () => {
    const chat = createChat('streaming', [textPart]);

    expect(turnState(chat)).toEqual({
      phase: chat.phase,
      activePart: chat.activePart,
      hasActiveReasoning: chat.hasActiveReasoning,
      isBusy: chat.isBusy,
      lastMessage: chat.lastMessage,
      showLoader: false,
    });
  });

  it('reports an idle turn when nothing is in flight', () => {
    const chat = createChat('ready', [{ ...textPart, state: 'done' }]);

    expect(turnState(chat)).toEqual({
      phase: 'idle',
      activePart: undefined,
      hasActiveReasoning: false,
      isBusy: false,
      lastMessage: chat.messages[0],
      showLoader: false,
    });
  });
});
