/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { waitFor } from '@testing-library/dom';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import { Chat } from '../../../lib/chat';
import connectChat from '../connectChat';

import type { UIMessage, ChatTransport } from '../../../lib/ai-lite';
import type { InstantSearch, IndexWidget } from '../../../types';
import type { ChatConnectorParams, ChatCustomInstance } from '../connectChat';

jest.mock('../../../lib/utils/sendChatMessageFeedback', () => ({
  sendChatMessageFeedback: jest.fn(() => Promise.resolve(new Response('{}'))),
}));

describe('connectChat', () => {
  const getInitializedWidget = (widgetParams: ChatConnectorParams = {}) => {
    const renderFn = jest.fn();
    const makeWidget = connectChat(renderFn);
    const widget = makeWidget({
      ...(!('agentId' in widgetParams) ? { agentId: 'agentId' } : {}),
      disableTriggerValidation: true,
      ...widgetParams,
    } as ChatConnectorParams);

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

    it('types requestOptions as agentId-only', () => {
      const assertChatConnectorParams = <TParams extends ChatConnectorParams>(
        params: TParams
      ) => params;
      const assertChatCustomInstanceParams = (
        params: ChatCustomInstance<UIMessage>
      ) => params;
      const customChat = undefined as unknown as Chat<UIMessage>;

      const agentParams = assertChatConnectorParams({
        agentId: 'agentId',
        requestOptions: {
          queryParameters: { cache: false },
          headers: { 'x-algolia-referer': 'chat-widget' },
        },
      });

      const legacyAgentWithTransportParams = assertChatConnectorParams({
        agentId: 'agentId',
        transport: { api: 'https://custom.api' },
      });
      const agentPersistenceParams = assertChatConnectorParams({
        agentId: 'agentId',
        persistence: false,
      });
      const transportPersistenceParams = assertChatConnectorParams({
        transport: { api: 'https://custom.api' },
        persistence: false,
      });

      // @ts-expect-error requestOptions is only valid with agentId
      assertChatConnectorParams({
        transport: { api: 'https://custom.api' },
        requestOptions: {
          queryParameters: { cache: false },
        },
      });

      // @ts-expect-error requestOptions is not valid when a custom transport is provided
      assertChatConnectorParams({
        agentId: 'agentId',
        transport: { api: 'https://custom.api' },
        requestOptions: {
          queryParameters: { cache: false },
        },
      });

      assertChatConnectorParams({
        // @ts-expect-error requestOptions is not valid with a custom chat instance
        chat: customChat,
        requestOptions: {
          queryParameters: { cache: false },
        },
      });

      assertChatCustomInstanceParams({
        chat: customChat,
        // @ts-expect-error persistence is owned by custom chat instances
        persistence: false,
      });

      expect(agentParams.requestOptions?.queryParameters).toEqual({
        cache: false,
      });
      expect(agentParams.requestOptions?.headers).toEqual({
        'x-algolia-referer': 'chat-widget',
      });
      expect(legacyAgentWithTransportParams).toEqual({
        agentId: 'agentId',
        transport: { api: 'https://custom.api' },
      });
      expect(agentPersistenceParams.persistence).toBe(false);
      expect(transportPersistenceParams.persistence).toBe(false);
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
          feedbackState: {},
          setInput: expect.any(Function),
          setOpen: expect.any(Function),
          setMessages: expect.any(Function),
          clearMessages: expect.any(Function),
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
          setInput: expect.any(Function),
          setOpen: expect.any(Function),
          setMessages: expect.any(Function),
          clearMessages: expect.any(Function),
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
      expect.objectContaining({
        widgetParams: expect.objectContaining({ agentId: 'agentId' }),
      }),
      true
    );

    const renderOptions = createRenderOptions({ helper });
    widget.render(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        widgetParams: expect.objectContaining({ agentId: 'agentId' }),
      }),
      false
    );
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const unmountFn = jest.fn();
      const makeWidget = connectChat(() => {}, unmountFn);
      const widget = makeWidget({
        agentId: 'agentId',
        disableTriggerValidation: true,
      });

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

    it('clears messages and resets the conversation when clearMessages is called', () => {
      const { getRenderState } = getInitializedWidget();

      const renderState = getRenderState();
      const conversationIdBeforeClear = renderState.id;

      const message: UIMessage = {
        id: '1',
        role: 'user',
        parts: [{ type: 'text', text: 'Hello' }],
      };
      renderState.setMessages([message]);

      renderState.clearMessages();

      const updatedRenderState = getRenderState();
      expect(updatedRenderState.messages).toHaveLength(0);
      expect(updatedRenderState.id).not.toBe(conversationIdBeforeClear);
    });

    it('renders the rotated conversation id when clearing', () => {
      const { getRenderState, renderFn } = getInitializedWidget();

      const renderState = getRenderState();
      renderState.setMessages([
        { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
      ]);
      const idBeforeClear = getRenderState().id;

      renderFn.mockClear();
      renderState.clearMessages();

      // The render emitted while clearing must observe the rotated id, not the
      // stale one (state that doesn't emit a callback is reset first).
      const lastRenderState =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];
      expect(lastRenderState.id).not.toBe(idBeforeClear);
    });

    it('exits the error state and resets the conversation even with no messages', () => {
      // An error/stream can be set with no messages (e.g. a failed resume), so
      // clearing must not shortcut out on an empty message list.
      const { getRenderState, widget } = getInitializedWidget();

      let renderState = getRenderState();
      renderState.setMessages([]);
      // Simulate an error state with no messages (e.g. a failed resume).
      widget.chatInstance._state.status = 'error';
      widget.chatInstance._state.error = new Error('boom');
      const idBeforeClear = getRenderState().id;

      renderState.clearMessages();

      renderState = getRenderState();
      expect(renderState.messages).toHaveLength(0);
      expect(renderState.status).toBe('ready');
      expect(renderState.id).not.toBe(idBeforeClear);
    });

    it('regenerates the chat id on clear so the server starts a fresh conversation', () => {
      const { getRenderState } = getInitializedWidget();

      const renderState = getRenderState();
      const initialId = renderState.id;

      renderState.setMessages([
        {
          id: '1',
          role: 'user',
          parts: [{ type: 'text', text: 'Hello' }],
        },
      ]);
      renderState.clearMessages();

      const updatedRenderState = getRenderState();
      expect(updatedRenderState.id).toEqual(expect.any(String));
      expect(updatedRenderState.id).not.toBe(initialId);
    });

    it('regenerates the id even when the consumer owns the Chat instance', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: {
          sendMessages: jest.fn(),
          reconnectToStream: jest.fn(),
        },
      });
      const initialId = chatInstance.id;

      const renderFn = jest.fn();
      const widget = connectChat(renderFn)({
        chat: chatInstance,
        transport: { api: 'http://unused' },
      });
      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper }));

      const renderState = widget.getWidgetRenderState(
        createInitOptions({ helper })
      );

      renderState.setMessages([
        {
          id: '1',
          role: 'user',
          parts: [{ type: 'text', text: 'Hello' }],
        },
      ]);
      renderState.clearMessages();

      expect(chatInstance.id).toEqual(expect.any(String));
      expect(chatInstance.id).not.toBe(initialId);
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
          insightsEventContext: {
            agentId: 'agentId',
          },
        },
      });
    });
  });

  describe('default chat instance', () => {
    const cacheKey = 'instantsearch-chat-initial-messages';

    beforeEach(() => {
      sessionStorage.clear();
    });

    it('does not restore messages from sessionStorage when persistence is disabled', () => {
      const previousMessages: UIMessage[] = [
        {
          id: 'previous',
          role: 'user',
          parts: [{ type: 'text', text: 'Previous message' }],
        },
      ];
      sessionStorage.setItem(
        `${cacheKey}-agentId`,
        JSON.stringify(previousMessages)
      );

      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        persistence: false,
      });

      expect(getRenderState().messages).toEqual([]);
    });

    it('does not save messages to sessionStorage when persistence is disabled', () => {
      const previousMessages: UIMessage[] = [
        {
          id: 'previous',
          role: 'user',
          parts: [{ type: 'text', text: 'Previous message' }],
        },
      ];
      const storageKey = `${cacheKey}-agentId`;
      sessionStorage.setItem(storageKey, JSON.stringify(previousMessages));

      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        persistence: false,
      });
      const nextMessages: UIMessage[] = [
        {
          id: 'next',
          role: 'user',
          parts: [{ type: 'text', text: 'Next message' }],
        },
      ];

      getRenderState().setMessages(nextMessages);

      expect(sessionStorage.getItem(storageKey)).toBe(
        JSON.stringify(previousMessages)
      );
    });

    it('applies initialMessages when persistence is disabled', () => {
      const previousMessages: UIMessage[] = [
        {
          id: 'previous',
          role: 'user',
          parts: [{ type: 'text', text: 'Previous message' }],
        },
      ];
      const initialMessages: UIMessage[] = [
        {
          id: 'initial',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Welcome' }],
        },
      ];
      sessionStorage.setItem(
        `${cacheKey}-agentId`,
        JSON.stringify(previousMessages)
      );

      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        persistence: false,
        initialMessages,
      });

      expect(getRenderState().messages).toEqual(initialMessages);
    });

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

    it('renders a guardrail-violation fallbackResponse as assistant history', async () => {
      const fallbackResponse =
        "I'm sorry I couldn't respond to that, please try again with another message.";
      const onError = jest.fn();
      const onFinish = jest.fn();
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          new Response(
            `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "text-start", "id": "msg-1"}

data: {"type": "text-delta", "id": "msg-1", "delta": "If you need help"}

data: {"type": "text-end", "id": "msg-1"}

data: {"type": "finish-step"}

data: {"type": "data-guardrail-violation", "data": {"category": "product_returns", "guardrailType": "input", "fallbackResponse": ${JSON.stringify(
              fallbackResponse
            )}}}

data: {"type": "finish"}

data: [DONE]`,
            {
              headers: { 'Content-Type': 'text/event-stream' },
            }
          )
        )
        .mockResolvedValueOnce(
          new Response(`data: {"type":"finish"}\n\ndata: [DONE]`, {
            headers: { 'Content-Type': 'text/event-stream' },
          })
        );
      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: {
          fetch: fetchMock,
        },
        onError,
        onFinish,
      });

      const { chatInstance } = widget;
      const messagesBeforeSend = chatInstance.messages.length;

      await chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'how do I return a product?' }],
      });

      await waitFor(() => {
        expect(chatInstance.status).toBe('ready');
        expect(chatInstance.error).toBeUndefined();
        expect(onError).not.toHaveBeenCalled();
        expect(chatInstance.messages.length).toBe(messagesBeforeSend + 2);
        expect(
          chatInstance.messages[chatInstance.messages.length - 1]
        ).toMatchObject({
          id: 'test-id',
          role: 'assistant',
          parts: [{ type: 'text', text: fallbackResponse, state: 'done' }],
        });
        expect(JSON.stringify(chatInstance.messages)).not.toContain(
          'If you need help'
        );
      });

      const assistant = chatInstance.messages[chatInstance.messages.length - 1];

      expect(onFinish).toHaveBeenCalledWith({
        message: assistant,
        messages: chatInstance.messages,
        isAbort: false,
        isDisconnect: false,
        isError: false,
      });

      await chatInstance.sendMessage({
        id: 'follow-up-id',
        role: 'user',
        parts: [{ type: 'text', text: 'what can you help with?' }],
      });

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });

      const [, secondRequest] = fetchMock.mock.calls[1];
      const secondRequestBody = JSON.parse(
        (secondRequest as RequestInit).body as string
      );
      expect(secondRequestBody.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-id',
            role: 'assistant',
            parts: [{ type: 'text', text: fallbackResponse, state: 'done' }],
          }),
        ])
      );
    });

    it('renders a generic assistant message when fallbackResponse is missing', async () => {
      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "data-guardrail-violation", "data": {"category": "x", "guardrailType": "input"}}

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
        parts: [{ type: 'text', text: 'blocked input' }],
      });

      await waitFor(() => {
        expect(chatInstance.status).toBe('ready');
        expect(chatInstance.error).toBeUndefined();
        expect(
          chatInstance.messages[chatInstance.messages.length - 1]
        ).toMatchObject({
          id: 'test-id',
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text: 'Sorry, we are not able to generate a response at the moment.',
              state: 'done',
            },
          ],
        });
      });
    });
  });

  describe('transport configuration', () => {
    it('throws error when neither agentId nor transport is provided', () => {
      const renderFn = jest.fn();
      const makeWidget = connectChat(renderFn);
      const widget = makeWidget({ disableTriggerValidation: true });

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

    describe('agent endpoint requests', () => {
      const originalFetch = global.fetch;
      let fetchMock: jest.Mock;

      beforeEach(() => {
        fetchMock = jest.fn(() =>
          Promise.resolve(
            new Response(`data: {"type":"finish"}\n\ndata: [DONE]`, {
              headers: { 'Content-Type': 'text/event-stream' },
            })
          )
        );
        global.fetch = fetchMock as unknown as typeof fetch;
      });

      afterEach(() => {
        global.fetch = originalFetch;
      });

      function getRequestPayload() {
        const [url, init] = fetchMock.mock.calls[0];
        return {
          url: String(url),
          headers: init.headers as Record<string, string>,
          body: JSON.parse(init.body as string),
        };
      }

      it('sends the standard Algolia headers on agent requests', async () => {
        const { widget } = getInitializedWidget({ agentId: 'agentId' });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { headers } = getRequestPayload();
        expect(headers).toEqual(
          expect.objectContaining({
            'x-algolia-application-id': 'appId',
            'x-algolia-api-key': 'apiKey',
          })
        );
        expect(headers).toHaveProperty('x-algolia-agent');
      });

      it('appends `; chat` to the x-algolia-agent header on agent requests', async () => {
        const client = Object.assign(createSearchClient(), {
          appId: 'appId',
          apiKey: 'apiKey',
          transporter: { userAgent: { value: 'instantsearch.js (4.95.0)' } },
        });
        const instantSearchInstance = createInstantSearch({ client });

        const renderFn = jest.fn();
        const widget = connectChat(renderFn)({ agentId: 'agentId' });

        widget.init(
          createInitOptions({
            helper: instantSearchInstance.helper!,
            instantSearchInstance,
          })
        );

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { headers } = getRequestPayload();
        expect(headers['x-algolia-agent']).toBe(
          'instantsearch.js (4.95.0); chat'
        );
      });

      it('sends persistent query parameters on agent requests', async () => {
        const { widget } = getInitializedWidget({
          agentId: 'agentId',
          requestOptions: {
            queryParameters: {
              cache: false,
              hitsPerPage: 4,
              explain: true,
              userToken: 'user-1',
            },
          },
        });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { url } = getRequestPayload();
        const searchParams = new URL(url).searchParams;
        expect(searchParams.get('compatibilityMode')).toBe('ai-sdk-5');
        expect(searchParams.get('cache')).toBe('false');
        expect(searchParams.get('hitsPerPage')).toBe('4');
        expect(searchParams.get('explain')).toBe('true');
        expect(searchParams.get('userToken')).toBe('user-1');
      });

      it('keeps the built-in compatibility mode on agent requests', async () => {
        const { widget } = getInitializedWidget({
          agentId: 'agentId',
          requestOptions: {
            queryParameters: {
              compatibilityMode: 'custom',
              userToken: 'user-1',
            },
          },
        });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { url } = getRequestPayload();
        const searchParams = new URL(url).searchParams;
        expect(searchParams.get('compatibilityMode')).toBe('ai-sdk-5');
        expect(searchParams.get('userToken')).toBe('user-1');
      });

      it('sends persistent headers on agent requests', async () => {
        const { widget } = getInitializedWidget({
          agentId: 'agentId',
          requestOptions: {
            headers: {
              'x-algolia-referer': 'chat-widget',
              'x-session-id': 'session-1',
            },
          },
        });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { headers } = getRequestPayload();
        expect(headers).toEqual(
          expect.objectContaining({
            'x-algolia-application-id': 'appId',
            'x-algolia-api-key': 'apiKey',
            'x-algolia-referer': 'chat-widget',
            'x-session-id': 'session-1',
          })
        );
      });

      it('sends persistent Headers instance on agent requests', async () => {
        const { widget } = getInitializedWidget({
          agentId: 'agentId',
          requestOptions: {
            headers: new Headers({
              'x-algolia-referer': 'chat-widget',
              'x-session-id': 'session-1',
            }),
          },
        });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { headers } = getRequestPayload();
        expect(headers).toEqual(
          expect.objectContaining({
            'x-algolia-application-id': 'appId',
            'x-algolia-api-key': 'apiKey',
            'x-algolia-referer': 'chat-widget',
            'x-session-id': 'session-1',
          })
        );
      });

      it('keeps the x-algolia-agent chat marker even when requestOptions tries to override it', async () => {
        const { widget } = getInitializedWidget({
          agentId: 'agentId',
          requestOptions: {
            headers: {
              'x-algolia-application-id': 'spoofed-app',
              'x-algolia-api-key': 'spoofed-key',
              'x-algolia-agent': 'spoofed-agent',
              'x-algolia-referer': 'chat-widget',
            },
          },
        });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { headers } = getRequestPayload();
        expect(headers['x-algolia-application-id']).toBe('appId');
        expect(headers['x-algolia-api-key']).toBe('apiKey');
        expect(headers['x-algolia-agent']).toContain('; chat');
        expect(headers['x-algolia-agent']).not.toBe('spoofed-agent');
        expect(headers['x-algolia-referer']).toBe('chat-widget');
      });

      it('does not register `chat` on the search client user-agent', () => {
        const addAlgoliaAgent = jest.fn();
        const client = Object.assign(createSearchClient(), {
          addAlgoliaAgent,
        });
        const instantSearchInstance = createInstantSearch({ client });

        const renderFn = jest.fn();
        const widget = connectChat(renderFn)({ agentId: 'agentId' });

        widget.init(
          createInitOptions({
            helper: instantSearchInstance.helper!,
            instantSearchInstance,
          })
        );

        // The chat connector must not register `chat` on the shared search
        // client — otherwise every subsequent search request would carry it
        // in `x-algolia-agent`.
        expect(addAlgoliaAgent).not.toHaveBeenCalledWith(
          expect.stringContaining('chat')
        );
      });

      it('forwards the x-algolia-referer header from sendMessage options', async () => {
        const { widget } = getInitializedWidget({ agentId: 'agentId' });

        await widget.chatInstance.sendMessage(
          { text: 'hello' },
          { headers: { 'x-algolia-referer': 'prompt-suggestions' } }
        );

        const { headers } = getRequestPayload();
        expect(headers).toMatchObject({
          'x-algolia-referer': 'prompt-suggestions',
        });
      });

      it('lets per-call headers override persistent headers for one request', async () => {
        const { widget } = getInitializedWidget({
          agentId: 'agentId',
          requestOptions: {
            headers: {
              'x-algolia-referer': 'chat-widget',
            },
          },
        });

        await widget.chatInstance.sendMessage(
          { text: 'hello' },
          { headers: { 'x-algolia-referer': 'prompt-suggestions' } }
        );
        await widget.chatInstance.sendMessage({ text: 'follow-up' });

        const firstHeaders = fetchMock.mock.calls[0][1].headers as Record<
          string,
          string
        >;
        const secondHeaders = fetchMock.mock.calls[1][1].headers as Record<
          string,
          string
        >;

        expect(firstHeaders).toHaveProperty(
          'x-algolia-referer',
          'prompt-suggestions'
        );
        expect(secondHeaders).toHaveProperty(
          'x-algolia-referer',
          'chat-widget'
        );
      });

      it('does not carry over the x-algolia-referer to follow-up messages', async () => {
        const { widget } = getInitializedWidget({ agentId: 'agentId' });

        await widget.chatInstance.sendMessage(
          { text: 'hello' },
          { headers: { 'x-algolia-referer': 'prompt-suggestions' } }
        );
        await widget.chatInstance.sendMessage({ text: 'follow-up' });

        const firstHeaders = fetchMock.mock.calls[0][1].headers as Record<
          string,
          string
        >;
        const secondHeaders = fetchMock.mock.calls[1][1].headers as Record<
          string,
          string
        >;

        expect(firstHeaders).toHaveProperty(
          'x-algolia-referer',
          'prompt-suggestions'
        );
        expect(secondHeaders).not.toHaveProperty('x-algolia-referer');
      });

      it('forces cache=false when regenerating with persistent cache query parameter', async () => {
        const { widget } = getInitializedWidget({
          agentId: 'agentId',
          requestOptions: {
            queryParameters: {
              cache: true,
            },
          },
        });

        await widget.chatInstance.regenerate();

        const { url } = getRequestPayload();
        expect(new URL(url).searchParams.get('cache')).toBe('false');
      });

      it('does not duplicate transport metadata in the request body', async () => {
        const { widget } = getInitializedWidget({ agentId: 'agentId' });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const { body } = getRequestPayload();
        expect(Object.keys(body).sort()).toEqual([
          'id',
          'messageId',
          'messages',
        ]);
        expect(body).not.toHaveProperty('headers');
        expect(body).not.toHaveProperty('api');
        expect(body).not.toHaveProperty('credentials');
        expect(body).not.toHaveProperty('body');
        expect(body).not.toHaveProperty('requestMetadata');
      });
    });

    describe('custom transport requests', () => {
      const originalFetch = global.fetch;
      let fetchMock: jest.Mock;

      beforeEach(() => {
        fetchMock = jest.fn(() =>
          Promise.resolve(
            new Response(`data: {"type":"finish"}\n\ndata: [DONE]`, {
              headers: { 'Content-Type': 'text/event-stream' },
            })
          )
        );
        global.fetch = fetchMock as unknown as typeof fetch;
      });

      afterEach(() => {
        global.fetch = originalFetch;
      });

      it('does not leak transport metadata in the default body', async () => {
        const { widget } = getInitializedWidget({
          agentId: undefined,
          transport: { api: 'https://custom.api' },
        });

        await widget.chatInstance.sendMessage({ text: 'hello' });

        const [, init] = fetchMock.mock.calls[0];
        const body = JSON.parse(init.body as string);

        expect(Object.keys(body).sort()).toEqual([
          'id',
          'messageId',
          'messages',
          'trigger',
        ]);
        expect(body).not.toHaveProperty('headers');
        expect(body).not.toHaveProperty('api');
        expect(body).not.toHaveProperty('credentials');
      });
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

    function createChatWidgetWithContext(params: {
      chat: Chat<UIMessage>;
      context?: ChatConnectorParams<UIMessage>['context'];
    }) {
      const renderFn = jest.fn();
      const makeWidget = connectChat(renderFn);
      const widget = makeWidget({
        ...params,
        transport: { api: 'http://unused' },
      });
      return { widget, renderFn };
    }

    it('attaches turnContext to metadata when context is a static object', async () => {
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
      expect(call.text).toBe('Hello');
      expect(call.metadata).toEqual({
        turnContext: { currentPage: '/products', locale: 'en-US' },
      });
      // The legacy `<context>{...}</context>` text part must not be present.
      expect(call.parts).toBeUndefined();
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
      expect((sendMessageSpy.mock.calls[0][0] as any).metadata).toEqual({
        turnContext: { currentPage: '/page-1' },
      });

      pageUrl = '/page-2';
      await sendMessage({ text: 'second' });
      expect((sendMessageSpy.mock.calls[1][0] as any).metadata).toEqual({
        turnContext: { currentPage: '/page-2' },
      });
    });

    it('preserves caller-supplied metadata and namespaces turnContext under it', async () => {
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
        text: 'hi',
        metadata: { custom: 'value' } as any,
      });

      expect((sendMessageSpy.mock.calls[0][0] as any).metadata).toEqual({
        custom: 'value',
        turnContext: { page: '/about' },
      });
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

    it('attaches turnContext to metadata when called with parts', async () => {
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

      const call = sendMessageSpy.mock.calls[0][0] as any;
      expect(call.parts).toEqual([{ type: 'text', text: 'Hi from parts' }]);
      expect(call.metadata).toEqual({
        turnContext: { page: '/about' },
      });
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

    it('forwards values verbatim and leaves payload validation to the server', async () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      const longValue = 'x'.repeat(1025);
      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
        // Intentionally non-conforming entries: backend (HTTP 422) owns
        // validation; the client must not silently mutate this payload.
        context: {
          'bad key!': 'kept as-is',
          tooBig: longValue,
          ok: 'kept',
        } as Record<string, string>,
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];
      await sendMessage({ text: 'hi' });

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect((sendMessageSpy.mock.calls[0][0] as any).metadata).toEqual({
        turnContext: {
          'bad key!': 'kept as-is',
          tooBig: longValue,
          ok: 'kept',
        },
      });
    });

    it('propagates errors from a throwing context resolver', () => {
      const chatInstance = createTestChat();
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      const { widget, renderFn } = createChatWidgetWithContext({
        chat: chatInstance,
        context: () => {
          throw new Error('boom');
        },
      });

      const helper = algoliasearchHelper(createSearchClient(), '');
      widget.init(createInitOptions({ helper, state: helper.state }));

      const { sendMessage } = renderFn.mock.calls[0][0];

      // A throwing `context` is a developer bug — surface it loudly instead
      // of silently sending the message without context.
      expect(() => sendMessage({ text: 'Hello' })).toThrow('boom');
      expect(sendMessageSpy).not.toHaveBeenCalled();
    });
  });
});
