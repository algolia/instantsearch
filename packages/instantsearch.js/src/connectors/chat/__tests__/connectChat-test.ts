/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { waitFor } from '@testing-library/dom';
import algoliasearchHelper from 'algoliasearch-helper';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import { Chat } from '../../../lib/chat';
import connectChat from '../connectChat';

import type { UIMessage, ChatTransport } from '../../../lib/ai-lite';
import type { InstantSearch, IndexWidget } from '../../../types';
import type { ChatConnectorParams } from '../connectChat';

jest.mock('../../../lib/utils/sendChatMessageFeedback', () => ({
  sendChatMessageFeedback: jest.fn(() => Promise.resolve(new Response('{}'))),
}));

describe('connectChat', () => {
  const getInitializedWidget = (widgetParams: ChatConnectorParams = {}) => {
    const renderFn = jest.fn();
    const makeWidget = connectChat(renderFn);
    const widget = makeWidget({
      ...(!('agentId' in widgetParams) ? { agentId: 'agentId' } : {}),
      ...widgetParams,
    });

    const helper = algoliasearchHelper(createSearchClient(), '');

    widget.init(createInitOptions({ helper }));

    const getRenderState = () =>
      widget.getWidgetRenderState(createInitOptions({ helper }));

    return { widget, helper, renderFn, getRenderState };
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectChat()({});
      }).toThrowErrorMatchingInlineSnapshot(`
        "The render function is not valid (received type Undefined).

        See documentation: https://www.algolia.com/doc/api-reference/widgets/chat/js/#connector"
      `);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customChat = connectChat(render, unmount);
      const widget = customChat({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.chat',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the render state', () => {
      const { widget, helper } = getInitializedWidget();

      const instantSearchInstance: Pick<
        InstantSearch,
        'client' | 'getUiState'
      > = {
        client: createSearchClient(),
        getUiState: () => ({ indexName: {} }),
      };
      const parent: Pick<IndexWidget, 'getIndexId' | 'setIndexUiState'> = {
        getIndexId: () => 'indexName',
        setIndexUiState: () => {},
      };

      const renderState = widget.getWidgetRenderState(
        createInitOptions({
          helper,
          state: helper.state,
          instantSearchInstance: instantSearchInstance as InstantSearch,
          parent: parent as IndexWidget,
        })
      );

      expect(renderState).toEqual(
        expect.objectContaining({
          input: '',
          open: false,
          isClearing: false,
          feedbackState: {},
          setInput: expect.any(Function),
          setOpen: expect.any(Function),
          setMessages: expect.any(Function),
          clearMessages: expect.any(Function),
          onClearTransitionEnd: expect.any(Function),
          sendEvent: expect.any(Function),
          setIndexUiState: expect.any(Function),
          indexUiState: {},
          tools: {},
          addToolResult: expect.any(Function),
          clearError: expect.any(Function),
          error: undefined,
          id: expect.any(String),
          messages: expect.any(Array),
          regenerate: expect.any(Function),
          resumeStream: expect.any(Function),
          sendMessage: expect.any(Function),
          status: expect.any(String),
          stop: expect.any(Function),
          widgetParams: expect.objectContaining({
            agentId: 'agentId',
          }),
        })
      );
    });
  });

  describe('getRenderState', () => {
    it('merges state', () => {
      const { widget, helper } = getInitializedWidget();

      const instantSearchInstance: Pick<
        InstantSearch,
        'client' | 'getUiState'
      > = {
        client: createSearchClient(),
        getUiState: () => ({ indexName: {} }),
      };
      const parent: Pick<IndexWidget, 'getIndexId' | 'setIndexUiState'> = {
        getIndexId: () => 'indexName',
        setIndexUiState: () => {},
      };

      expect(
        widget.getRenderState(
          {
            // @ts-expect-error
            searchBox: {},
            // @ts-expect-error
            chat: {},
          },
          createInitOptions({
            helper,
            state: helper.state,
            instantSearchInstance: instantSearchInstance as InstantSearch,
            parent: parent as IndexWidget,
          })
        )
      ).toEqual({
        searchBox: {},
        chat: expect.objectContaining({
          input: '',
          open: false,
          isClearing: false,
          setInput: expect.any(Function),
          setOpen: expect.any(Function),
          setMessages: expect.any(Function),
          clearMessages: expect.any(Function),
          onClearTransitionEnd: expect.any(Function),
          sendEvent: expect.any(Function),
          setIndexUiState: expect.any(Function),
          indexUiState: {},
          tools: {},
          addToolResult: expect.any(Function),
          clearError: expect.any(Function),
          error: undefined,
          id: expect.any(String),
          messages: expect.any(Array),
          regenerate: expect.any(Function),
          resumeStream: expect.any(Function),
          sendMessage: expect.any(Function),
          status: expect.any(String),
          stop: expect.any(Function),
          widgetParams: expect.objectContaining({
            agentId: 'agentId',
          }),
        }),
      });
    });

    it('uses custom `type` as key in getRenderState', () => {
      const render = jest.fn();
      const makeWidget = connectChat(render);
      const widget = makeWidget({ type: 'customChat', agentId: 'agentId' });

      const helper = algoliasearchHelper(createSearchClient(), '');

      const instantSearchInstance: Pick<
        InstantSearch,
        'client' | 'getUiState'
      > = {
        client: createSearchClient(),
        getUiState: () => ({ indexName: {} }),
      };
      const parent: Pick<IndexWidget, 'getIndexId' | 'setIndexUiState'> = {
        getIndexId: () => 'indexName',
        setIndexUiState: () => {},
      };

      const result = widget.getRenderState(
        {
          // @ts-expect-error
          searchBox: {},
        },
        createInitOptions({
          helper,
          state: helper.state,
          instantSearchInstance: instantSearchInstance as InstantSearch,
          parent: parent as IndexWidget,
        })
      );

      expect(result).toHaveProperty('customChat');
      // @ts-expect-error access dynamic key
      expect(result.customChat).toEqual(
        expect.objectContaining({
          widgetParams: expect.objectContaining({ type: 'customChat' }),
        })
      );
    });
  });

  it('renders during init and render', () => {
    const { widget, helper, renderFn } = getInitializedWidget();

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { agentId: 'agentId' } }),
      true
    );

    const renderOptions = createRenderOptions({ helper });
    widget.render(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { agentId: 'agentId' } }),
      false
    );
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const unmountFn = jest.fn();
      const makeWidget = connectChat(() => {}, unmountFn);
      const widget = makeWidget({ agentId: 'agentId' });

      const helper = algoliasearchHelper(createSearchClient(), '', {});

      widget.init(createInitOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose();
      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const makeWidget = connectChat(() => {});
      const widget = makeWidget({ agentId: 'agentId' });

      expect(() => widget.dispose()).not.toThrow();
    });
  });

  describe('state management', () => {
    it('updates input state', () => {
      const { getRenderState } = getInitializedWidget();

      const renderState = getRenderState();
      expect(renderState.input).toBe('');

      renderState.setInput('Hello');

      const updatedRenderState = getRenderState();
      expect(updatedRenderState.input).toBe('Hello');
    });

    it('updates open state', () => {
      const { getRenderState } = getInitializedWidget();

      const renderState = getRenderState();
      expect(renderState.open).toBe(false);

      renderState.setOpen(true);

      const updatedRenderState = getRenderState();
      expect(updatedRenderState.open).toBe(true);
    });

    it('updates clearing state when clearMessages is called', () => {
      const { getRenderState } = getInitializedWidget();

      const renderState = getRenderState();

      const message: UIMessage = {
        id: '1',
        role: 'user',
        parts: [{ type: 'text', text: 'Hello' }],
      };
      renderState.setMessages([message]);

      expect(renderState.isClearing).toBe(false);

      renderState.clearMessages();

      const updatedRenderState = getRenderState();
      expect(updatedRenderState.isClearing).toBe(true);
    });

    it('does not change state when clearing empty messages', () => {
      const { getRenderState, renderFn } = getInitializedWidget();

      const renderState = getRenderState();

      if (renderState.messages.length > 0) {
        renderState.setMessages([]);
      }

      const callCountBeforeClear = renderFn.mock.calls.length;
      renderState.clearMessages();

      expect(renderFn.mock.calls.length).toBe(callCountBeforeClear);
    });

    it('clears messages and resets state on transition end', () => {
      const { getRenderState } = getInitializedWidget();

      const renderState = getRenderState();

      const message: UIMessage = {
        id: '1',
        role: 'user',
        parts: [{ type: 'text', text: 'Hello' }],
      };
      renderState.setMessages([message]);
      renderState.clearMessages();

      let updatedRenderState = getRenderState();
      expect(updatedRenderState.isClearing).toBe(true);

      renderState.onClearTransitionEnd();

      updatedRenderState = getRenderState();
      expect(updatedRenderState.isClearing).toBe(false);
      expect(updatedRenderState.messages).toHaveLength(0);
    });

    it('updates messages', () => {
      const { getRenderState } = getInitializedWidget();

      const renderState = getRenderState();
      const newMessages: UIMessage[] = [
        {
          id: '1',
          role: 'user' as const,
          parts: [{ type: 'text', text: 'Hello' }],
        },
      ];

      renderState.setMessages(newMessages);

      const updatedRenderState = getRenderState();
      expect(updatedRenderState.messages).toEqual(newMessages);
    });

    it('has empty feedbackState initially', () => {
      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        feedback: true,
      });

      const renderState = getRenderState();
      expect(renderState.feedbackState).toEqual({});
    });

    it('sets feedbackState to sending when feedback is submitted', () => {
      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        feedback: true,
      });

      const renderState = getRenderState();
      renderState.sendChatMessageFeedback!('msg-1', 1);

      const updatedRenderState = getRenderState();
      expect(updatedRenderState.feedbackState).toEqual({
        'msg-1': 'sending',
      });
    });

    it('sets feedbackState to the vote value after fetch resolves', async () => {
      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        feedback: true,
      });

      const renderState = getRenderState();
      renderState.sendChatMessageFeedback!('msg-1', 1);

      await waitFor(() => {
        expect(getRenderState().feedbackState).toEqual({ 'msg-1': 1 });
      });
    });

    it('prevents double voting on the same message', () => {
      const { sendChatMessageFeedback: mockedFn } = jest.requireMock(
        '../../../lib/utils/sendChatMessageFeedback'
      );
      mockedFn.mockClear();

      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        feedback: true,
      });

      const renderState = getRenderState();
      renderState.sendChatMessageFeedback!('msg-1', 1);
      renderState.sendChatMessageFeedback!('msg-1', 0);

      expect(mockedFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('tool handling', () => {
    it('provides tools in render state', () => {
      const mockTool = {};

      const { getRenderState } = getInitializedWidget({
        tools: {
          testTool: mockTool,
        },
      });

      const renderState = getRenderState();
      expect(renderState.tools).toEqual({
        testTool: {
          ...mockTool,
          addToolResult: expect.any(Function),
          applyFilters: expect.any(Function),
          sendEvent: expect.any(Function),
        },
      });
    });
  });

  describe('default chat instance', () => {
    it('adds a compatibility layer for Algolia MCP Server search tool', async () => {
      const onSearchToolCall = jest.fn();

      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-available", "toolCallId": "call_1", "toolName": "algolia_search_index_movies", "input": {"query": "Toy Story", "attributesToRetrieve": ["year"], "hitsPerPage": 1}}

data: {"type":"tool-output-available","toolCallId":"call_1","output":{"results":[{"hits":[]}]}}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
        tools: { algolia_search_index: { onToolCall: onSearchToolCall } },
      });

      const { chatInstance } = widget;

      // Simulate sending a message that triggers the tool call
      await chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'Trigger tool call' }],
      });

      await waitFor(() => {
        expect(onSearchToolCall).toHaveBeenCalledWith(
          expect.objectContaining({
            toolCallId: 'call_1',
            toolName: 'algolia_search_index_movies',
          })
        );
      });
    });

    it('streams tool input parts from tool-input-delta without tool-input-available', async () => {
      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-start", "toolCallId": "call_1", "toolName": "displayResults"}

data: {"type": "tool-input-delta", "toolCallId": "call_1", "toolName": "displayResults", "inputTextDelta": "{}"}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
      });

      const { chatInstance } = widget;

      await chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'Show me product groups' }],
      });

      await waitFor(() => {
        const lastMessage =
          chatInstance.messages[chatInstance.messages.length - 1];
        expect(lastMessage?.role).toBe('assistant');

        const toolPart = lastMessage?.parts.find(
          (part) =>
            'type' in part &&
            part.type === 'tool-displayResults' &&
            'toolCallId' in part &&
            part.toolCallId === 'call_1'
        ) as
          | {
              state: string;
              rawInput?: string;
              input?: Record<string, unknown>;
            }
          | undefined;

        expect(toolPart?.state).toBe('input-streaming');
        expect(toolPart?.input).toEqual({});
      });
    });

    it('skips JSON repair for tools without streamInput (default)', async () => {
      const { widget } = getInitializedWidget({
        agentId: undefined,
        tools: {
          myTool: {},
        },
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-start", "toolCallId": "call_1", "toolName": "myTool"}

data: {"type": "tool-input-delta", "toolCallId": "call_1", "toolName": "myTool", "inputTextDelta": "{\\"query\\": \\"sho"}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
      });

      const { chatInstance } = widget;

      await chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'search' }],
      });

      await waitFor(() => {
        const lastMessage =
          chatInstance.messages[chatInstance.messages.length - 1];
        const toolPart = lastMessage?.parts.find(
          (part) =>
            'type' in part &&
            part.type === 'tool-myTool' &&
            'toolCallId' in part &&
            part.toolCallId === 'call_1'
        ) as
          | {
              state: string;
              rawInput?: string;
              input?: unknown;
            }
          | undefined;

        expect(toolPart?.state).toBe('input-streaming');
        // Input is not repaired since streamInput is not set (default)
        expect(toolPart?.input).toBeUndefined();
        // Raw input is still accumulated
        expect(toolPart?.rawInput).toBe('{"query": "sho');
      });
    });

    it('repairs JSON for tools with streamInput set to true', async () => {
      const { widget } = getInitializedWidget({
        agentId: undefined,
        tools: {
          myTool: {
            streamInput: true,
          },
        },
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-start", "toolCallId": "call_1", "toolName": "myTool"}

data: {"type": "tool-input-delta", "toolCallId": "call_1", "toolName": "myTool", "inputTextDelta": "{\\"query\\": \\"sho"}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
      });

      const { chatInstance } = widget;

      await chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'search' }],
      });

      await waitFor(() => {
        const lastMessage =
          chatInstance.messages[chatInstance.messages.length - 1];
        const toolPart = lastMessage?.parts.find(
          (part) =>
            'type' in part &&
            part.type === 'tool-myTool' &&
            'toolCallId' in part &&
            part.toolCallId === 'call_1'
        ) as
          | {
              state: string;
              rawInput?: string;
              input?: unknown;
            }
          | undefined;

        expect(toolPart?.state).toBe('input-streaming');
        // Input is repaired since streamInput is true
        expect(toolPart?.input).toEqual({ query: 'sho' });
        expect(toolPart?.rawInput).toBe('{"query": "sho');
      });
    });

    it('accumulates data-tool-output-delta chunks into a parsed partial output', async () => {
      const { widget } = getInitializedWidget({
        agentId: undefined,
        tools: {
          algolia_display_results: {},
        },
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-start", "toolCallId": "call_1", "toolName": "algolia_display_results"}

data: {"type": "tool-input-available", "toolCallId": "call_1", "toolName": "algolia_display_results", "input": {}}

data: {"type": "data-tool-output-delta", "data": {"toolCallId": "call_1", "toolName": "algolia_display_results", "delta": "{\\"intro\\":\\"curated"}, "transient": true}

data: {"type": "data-tool-output-delta", "data": {"toolCallId": "call_1", "toolName": "algolia_display_results", "delta": "\\",\\"groups\\":[{\\"title\\":\\"Shoes\\"}]}"}, "transient": true}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
      });

      const { chatInstance } = widget;

      await chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'display' }],
      });

      await waitFor(() => {
        const lastMessage =
          chatInstance.messages[chatInstance.messages.length - 1];
        const toolPart = lastMessage?.parts.find(
          (part) =>
            'type' in part &&
            part.type === 'tool-algolia_display_results' &&
            'toolCallId' in part &&
            part.toolCallId === 'call_1'
        ) as
          | {
              state: string;
              preliminary?: boolean;
              output?: unknown;
              rawOutput?: string;
            }
          | undefined;

        expect(toolPart?.state).toBe('output-available');
        expect(toolPart?.preliminary).toBe(true);
        expect(toolPart?.output).toEqual({
          intro: 'curated',
          groups: [{ title: 'Shoes' }],
        });
        expect(toolPart?.rawOutput).toBe(
          '{"intro":"curated","groups":[{"title":"Shoes"}]}'
        );
      });
    });

    it('finalizes a streamed tool output with tool-output-available', async () => {
      const { widget } = getInitializedWidget({
        agentId: undefined,
        tools: {
          algolia_display_results: {},
        },
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-start", "toolCallId": "call_1", "toolName": "algolia_display_results"}

data: {"type": "tool-input-available", "toolCallId": "call_1", "toolName": "algolia_display_results", "input": {}}

data: {"type": "data-tool-output-delta", "data": {"toolCallId": "call_1", "toolName": "algolia_display_results", "delta": "{\\"intro\\":\\"cur"}, "transient": true}

data: {"type": "tool-output-available", "toolCallId": "call_1", "toolName": "algolia_display_results", "output": {"intro": "curated", "groups": []}}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
      });

      const { chatInstance } = widget;

      await chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'display' }],
      });

      await waitFor(() => {
        const lastMessage =
          chatInstance.messages[chatInstance.messages.length - 1];
        const toolPart = lastMessage?.parts.find(
          (part) =>
            'type' in part &&
            part.type === 'tool-algolia_display_results' &&
            'toolCallId' in part &&
            part.toolCallId === 'call_1'
        ) as
          | {
              state: string;
              preliminary?: boolean;
              output?: unknown;
              rawOutput?: string;
            }
          | undefined;

        expect(toolPart?.state).toBe('output-available');
        // final output-available without a preliminary flag replaces the partial
        expect(toolPart?.preliminary).toBeUndefined();
        expect(toolPart?.output).toEqual({ intro: 'curated', groups: [] });
        // bookkeeping for rawOutput is cleared once the final output arrives
        expect(toolPart?.rawOutput).toBeUndefined();
      });
    });
  });

  describe('transport configuration', () => {
    it('throws error when neither agentId nor transport is provided', () => {
      const renderFn = jest.fn();
      const makeWidget = connectChat(renderFn);
      const widget = makeWidget({});

      const helper = algoliasearchHelper(createSearchClient(), '', {});

      expect(() => {
        widget.init(createInitOptions({ helper, state: helper.state }));
      }).toThrow('You need to provide either an `agentId` or a `transport`.');
    });

    it('accepts custom transport', () => {
      const customTransport = { api: 'https://custom.api' };

      const { getRenderState } = getInitializedWidget({
        transport: customTransport,
      });

      const renderState = getRenderState();
      expect(renderState.widgetParams).toEqual(
        expect.objectContaining({
          transport: customTransport,
        })
      );
    });
  });

  describe('context', () => {
    function createMockTransport(): ChatTransport<UIMessage> {
      return {
        sendMessages: jest.fn(() =>
          Promise.resolve(
            new ReadableStream({
              start(ctrl) {
                ctrl.close();
              },
            })
          )
        ),
        reconnectToStream: jest.fn(() => Promise.resolve(null)),
      };
    }

    function createTestChat() {
      return new Chat<UIMessage>({ transport: createMockTransport() });
    }

    function createChatWidgetWithContext(
      params: Omit<ChatConnectorParams<UIMessage>, 'transport' | 'agentId'> & {
        chat: Chat<UIMessage>;
      }
    ) {
      const renderFn = jest.fn();
      const makeWidget = connectChat(renderFn);
      const widget = makeWidget({
        ...params,
        transport: { api: 'http://unused' },
      });
      return { widget, renderFn };
    }

    it('prepends context text part when context is a static object', async () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
        context: { currentPage: '/products', locale: 'en-US' },
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];
      await sendMessage({ text: 'Hello' });

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      const call = sendMessageSpy.mock.calls[0][0] as any;
      expect(call.parts).toEqual([
        {
          type: 'text',
          text: '<context>{"currentPage":"/products","locale":"en-US"}</context>',
        },
        { type: 'text', text: 'Hello' },
      ]);
    });

    it('evaluates context function at send time', async () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      let pageUrl = '/page-1';
      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
        context: () => ({ currentPage: pageUrl }),
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];

      await sendMessage({ text: 'first' });
      expect((sendMessageSpy.mock.calls[0][0] as any).parts).toEqual([
        {
          type: 'text',
          text: '<context>{"currentPage":"/page-1"}</context>',
        },
        { type: 'text', text: 'first' },
      ]);

      pageUrl = '/page-2';
      await sendMessage({ text: 'second' });
      expect((sendMessageSpy.mock.calls[1][0] as any).parts).toEqual([
        {
          type: 'text',
          text: '<context>{"currentPage":"/page-2"}</context>',
        },
        { type: 'text', text: 'second' },
      ]);
    });

    it('passes through without modification when no context is set', async () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];
      await sendMessage({ text: 'Hello' });

      expect(sendMessageSpy.mock.calls[0][0]).toEqual({ text: 'Hello' });
    });

    it('prepends context when called with parts', async () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
        context: { page: '/about' },
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];
      await sendMessage({
        parts: [{ type: 'text', text: 'Hi from parts' }],
      });

      expect((sendMessageSpy.mock.calls[0][0] as any).parts).toEqual([
        {
          type: 'text',
          text: '<context>{"page":"/about"}</context>',
        },
        { type: 'text', text: 'Hi from parts' },
      ]);
    });

    it('passes through when called with no message', async () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
        context: { page: '/about' },
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];
      await sendMessage();

      expect(sendMessageSpy.mock.calls[0][0]).toBeUndefined();
    });

    it('sends message without context when context is not serializable', async () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
        context: circular,
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];

      expect(() => sendMessage({ text: 'Hello' })).toWarnDev(
        '[InstantSearch.js]: Could not serialize chat context. The message will be sent without context.'
      );

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy.mock.calls[0][0]).toEqual({ text: 'Hello' });
    });
  });
});
