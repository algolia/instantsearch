/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import { createInitOptions } from '../../../../test/createWidget';
import { Chat } from '../../../lib/chat';
import connectChat from '../../chat/connectChat';
import connectChatPageSummary from '../connectChatPageSummary';

import type { ChatTransport, UIMessage } from '../../../lib/ai-lite';
import type { InstantSearch, IndexWidget } from '../../../types';
import type { ChatPageSummaryConnectorParams } from '../connectChatPageSummary';

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

const baseInitialMessage = 'Suggest something useful';

function initWidget(
  overrides: Partial<ChatPageSummaryConnectorParams<UIMessage>> = {},
  { instantSearchInstance }: { instantSearchInstance?: InstantSearch } = {}
) {
  const renderFn = jest.fn();
  const makeWidget = connectChatPageSummary(renderFn);
  const widget = makeWidget({
    agentId: 'agentId',
    initialUserMessage: baseInitialMessage,
    ...overrides,
  });

  const helper = algoliasearchHelper(createSearchClient(), '');
  const initOptions = createInitOptions({
    helper,
    state: helper.state,
    ...(instantSearchInstance ? { instantSearchInstance } : {}),
  });

  widget.init(initOptions);

  return { widget, helper, renderFn, initOptions };
}

describe('connectChatPageSummary', () => {
  // The connector sends a request on init via the agent transport, which
  // hits global fetch. jsdom doesn't provide fetch by default — mock it so
  // every test starts from a clean baseline.
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(`data: {"type":"finish"}\n\ndata: [DONE]`, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      )
    ) as unknown as typeof fetch;
    // Chat persists messages to sessionStorage under a shared key; clear so
    // earlier tests don't seed later ones.
    sessionStorage.clear();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    sessionStorage.clear();
  });

  describe('Usage', () => {
    it('throws without a render function', () => {
      expect(() => {
        // @ts-expect-error
        connectChatPageSummary()({
          agentId: 'a',
          initialUserMessage: 'b',
        });
      }).toThrowError(/render function is not valid/);
    });

    it('throws when initialUserMessage is missing', () => {
      const makeWidget = connectChatPageSummary(jest.fn());
      expect(() =>
        makeWidget({
          agentId: 'agentId',
        } as ChatPageSummaryConnectorParams<UIMessage>)
      ).toThrowError(/initialUserMessage/);
    });

    it('throws when neither agentId nor transport is provided', () => {
      const renderFn = jest.fn();
      const makeWidget = connectChatPageSummary(renderFn);
      const widget = makeWidget({
        initialUserMessage: baseInitialMessage,
      } as ChatPageSummaryConnectorParams<UIMessage>);

      const helper = algoliasearchHelper(createSearchClient(), '');
      expect(() => widget.init(createInitOptions({ helper }))).toThrowError(
        /agentId.*transport/
      );
    });

    it('returns a widget descriptor', () => {
      const widget = connectChatPageSummary(jest.fn())({
        agentId: 'agentId',
        initialUserMessage: baseInitialMessage,
      });
      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.chatPageSummary',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  // Helper that mounts a connector with a caller-owned chat instance so we
  // can spy on `sendMessage` BEFORE init runs.
  function mountWithChat(
    chatInstance: Chat<UIMessage>,
    params: Partial<ChatPageSummaryConnectorParams<UIMessage>> = {}
  ) {
    const renderFn = jest.fn();
    const widget = connectChatPageSummary(renderFn)({
      chat: chatInstance,
      initialUserMessage: baseInitialMessage,
      ...params,
    } as unknown as ChatPageSummaryConnectorParams<UIMessage>);
    const helper = algoliasearchHelper(createSearchClient(), '');
    const initOptions = createInitOptions({ helper });
    widget.init(initOptions);
    return { widget, renderFn, initOptions };
  }

  describe('initial request', () => {
    it('sends the initial user message exactly once on init', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: createMockTransport(),
      });
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');
      mountWithChat(chatInstance);

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      const arg = sendMessageSpy.mock.calls[0][0] as { text: string };
      expect(arg.text).toBe(baseInitialMessage);
    });

    it('does not resend when initialMessages already contains a user message', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: createMockTransport(),
      });
      chatInstance.messages = [
        {
          id: 'preset',
          role: 'user',
          parts: [{ type: 'text', text: 'pre-existing' }],
        } as UIMessage,
      ];
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');
      mountWithChat(chatInstance);

      expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    it('applies initialMessages onto an empty chat without sending', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: createMockTransport(),
      });
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');
      const seeded: UIMessage = {
        id: 'system',
        role: 'system',
        parts: [{ type: 'text', text: 'system note' }],
      } as UIMessage;

      mountWithChat(chatInstance, { initialMessages: [seeded] });

      // System messages are applied; the connector still sends the initial
      // prompt because no *user* message was seeded.
      expect(chatInstance.messages[0]).toEqual(seeded);
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('regenerate', () => {
    it('clears messages and resends the prompt', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: createMockTransport(),
      });
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');
      const { widget, initOptions } = mountWithChat(chatInstance);

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      const renderState = widget.getWidgetRenderState(initOptions);
      renderState.regenerate();

      expect(sendMessageSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('context', () => {
    it('prepends the page context to the initial message', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: createMockTransport(),
      });
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');

      mountWithChat(chatInstance, {
        context: { route: '/products/123', locale: 'en-US' },
      });

      const arg = sendMessageSpy.mock.calls[0][0] as {
        parts: Array<{ type: string; text: string }>;
      };
      expect(arg.parts).toEqual([
        {
          type: 'text',
          text: '<context>{"route":"/products/123","locale":"en-US"}</context>',
        },
        { type: 'text', text: baseInitialMessage },
      ]);
    });

    it('evaluates context function at send time', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: createMockTransport(),
      });
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');
      let route = '/initial';

      const { widget, initOptions } = mountWithChat(chatInstance, {
        context: () => ({ route }),
      });

      const first = sendMessageSpy.mock.calls[0][0] as {
        parts: Array<{ text: string }>;
      };
      expect(first.parts[0].text).toBe(
        '<context>{"route":"/initial"}</context>'
      );

      route = '/changed';
      widget.getWidgetRenderState(initOptions).regenerate();

      const second = sendMessageSpy.mock.calls[1][0] as {
        parts: Array<{ text: string }>;
      };
      expect(second.parts[0].text).toBe(
        '<context>{"route":"/changed"}</context>'
      );
    });

    it('skips the context wrapper when no context is configured', () => {
      const chatInstance = new Chat<UIMessage>({
        transport: createMockTransport(),
      });
      const sendMessageSpy = jest.spyOn(chatInstance, 'sendMessage');
      mountWithChat(chatInstance);

      const arg = sendMessageSpy.mock.calls[0][0] as { text: string };
      expect(arg.text).toBe(baseInitialMessage);
    });
  });

  describe('openChat handoff', () => {
    it('calls the index chat setOpen + sendMessage with the page-summary referer', () => {
      const setOpen = jest.fn();
      const indexChatSendMessage = jest.fn();
      const instantSearchInstance = createInstantSearch();
      // Seed the chat slot of the index render state, as connectChat would.
      instantSearchInstance.renderState = {
        indexName: {
          chat: {
            setOpen,
            sendMessage: indexChatSendMessage,
            focusInput: jest.fn(),
            status: 'ready',
          },
        },
      } as unknown as InstantSearch['renderState'];

      const { widget, initOptions } = initWidget({}, { instantSearchInstance });
      const renderState = widget.getWidgetRenderState(initOptions);

      expect(renderState.canHandoff).toBe(true);
      renderState.openChat();

      expect(setOpen).toHaveBeenCalledWith(true);
      expect(indexChatSendMessage).toHaveBeenCalledWith(
        { text: baseInitialMessage },
        { headers: { 'x-algolia-referer': 'page-summary' } }
      );
    });

    it('no-ops when no chat widget is mounted on the index', () => {
      const instantSearchInstance = createInstantSearch();
      instantSearchInstance.renderState = {};
      const { widget, initOptions } = initWidget({}, { instantSearchInstance });
      const renderState = widget.getWidgetRenderState(initOptions);

      expect(renderState.canHandoff).toBe(false);
      // Should not throw.
      expect(() => renderState.openChat()).not.toThrow();
    });

    it('reports canHandoff=false when the index chat is mid-stream', () => {
      const instantSearchInstance = createInstantSearch();
      instantSearchInstance.renderState = {
        indexName: {
          chat: {
            setOpen: jest.fn(),
            sendMessage: jest.fn(),
            focusInput: jest.fn(),
            status: 'streaming',
          },
        },
      } as unknown as InstantSearch['renderState'];

      const { widget, initOptions } = initWidget({}, { instantSearchInstance });
      const renderState = widget.getWidgetRenderState(initOptions);
      expect(renderState.canHandoff).toBe(false);
    });

    it('uses the custom chatType to look up the index chat render state', () => {
      const setOpen = jest.fn();
      const indexChatSendMessage = jest.fn();
      const instantSearchInstance = createInstantSearch();
      instantSearchInstance.renderState = {
        indexName: {
          customChat: {
            setOpen,
            sendMessage: indexChatSendMessage,
            focusInput: jest.fn(),
            status: 'ready',
          },
        },
      } as unknown as InstantSearch['renderState'];

      const { widget, initOptions } = initWidget(
        { chatType: 'customChat' },
        { instantSearchInstance }
      );
      const renderState = widget.getWidgetRenderState(initOptions);
      renderState.openChat();

      expect(setOpen).toHaveBeenCalledWith(true);
      expect(indexChatSendMessage).toHaveBeenCalled();
    });
  });

  describe('integrates with the main connectChat widget', () => {
    it('forwards the summary prompt through openChat to a real chat connector', async () => {
      const chatRenderFn = jest.fn();
      const chatWidget = connectChat(chatRenderFn)({
        agentId: 'agentId',
      });

      const instantSearchInstance = createInstantSearch();
      const helper = instantSearchInstance.helper!;
      const parent: Pick<IndexWidget, 'getIndexId' | 'setIndexUiState'> = {
        getIndexId: () => 'indexName',
        setIndexUiState: () => {},
      };

      chatWidget.init(
        createInitOptions({
          helper,
          instantSearchInstance,
          parent: parent as IndexWidget,
        })
      );
      const chatRenderState = chatWidget.getWidgetRenderState(
        createInitOptions({
          helper,
          instantSearchInstance,
          parent: parent as IndexWidget,
        })
      );

      const setOpenSpy = jest.spyOn(chatRenderState, 'setOpen');
      const chatSendMessageSpy = jest.spyOn(
        chatRenderState,
        'sendMessage' as 'sendMessage'
      );

      instantSearchInstance.renderState = {
        indexName: {
          chat: chatRenderState,
        },
      } as unknown as InstantSearch['renderState'];

      const { widget: summaryWidget } = initWidget(
        {},
        { instantSearchInstance }
      );
      const summaryRenderState = summaryWidget.getWidgetRenderState(
        createInitOptions({
          helper,
          instantSearchInstance,
          parent: parent as IndexWidget,
        })
      );

      summaryRenderState.openChat();

      expect(setOpenSpy).toHaveBeenCalledWith(true);
      expect(chatSendMessageSpy).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('stops a streaming request on dispose', () => {
      const { widget } = initWidget();
      const stopSpy = jest.spyOn(widget.chatInstance, 'stop');

      // Force the chat into a streaming-like state so dispose's branch runs.
      (
        widget.chatInstance as unknown as { _state: { status: string } }
      )._state.status = 'streaming';

      (widget.dispose as unknown as (opts?: unknown) => void)({
        helper: algoliasearchHelper(createSearchClient(), ''),
      });

      expect(stopSpy).toHaveBeenCalled();
    });
  });
});
