/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createControlledSearchClient,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { waitFor } from '@testing-library/dom';
import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import instantsearch from '../../../index.es';
import { Chat } from '../../../lib/chat';
import connectSearchBox from '../../search-box/connectSearchBox';
import connectChat from '../connectChat';

import type {
  UIMessage,
  UIMessageChunk,
  ChatTransport,
} from '../../../lib/ai-lite';
import type { InstantSearch, IndexWidget, Widget } from '../../../types';
import type { ChatConnectorParams } from '../connectChat';
import type { AddToolResultForToolCall } from 'instantsearch-ui-components';

jest.mock('../../../lib/utils/sendChatMessageFeedback', () => ({
  sendChatMessageFeedback: jest.fn(() => Promise.resolve(new Response('{}'))),
}));

describe('connectChat', () => {
  const getInitializedWidget = (
    widgetParams: ChatConnectorParams = {},
    helper = algoliasearchHelper(createSearchClient(), '')
  ) => {
    const renderFn = jest.fn();
    const makeWidget = connectChat(renderFn);
    const widget = makeWidget({
      ...(!('agentId' in widgetParams) ? { agentId: 'agentId' } : {}),
      disableTriggerValidation: true,
      ...widgetParams,
    } as ChatConnectorParams);

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

    it('depends on search by default', () => {
      const customChat = connectChat(jest.fn());
      const widget = customChat({
        agentId: 'agentId',
        disableTriggerValidation: true,
      });

      expect(widget.dependsOn).toBe('search');
    });

    it('can be configured to depend on no backend request', () => {
      const customChat = connectChat(jest.fn());
      const widget = customChat({
        agentId: 'agentId',
        disableTriggerValidation: true,
        requiresSearch: false,
      });

      expect(widget.dependsOn).toBe('none');
    });

    it('types requestOptions as agentId-only', () => {
      const assertChatConnectorParams = <TParams extends ChatConnectorParams>(
        params: TParams
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
        persistence: { messages: false, open: true },
      });
      const customChatParams = assertChatConnectorParams({
        chat: customChat,
      });
      const customChatOpenPersistenceParams = assertChatConnectorParams({
        chat: customChat,
        persistence: { open: true },
      });
      const customChatPersistenceParams = assertChatConnectorParams({
        chat: customChat,
        persistence: { open: false },
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

      // @ts-expect-error requestOptions is not valid with a custom chat instance
      assertChatConnectorParams({
        chat: customChat,
        requestOptions: {
          queryParameters: { cache: false },
        },
      });

      // @ts-expect-error boolean shorthand would imply control over message persistence
      assertChatConnectorParams({
        chat: customChat,
        persistence: false,
      });

      // @ts-expect-error message persistence is owned by custom chat instances
      assertChatConnectorParams({
        chat: customChat,
        persistence: {
          messages: true,
        },
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
      expect(transportPersistenceParams.persistence).toEqual({
        messages: false,
        open: true,
      });
      expect(customChatParams.chat).toBe(customChat);
      expect(customChatOpenPersistenceParams.persistence).toEqual({
        open: true,
      });
      expect(customChatPersistenceParams.persistence).toEqual({ open: false });
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
          focusInput: expect.any(Function),
          '~consumeInputFocus': expect.any(Function),
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

    describe('suggestionsStatus', () => {
      const suggestionsPart = {
        type: 'data-suggestions',
        data: { suggestions: ['Cheaper options?'] },
      };

      function getSuggestionsStatus({
        messages,
        status,
      }: {
        messages: unknown[];
        status?: string;
      }) {
        const chat = new Chat<any>({
          persistence: false,
          transport: {} as any,
        });
        const widget = connectChat(jest.fn())({
          chat,
          disableTriggerValidation: true,
        });
        const helper = algoliasearchHelper(createSearchClient(), '');

        widget.init(createInitOptions({ helper }));
        chat.messages = messages as any;
        if (status) {
          chat._state.status = status as any;
        }

        return widget.getWidgetRenderState(createInitOptions({ helper }))
          .suggestionsStatus;
      }

      it('is idle when no turn is running', () => {
        expect(
          getSuggestionsStatus({
            messages: [
              { id: '1', role: 'assistant', parts: [suggestionsPart] },
            ],
          })
        ).toBe('idle');
      });

      it('is idle for a turn with no reason to expect suggestions', () => {
        expect(
          getSuggestionsStatus({
            status: 'streaming',
            messages: [
              {
                id: '1',
                role: 'assistant',
                parts: [{ type: 'text', text: 'Hello' }],
              },
            ],
          })
        ).toBe('idle');
      });

      it('is loading when the agent declared suggestions', () => {
        expect(
          getSuggestionsStatus({
            status: 'streaming',
            messages: [
              {
                id: '1',
                role: 'assistant',
                metadata: { suggestionsEnabled: true },
                parts: [{ type: 'text', text: 'Hello' }],
              },
            ],
          })
        ).toBe('loading');
      });

      it('is loading when an earlier turn produced suggestions', () => {
        expect(
          getSuggestionsStatus({
            status: 'streaming',
            messages: [
              { id: '1', role: 'assistant', parts: [suggestionsPart] },
              { id: '2', role: 'user', parts: [] },
              {
                id: '3',
                role: 'assistant',
                parts: [{ type: 'text', text: 'Hello' }],
              },
            ],
          })
        ).toBe('loading');
      });

      it('is idle once the suggestions arrive', () => {
        expect(
          getSuggestionsStatus({
            status: 'streaming',
            messages: [
              { id: '1', role: 'assistant', parts: [suggestionsPart] },
              { id: '2', role: 'user', parts: [] },
              {
                id: '3',
                role: 'assistant',
                parts: [{ type: 'text', text: 'Hello' }, suggestionsPart],
              },
            ],
          })
        ).toBe('idle');
      });
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
          focusInput: expect.any(Function),
          '~consumeInputFocus': expect.any(Function),
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

  describe('browser side effects', () => {
    // Positive controls for the negative assertions in `connectChat-ssr.test.ts`.
    it('registers callbacks that render chat updates', () => {
      const chat = new Chat<any>({
        persistence: false,
        transport: {} as any,
      });
      const renderFn = jest.fn();
      const widget = connectChat(renderFn)({
        chat,
        disableTriggerValidation: true,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');

      widget.init(createInitOptions({ helper }));
      renderFn.mockClear();

      const messages = [
        {
          id: 'assistant-message',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Hello' }],
        },
      ];
      chat.messages = messages;
      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ messages }),
        false
      );

      chat._state.status = 'streaming';
      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'streaming' }),
        false
      );

      const error = new Error('Failed');
      chat._state.error = error;
      expect(renderFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ error }),
        false
      );
      expect(renderFn).toHaveBeenCalledTimes(3);
    });

    it('schedules a full render on status changes only, so sibling entry points see them', () => {
      const chat = new Chat<any>({
        persistence: false,
        transport: {} as any,
      });
      const scheduleRender = jest.fn();
      const instantSearchInstance = createInstantSearch({
        scheduleRender:
          scheduleRender as unknown as InstantSearch['scheduleRender'],
      });
      const widget = connectChat(jest.fn())({
        chat,
        disableTriggerValidation: true,
      });

      widget.init(createInitOptions({ instantSearchInstance }));
      scheduleRender.mockClear();

      chat._state.status = 'streaming';
      expect(scheduleRender).toHaveBeenCalledTimes(1);

      // Re-writing the same status notifies subscribers, but nothing changed.
      chat._state.status = 'streaming';
      expect(scheduleRender).toHaveBeenCalledTimes(1);

      // Message deltas stay local.
      chat.messages = [
        {
          id: 'assistant-message',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Hello' }],
        },
      ];
      expect(scheduleRender).toHaveBeenCalledTimes(1);

      chat._state.status = 'ready';
      expect(scheduleRender).toHaveBeenCalledTimes(2);
    });

    it('still sends the initial user message in a browser', () => {
      const chat = new Chat({ persistence: false, transport: {} as any });
      const sendMessage = jest.fn();
      (chat as any).sendMessage = sendMessage;
      const widget = connectChat(jest.fn())({
        chat,
        transport: {},
        initialUserMessage: 'Hello',
        disableTriggerValidation: true,
      } as any);
      const helper = algoliasearchHelper(createSearchClient(), '');

      widget.init(createInitOptions({ helper }));

      expect(sendMessage).toHaveBeenCalledWith({ text: 'Hello' });
    });

    it('still resumes a stream in a browser', () => {
      const chat = new Chat({ persistence: false, transport: {} as any });
      const resumeStream = jest.fn();
      (chat as any).resumeStream = resumeStream;
      const widget = connectChat(jest.fn())({
        chat,
        transport: {},
        resume: true,
        disableTriggerValidation: true,
      } as any);
      const helper = algoliasearchHelper(createSearchClient(), '');

      widget.init(createInitOptions({ helper }));

      expect(resumeStream).toHaveBeenCalled();
    });

    it('still applies initial messages in a browser', () => {
      const chat = new Chat({ persistence: false, transport: {} as any });
      const initialMessages = [
        {
          id: 'initial',
          role: 'assistant',
          parts: [{ type: 'text', text: 'INITIAL IN BROWSER' }],
        },
      ];
      const widget = connectChat(jest.fn())({
        chat,
        transport: {},
        initialMessages,
        disableTriggerValidation: true,
      } as any);
      const helper = algoliasearchHelper(createSearchClient(), '');

      widget.init(createInitOptions({ helper }));

      expect(chat.messages).toEqual(initialMessages);
    });

    it('renders restored initial messages only with the current init options', () => {
      const chat = new Chat({ persistence: false, transport: {} as any });
      const initialMessages = [
        {
          id: 'initial',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Welcome' }],
        },
      ];
      const renderFn = jest.fn();
      const widget = connectChat(renderFn)({
        chat,
        initialMessages,
        disableTriggerValidation: true,
      } as any);
      const firstInstantSearchInstance = createInstantSearch();
      const secondInstantSearchInstance = createInstantSearch();

      widget.init(
        createInitOptions({ instantSearchInstance: firstInstantSearchInstance })
      );
      chat.messages = [];
      renderFn.mockClear();

      widget.init(
        createInitOptions({
          instantSearchInstance: secondInstantSearchInstance,
        })
      );

      expect(
        renderFn.mock.calls.map(([renderState, isFirstRendering]) => ({
          init:
            renderState.instantSearchInstance === firstInstantSearchInstance
              ? 'previous'
              : 'current',
          isFirstRendering,
          messages: renderState.messages,
        }))
      ).toEqual([
        {
          init: 'current',
          isFirstRendering: true,
          messages: initialMessages,
        },
      ]);
    });
  });

  describe('dispose', () => {
    it('unsubscribes each Chat callback once across lifecycle cycles', () => {
      const chat = new Chat({ persistence: false, transport: {} as any });
      const unsubscribeErrors = [jest.fn(), jest.fn()];
      const unsubscribeMessages = [jest.fn(), jest.fn()];
      const unsubscribeStatuses = [jest.fn(), jest.fn()];
      jest
        .spyOn(chat, '~registerErrorCallback')
        .mockReturnValueOnce(unsubscribeErrors[0])
        .mockReturnValueOnce(unsubscribeErrors[1]);
      jest
        .spyOn(chat, '~registerMessagesCallback')
        .mockReturnValueOnce(unsubscribeMessages[0])
        .mockReturnValueOnce(unsubscribeMessages[1]);
      jest
        .spyOn(chat, '~registerStatusCallback')
        .mockReturnValueOnce(unsubscribeStatuses[0])
        .mockReturnValueOnce(unsubscribeStatuses[1]);
      const unmountFn = jest.fn();
      const widget = connectChat(
        jest.fn(),
        unmountFn
      )({
        chat,
        disableTriggerValidation: true,
      });
      const helper = algoliasearchHelper(createSearchClient(), '');

      widget.init(createInitOptions({ helper }));
      widget.dispose();
      widget.init(createInitOptions({ helper }));
      widget.dispose();
      widget.dispose();

      [
        ...unsubscribeErrors,
        ...unsubscribeMessages,
        ...unsubscribeStatuses,
      ].forEach((unsubscribe) => expect(unsubscribe).toHaveBeenCalledTimes(1));
      expect(unmountFn).toHaveBeenCalledTimes(3);
    });

    it('reuses a caller-owned Chat across connector replacement', () => {
      const chat = new Chat({ persistence: false, transport: {} as any });
      const firstRender = jest.fn();
      const secondRender = jest.fn();
      const helper = algoliasearchHelper(createSearchClient(), '');
      const firstWidget = connectChat(firstRender)({
        chat,
        disableTriggerValidation: true,
      });
      const secondWidget = connectChat(secondRender)({
        chat,
        disableTriggerValidation: true,
      });

      firstWidget.init(createInitOptions({ helper }));
      firstWidget.dispose();
      firstRender.mockClear();
      secondWidget.init(createInitOptions({ helper }));
      secondRender.mockClear();

      chat.messages = [
        {
          id: 'assistant-message',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Hello' }],
        },
      ];

      expect(firstRender).not.toHaveBeenCalled();
      expect(secondRender).toHaveBeenCalledTimes(1);

      secondWidget.dispose();
      secondRender.mockClear();
      chat._state.status = 'streaming';
      expect(secondRender).not.toHaveBeenCalled();
    });

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
    beforeEach(() => {
      sessionStorage.clear();
    });

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

    it('requests focus only for an open transition or explicit focus', () => {
      const { getRenderState } = getInitializedWidget();
      const consumeInputFocus = () => getRenderState()['~consumeInputFocus']!();

      expect(consumeInputFocus()).toBe(false);

      getRenderState().setOpen(true);
      expect(consumeInputFocus()).toBe(true);
      expect(consumeInputFocus()).toBe(false);

      getRenderState().setOpen(true);
      expect(consumeInputFocus()).toBe(false);

      getRenderState().focusInput();
      expect(consumeInputFocus()).toBe(true);
      expect(consumeInputFocus()).toBe(false);

      getRenderState().setOpen(false);
      expect(consumeInputFocus()).toBe(false);
    });

    it('opens and requests focus once when focusInput is called while closed', () => {
      const { getRenderState } = getInitializedWidget();

      expect(getRenderState().open).toBe(false);

      getRenderState().focusInput();

      expect(getRenderState().open).toBe(true);
      expect(getRenderState()['~consumeInputFocus']!()).toBe(true);
      expect(getRenderState()['~consumeInputFocus']!()).toBe(false);
    });

    describe('open state persistence', () => {
      const openStateKey = 'instantsearch-chat-open-state-chat';
      const messageKey = 'instantsearch-chat-initial-messages-agentId';
      const persistedMessages: UIMessage[] = [
        {
          id: 'persisted',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Persisted message' }],
        },
      ];

      beforeEach(() => {
        sessionStorage.clear();
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it.each([
        ['omitted', undefined, true, true],
        ['true', true, true, true],
        ['false', false, false, false],
        ['messages only', { messages: true, open: false }, true, false],
        ['open only', { messages: false, open: true }, false, true],
        ['empty object', {}, false, false],
      ])(
        'normalizes %s persistence for messages and open state',
        (_, persistence, persistsMessages, persistsOpen) => {
          sessionStorage.setItem(messageKey, JSON.stringify(persistedMessages));
          sessionStorage.setItem(openStateKey, 'true');
          const getItem = jest.spyOn(Storage.prototype, 'getItem');
          const setItem = jest.spyOn(Storage.prototype, 'setItem');
          const { getRenderState } = getInitializedWidget({
            agentId: 'agentId',
            persistence,
          });

          expect(getRenderState().messages).toEqual(
            persistsMessages ? persistedMessages : []
          );
          expect(getRenderState().open).toBe(persistsOpen);
          expect(getItem.mock.calls.some(([key]) => key === messageKey)).toBe(
            persistsMessages
          );
          expect(getItem.mock.calls.some(([key]) => key === openStateKey)).toBe(
            persistsOpen
          );

          getItem.mockClear();
          setItem.mockClear();

          getRenderState().setMessages([
            {
              id: 'next',
              role: 'user',
              parts: [{ type: 'text', text: 'Next message' }],
            },
          ]);
          getRenderState().setOpen(false);

          expect(setItem.mock.calls.some(([key]) => key === messageKey)).toBe(
            persistsMessages
          );
          expect(setItem.mock.calls.some(([key]) => key === openStateKey)).toBe(
            persistsOpen
          );
        }
      );

      it.each([
        ['true', true],
        ['false', false],
      ] as const)('restores the exact stored %s value', (stored, expected) => {
        sessionStorage.setItem(openStateKey, stored);

        const { renderFn, getRenderState } = getInitializedWidget({
          persistence: { messages: false, open: true },
        });

        expect(renderFn).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ open: expected }),
          true
        );
        expect(getRenderState().open).toBe(expected);
      });

      it.each([
        ['omitted', undefined, true],
        ['open disabled', { open: false }, false],
        ['empty object', {}, false],
      ])(
        'uses %s persistence with a caller supplied Chat',
        (_, persistence, expectedOpen) => {
          sessionStorage.setItem(openStateKey, 'true');
          const chat = new Chat<UIMessage>({
            persistence: false,
            transport: {} as any,
          });
          chat.messages = persistedMessages;

          const { getRenderState } = getInitializedWidget({
            chat,
            persistence,
          });

          expect(getRenderState().open).toBe(expectedOpen);
          expect(getRenderState().messages).toEqual(persistedMessages);
        }
      );

      it.each([null, '', 'TRUE', '1'])('fails closed for %s', (stored) => {
        if (stored !== null) {
          sessionStorage.setItem(openStateKey, stored);
        }

        const { getRenderState } = getInitializedWidget({
          persistence: { messages: false, open: true },
        });

        expect(getRenderState().open).toBe(false);
      });

      it('fails closed when accessing sessionStorage throws', () => {
        const descriptor = Object.getOwnPropertyDescriptor(
          window,
          'sessionStorage'
        )!;
        let initialized: ReturnType<typeof getInitializedWidget>;
        Object.defineProperty(window, 'sessionStorage', {
          configurable: true,
          get() {
            throw new Error('STORAGE_UNAVAILABLE');
          },
        });

        try {
          expect(() => {
            initialized = getInitializedWidget({
              persistence: { messages: false, open: true },
            });
          }).not.toThrow();
        } finally {
          Object.defineProperty(window, 'sessionStorage', descriptor);
        }

        expect(initialized!.getRenderState().open).toBe(false);
      });

      it('fails closed when reading storage throws', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
          throw new Error('READ_FAILED');
        });

        const { getRenderState } = getInitializedWidget({
          persistence: { messages: false, open: true },
        });

        expect(getRenderState().open).toBe(false);
      });

      it('writes every explicit open state', () => {
        const setItem = jest.spyOn(Storage.prototype, 'setItem');
        const { getRenderState } = getInitializedWidget({
          persistence: { messages: false, open: true },
        });

        getRenderState().setOpen(true);
        getRenderState().setOpen(false);

        expect(setItem).toHaveBeenNthCalledWith(1, openStateKey, 'true');
        expect(setItem).toHaveBeenNthCalledWith(2, openStateKey, 'false');
      });

      it('updates visible state when writing storage throws', () => {
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('WRITE_FAILED');
        });
        const { renderFn, getRenderState } = getInitializedWidget({
          persistence: { messages: false, open: true },
        });

        expect(() => getRenderState().setOpen(true)).not.toThrow();

        expect(getRenderState().open).toBe(true);
        expect(renderFn).toHaveBeenLastCalledWith(
          expect.objectContaining({ open: true }),
          false
        );
      });

      it('scopes storage by type', () => {
        const setItem = jest.spyOn(Storage.prototype, 'setItem');
        const { getRenderState } = getInitializedWidget({
          persistence: { messages: false, open: true },
          type: 'support',
        });

        getRenderState().setOpen(true);

        expect(setItem).toHaveBeenCalledWith(
          'instantsearch-chat-open-state-support',
          'true'
        );
      });
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

  describe('applyFilters', () => {
    const getApplyFilters = () => {
      const helper = algoliasearchHelper(createSearchClient(), 'index', {
        hierarchicalFacets: [
          {
            name: 'hierarchicalCategories.lvl0',
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
            ],
            separator: ' > ',
          },
        ],
      });
      helper.lastResults = new SearchResults(helper.state, [
        createSingleSearchResponse(),
      ]);

      const { getRenderState } = getInitializedWidget(
        { tools: { testTool: {} } },
        helper
      );

      return {
        helper,
        applyFilters: getRenderState().tools.testTool.applyFilters,
      };
    };

    it('refines the query and the facets of the search tool', () => {
      const { helper, applyFilters } = getApplyFilters();

      applyFilters({
        query: 'laptop',
        facetFilters: [['categories:Laptops'], ['brand:Apple']],
      });

      expect(helper.state.query).toBe('laptop');
      expect(helper.state.disjunctiveFacetsRefinements).toEqual({
        categories: ['Laptops'],
        brand: ['Apple'],
      });
    });

    it('keeps the value after the first colon in a facet filter', () => {
      const { helper, applyFilters } = getApplyFilters();

      applyFilters({ facetFilters: [['brand:Bang & Olufsen: Beoplay']] });

      expect(helper.state.disjunctiveFacetsRefinements).toEqual({
        brand: ['Bang & Olufsen: Beoplay'],
      });
    });

    it('refines a hierarchical facet from its deepest level', () => {
      const { helper, applyFilters } = getApplyFilters();

      applyFilters({
        facetFilters: [
          ['hierarchicalCategories.lvl0:Computers & Tablets'],
          ['hierarchicalCategories.lvl1:Computers & Tablets > Laptops'],
        ],
      });

      expect(helper.state.hierarchicalFacetsRefinements).toEqual({
        'hierarchicalCategories.lvl0': ['Computers & Tablets > Laptops'],
      });
      expect(helper.state.disjunctiveFacetsRefinements).toEqual({});
    });

    it('refines a hierarchical facet regardless of the level order', () => {
      const { helper, applyFilters } = getApplyFilters();

      applyFilters({
        facetFilters: [
          ['hierarchicalCategories.lvl1:Computers & Tablets > Laptops'],
          ['hierarchicalCategories.lvl0:Computers & Tablets'],
        ],
      });

      expect(helper.state.hierarchicalFacetsRefinements).toEqual({
        'hierarchicalCategories.lvl0': ['Computers & Tablets > Laptops'],
      });
    });
  });

  describe('tool handling', () => {
    const chatStream = (chunks: UIMessageChunk[]) =>
      new Response(
        `${chunks
          .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
          .join('')}data: [DONE]`,
        { headers: { 'Content-Type': 'text/event-stream' } }
      );

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
          '~addToolResultForMessage': expect.any(Function),
          applyFilters: expect.any(Function),
          sendEvent: expect.any(Function),
          insightsEventContext: {
            agentId: 'agentId',
            instantSearchStatus: 'idle',
          },
          records: renderState.records,
        },
      });
      // Every tool shares the chat's one store.
      expect(renderState.records.getAll()).toEqual({});
    });

    it('combines the records of every search into the chat store', () => {
      const searchPart = (toolCallId: string, hits: unknown[]) => ({
        type: 'tool-algolia_search_index',
        toolCallId,
        state: 'output-available',
        input: {},
        output: { hits },
      });
      const { getRenderState } = getInitializedWidget({
        persistence: false,
        // A restored conversation, collected without a messages callback.
        initialMessages: [
          {
            id: '1',
            role: 'assistant',
            parts: [
              searchPart('search-1', [{ objectID: '1', name: 'Runner' }]),
              searchPart('search-2', [{ objectID: '2', name: 'Sneaker' }]),
            ],
          },
          {
            id: '2',
            role: 'assistant',
            parts: [
              searchPart('search-3', [
                { objectID: '1', name: 'Runner Pro' },
                { objectID: '3', name: 'Trail' },
              ]),
            ],
          },
        ],
      } as unknown as ChatConnectorParams);

      const { records } = getRenderState();

      // Every search contributes, and the newest copy of a record wins.
      expect(records.getAll()).toEqual({
        1: { objectID: '1', name: 'Runner Pro' },
        2: { objectID: '2', name: 'Sneaker' },
        3: { objectID: '3', name: 'Trail' },
      });

      // A new search of a later turn joins the same map.
      getRenderState().setMessages((messages) =>
        messages.concat({
          id: '3',
          role: 'assistant',
          parts: [searchPart('search-4', [{ objectID: '4', name: 'Boot' }])],
        } as unknown as (typeof messages)[number])
      );

      expect(records.get('4')).toEqual({ objectID: '4', name: 'Boot' });
      expect(records.get('1')).toEqual({ objectID: '1', name: 'Runner Pro' });

      // The store outlives renders rather than being derived per render.
      expect(getRenderState().records).toBe(records);
    });

    it('drops the records of a cleared conversation', () => {
      const { getRenderState } = getInitializedWidget({
        persistence: false,
        initialMessages: [
          {
            id: '1',
            role: 'assistant',
            parts: [
              {
                type: 'tool-algolia_search_index',
                toolCallId: 'search',
                state: 'output-available',
                input: {},
                output: { hits: [{ objectID: '1', name: 'Runner' }] },
              },
            ],
          },
        ],
      } as unknown as ChatConnectorParams);

      const { records, clearMessages } = getRenderState();

      expect(records.has('1')).toBe(true);

      clearMessages();

      expect(records.getAll()).toEqual({});
    });

    it('starts a re-added widget with an empty store', async () => {
      const search = instantsearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      const widget = connectChat(jest.fn())({
        agentId: 'agentId',
        disableTriggerValidation: true,
        persistence: false,
      } as ChatConnectorParams);
      const getChatRenderState = () => search.renderState.indexName.chat!;

      search.addWidgets([widget]);
      search.start();
      await wait(0);

      getChatRenderState().setMessages([
        {
          id: '1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-algolia_search_index',
              toolCallId: 'search',
              state: 'output-available',
              input: {},
              output: { hits: [{ objectID: '1', name: 'Runner' }] },
            },
          ],
        },
      ] as unknown as UIMessage[]);

      expect(getChatRenderState().records.has('1')).toBe(true);

      // `dispose` leaves the instance in place, so the render it schedules
      // collects that conversation once more: only starting the next one over
      // keeps its records out of the widget that replaces this one.
      search.removeWidgets([widget]);
      await wait(0);

      search.addWidgets([widget]);
      await wait(0);

      expect(getChatRenderState().records.getAll()).toEqual({});
      expect(getChatRenderState().messages).toEqual([]);
    });

    it('keeps the development diagnostic for an unknown tool', async () => {
      const fetchMock = jest.fn().mockResolvedValue(
        chatStream([
          { type: 'start', messageId: 'assistant-1' },
          {
            type: 'tool-input-available',
            toolName: 'missingTool',
            toolCallId: 'call-1',
            input: {},
          },
          { type: 'finish' },
        ])
      );
      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: { fetch: fetchMock },
      } as ChatConnectorParams);

      await widget.chatInstance.sendMessage({ text: 'use a missing tool' });

      expect(widget.chatInstance.status).toBe('error');
      expect(widget.chatInstance.error).toEqual(
        new Error(
          'No tool implementation found for "missingTool". Please provide a tool implementation in the `tools` prop.'
        )
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('supports returning the injected addToolResult from a configured tool', async () => {
      const fetchMock = jest.fn().mockResolvedValue(
        chatStream([
          { type: 'start', messageId: 'assistant-1' },
          {
            type: 'tool-input-available',
            toolName: 'search',
            toolCallId: 'call-1',
            input: { query: 'hello' },
          },
          { type: 'finish' },
        ])
      );
      const onToolCall = jest.fn(({ addToolResult }) =>
        addToolResult({ output: { hits: ['hello'] } })
      );
      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: { fetch: fetchMock },
        sendAutomaticallyWhen: () => false,
        tools: { search: { onToolCall } },
      });

      await expect(
        widget.chatInstance.sendMessage({ text: 'search for hello' })
      ).resolves.toBeUndefined();

      const assistant = widget.chatInstance.messages.find(
        (message) => message.role === 'assistant'
      );
      expect(onToolCall).toHaveBeenCalledTimes(1);
      expect(assistant?.parts[0]).toMatchObject({
        type: 'tool-search',
        toolCallId: 'call-1',
        state: 'output-available',
        output: { hits: ['hello'] },
      });
      expect(widget.chatInstance.status).toBe('ready');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it.each([
      [
        'throws',
        {
          onToolCall: () => {
            throw new Error('The operation may have completed.');
          },
          errorText: 'The operation may have completed.',
        },
      ],
      [
        'rejects',
        {
          onToolCall: () =>
            Promise.reject(new Error('The operation may have completed.')),
          errorText: 'The operation may have completed.',
        },
      ],
      [
        'throws undefined',
        {
          onToolCall: () => {
            throw undefined;
          },
          errorText: 'Tool call failed.',
        },
      ],
      [
        'rejects null',
        {
          onToolCall: () => Promise.reject(null),
          errorText: 'Tool call failed.',
        },
      ],
    ])('settles a configured tool that %s', async (_name, toolCase) => {
      const { onToolCall, errorText } = toolCase;
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          chatStream([
            { type: 'start', messageId: 'assistant-1' },
            {
              type: 'tool-input-available',
              toolName: 'save',
              toolCallId: 'call-1',
              input: {},
            },
            { type: 'finish' },
          ])
        )
        .mockResolvedValueOnce(
          chatStream([
            { type: 'start', messageId: 'assistant-2' },
            { type: 'text-start', id: 'text-1' },
            {
              type: 'text-delta',
              id: 'text-1',
              delta: 'Please check whether the save completed.',
            },
            { type: 'text-end', id: 'text-1' },
            { type: 'finish' },
          ])
        );
      const { widget } = getInitializedWidget({
        agentId: undefined,
        persistence: false,
        transport: { fetch: fetchMock },
        tools: { save: { onToolCall } },
      });

      await widget.chatInstance.sendMessage({ text: 'save this' });

      const assistant = widget.chatInstance.messages.find(
        (message) => message.id === 'assistant-1'
      );
      expect(assistant?.parts[0]).toMatchObject({
        type: 'tool-save',
        toolCallId: 'call-1',
        state: 'output-error',
        errorText,
      });
      expect(widget.chatInstance.status).toBe('ready');
      expect(widget.chatInstance.error).toBeUndefined();
      expect(widget.chatInstance.messages.at(-1)?.parts[0]).toMatchObject({
        type: 'text',
        text: 'Please check whether the save completed.',
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it.each([
      ['default timeout', undefined, 20_000],
      ['configured timeout', 10, 10],
    ] as const)(
      'uses the %s for an unsettled tool and aborts its signal',
      async (_name, timeout, timeoutDelay) => {
        jest.useFakeTimers();

        try {
          let toolSignal!: AbortSignal;
          let markToolStarted!: () => void;
          const toolStarted = new Promise<void>((resolve) => {
            markToolStarted = resolve;
          });
          const fetchMock = jest
            .fn()
            .mockResolvedValueOnce(
              chatStream([
                { type: 'start', messageId: 'assistant-1' },
                {
                  type: 'tool-input-available',
                  toolName: 'save',
                  toolCallId: 'call-1',
                  input: {},
                },
                { type: 'finish' },
              ])
            )
            .mockResolvedValueOnce(
              chatStream([
                { type: 'start', messageId: 'assistant-2' },
                { type: 'finish' },
              ])
            );
          const { widget } = getInitializedWidget({
            agentId: undefined,
            persistence: false,
            transport: { fetch: fetchMock },
            tools: {
              save: {
                timeout,
                onToolCall({ signal }) {
                  toolSignal = signal;
                  markToolStarted();
                },
              },
            },
          });

          const send = widget.chatInstance.sendMessage({ text: 'save this' });
          await toolStarted;
          await Promise.resolve();

          jest.advanceTimersByTime(timeoutDelay - 1);
          expect(toolSignal.aborted).toBe(false);

          jest.advanceTimersByTime(1);
          await send;

          const assistant = widget.chatInstance.messages.find(
            (message) => message.id === 'assistant-1'
          );
          expect(toolSignal.aborted).toBe(true);
          expect(assistant?.parts[0]).toMatchObject({
            state: 'output-error',
            errorText:
              'The tool call timed out before a result was received. The operation may have completed.',
          });
          expect(widget.chatInstance.status).toBe('ready');
          expect(fetchMock).toHaveBeenCalledTimes(2);
        } finally {
          jest.useRealTimers();
        }
      }
    );

    it('allows a configured tool timeout to be disabled', async () => {
      jest.useFakeTimers();

      try {
        let toolSignal!: AbortSignal;
        let addToolResult!: AddToolResultForToolCall;
        let markToolStarted!: () => void;
        const toolStarted = new Promise<void>((resolve) => {
          markToolStarted = resolve;
        });
        const fetchMock = jest.fn().mockResolvedValue(
          chatStream([
            { type: 'start', messageId: 'assistant-1' },
            {
              type: 'tool-input-available',
              toolName: 'save',
              toolCallId: 'call-1',
              input: {},
            },
            { type: 'finish' },
          ])
        );
        const { widget } = getInitializedWidget({
          agentId: undefined,
          persistence: false,
          transport: { fetch: fetchMock },
          sendAutomaticallyWhen: () => false,
          tools: {
            save: {
              timeout: false,
              onToolCall(params) {
                toolSignal = params.signal;
                addToolResult = params.addToolResult;
                markToolStarted();
              },
            },
          },
        });

        const send = widget.chatInstance.sendMessage({ text: 'save this' });
        await toolStarted;
        await Promise.resolve();

        jest.advanceTimersByTime(20_000);
        expect(toolSignal.aborted).toBe(false);

        await addToolResult({ output: { saved: true } });
        await send;

        const assistant = widget.chatInstance.messages.find(
          (message) => message.id === 'assistant-1'
        );
        expect(assistant?.parts[0]).toMatchObject({
          state: 'output-available',
          output: { saved: true },
        });
      } finally {
        jest.useRealTimers();
      }
    });

    it('aborts and settles a configured tool when the response is stopped', async () => {
      let toolSignal!: AbortSignal;
      let markToolStarted!: () => void;
      const toolStarted = new Promise<void>((resolve) => {
        markToolStarted = resolve;
      });
      const fetchMock = jest.fn().mockResolvedValue(
        chatStream([
          { type: 'start', messageId: 'assistant-1' },
          {
            type: 'tool-input-available',
            toolName: 'save',
            toolCallId: 'call-1',
            input: {},
          },
          { type: 'finish' },
        ])
      );
      const { widget } = getInitializedWidget({
        agentId: undefined,
        persistence: false,
        transport: { fetch: fetchMock },
        tools: {
          save: {
            timeout: false,
            onToolCall({ signal }) {
              toolSignal = signal;
              markToolStarted();
              return new Promise<void>(() => {});
            },
          },
        },
      });

      const send = widget.chatInstance.sendMessage({ text: 'save this' });
      await toolStarted;
      await widget.chatInstance.stop();
      await send;

      const assistant = widget.chatInstance.messages.find(
        (message) => message.id === 'assistant-1'
      );
      expect(toolSignal.aborted).toBe(true);
      expect(assistant?.parts[0]).toMatchObject({
        state: 'output-error',
        errorText: 'The tool call was cancelled before a result was received.',
      });
      expect(widget.chatInstance.status).toBe('ready');
    });

    describe('cancelling a tool call the user never answered', () => {
      const pendingToolCallResponse = () =>
        chatStream([
          { type: 'start', messageId: 'assistant-1' },
          {
            type: 'tool-input-available',
            toolName: 'confirm',
            toolCallId: 'call-1',
            input: { sku: 'A1' },
          },
          { type: 'finish' },
        ]);
      const emptyResponse = () =>
        chatStream([
          { type: 'start', messageId: 'assistant-2' },
          { type: 'finish' },
        ]);

      // `onToolCall` returns without submitting an output.
      const awaitUser = jest.fn();

      const toolPartsSentOn = (fetchMock: jest.Mock, callIndex: number) =>
        JSON.parse(fetchMock.mock.calls[callIndex][1].body)
          .messages.flatMap((message: { parts: unknown[] }) => message.parts)
          .filter((part: object) => 'toolCallId' in part);

      it('reports the call as failed when the tool has no cancelOutput', async () => {
        const fetchMock = jest
          .fn()
          .mockResolvedValueOnce(pendingToolCallResponse())
          .mockResolvedValueOnce(emptyResponse());
        const { widget } = getInitializedWidget({
          agentId: undefined,
          persistence: false,
          transport: { fetch: fetchMock },
          tools: { confirm: { onToolCall: awaitUser, timeout: false } },
        });

        await widget.chatInstance.sendMessage({ text: 'buy the first one' });
        await widget.chatInstance.sendMessage({ text: 'never mind' });

        expect(toolPartsSentOn(fetchMock, 1)).toEqual([
          expect.objectContaining({
            toolCallId: 'call-1',
            state: 'output-error',
          }),
        ]);
        expect(widget.chatInstance.status).toBe('ready');
      });

      it('commits the output returned by the tool `cancelOutput`', async () => {
        const fetchMock = jest
          .fn()
          .mockResolvedValueOnce(pendingToolCallResponse())
          .mockResolvedValueOnce(emptyResponse());
        const cancelOutput = jest.fn(() => ({ confirmed: false }));
        const { widget } = getInitializedWidget({
          agentId: undefined,
          persistence: false,
          transport: { fetch: fetchMock },
          tools: {
            confirm: { onToolCall: awaitUser, cancelOutput, timeout: false },
          },
        });

        await widget.chatInstance.sendMessage({ text: 'buy the first one' });
        await widget.chatInstance.sendMessage({ text: 'never mind' });

        expect(cancelOutput).toHaveBeenCalledWith({
          toolCallId: 'call-1',
          input: { sku: 'A1' },
        });
        expect(toolPartsSentOn(fetchMock, 1)).toEqual([
          expect.objectContaining({
            toolCallId: 'call-1',
            state: 'output-available',
            output: { confirmed: false },
          }),
        ]);
      });

      it('reports the call as failed when `cancelOutput` returns nothing', async () => {
        const fetchMock = jest
          .fn()
          .mockResolvedValueOnce(pendingToolCallResponse())
          .mockResolvedValueOnce(emptyResponse());
        const cancelOutput = jest.fn(() => undefined);
        const { widget } = getInitializedWidget({
          agentId: undefined,
          persistence: false,
          transport: { fetch: fetchMock },
          tools: {
            confirm: { onToolCall: awaitUser, cancelOutput, timeout: false },
          },
        });

        await widget.chatInstance.sendMessage({ text: 'buy the first one' });
        await widget.chatInstance.sendMessage({ text: 'never mind' });

        expect(toolPartsSentOn(fetchMock, 1)).toEqual([
          expect.objectContaining({
            toolCallId: 'call-1',
            state: 'output-error',
          }),
        ]);
        expect(widget.chatInstance.status).toBe('ready');
      });

      it('falls back to a failed call when `cancelOutput` throws', async () => {
        const fetchMock = jest
          .fn()
          .mockResolvedValueOnce(pendingToolCallResponse())
          .mockResolvedValueOnce(emptyResponse());
        const cancelOutput = jest.fn(() => {
          throw new Error('boom');
        });
        const { widget } = getInitializedWidget({
          agentId: undefined,
          persistence: false,
          transport: { fetch: fetchMock },
          tools: {
            confirm: { onToolCall: awaitUser, cancelOutput, timeout: false },
          },
        });

        await widget.chatInstance.sendMessage({ text: 'buy the first one' });
        await widget.chatInstance.sendMessage({ text: 'never mind' });

        expect(toolPartsSentOn(fetchMock, 1)).toEqual([
          expect.objectContaining({
            toolCallId: 'call-1',
            state: 'output-error',
          }),
        ]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(widget.chatInstance.status).toBe('ready');
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

    it('settles restored auto-executed tool calls without rerunning them', () => {
      const storageKey = `${cacheKey}-agentId`;
      const previousMessages: UIMessage[] = [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-save',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { value: 'static' },
            },
            {
              type: 'dynamic-tool',
              toolName: 'save',
              toolCallId: 'call-2',
              state: 'input-available',
              input: { value: 'dynamic' },
            },
            {
              type: 'tool-save',
              toolCallId: 'call-3',
              state: 'input-streaming',
              input: { value: 'partial' },
            },
          ],
        },
      ];
      sessionStorage.setItem(storageKey, JSON.stringify(previousMessages));
      const onToolCall = jest.fn();

      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        tools: { save: { onToolCall } },
      });

      expect(getRenderState().messages[0].parts).toEqual([
        expect.objectContaining({
          toolCallId: 'call-1',
          state: 'output-error',
          errorText:
            'The page was reloaded before a tool result was received. The operation may have completed.',
        }),
        expect.objectContaining({
          toolCallId: 'call-2',
          state: 'output-error',
          errorText:
            'The page was reloaded before a tool result was received. The operation may have completed.',
        }),
        expect.objectContaining({
          toolCallId: 'call-3',
          state: 'output-error',
          errorText:
            'The page was reloaded before a tool result was received. The operation may have completed.',
        }),
      ]);
      expect(onToolCall).not.toHaveBeenCalled();
      expect(JSON.parse(sessionStorage.getItem(storageKey)!)[0].parts).toEqual(
        getRenderState().messages[0].parts
      );
    });

    it('keeps restored timeout-disabled, interactive, and provider-executed tools pending', () => {
      const previousMessages: UIMessage[] = [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-approve',
              toolCallId: 'call-1',
              state: 'input-available',
              input: {},
            },
            {
              type: 'tool-confirm',
              toolCallId: 'call-2',
              state: 'input-available',
              input: {},
            },
            {
              type: 'tool-save',
              toolCallId: 'call-3',
              state: 'input-available',
              input: {},
              providerExecuted: true,
            },
          ],
        },
      ];
      sessionStorage.setItem(
        `${cacheKey}-agentId`,
        JSON.stringify(previousMessages)
      );

      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        tools: {
          approve: {},
          confirm: { onToolCall: jest.fn(), timeout: false },
          save: { onToolCall: jest.fn() },
        },
      });

      expect(getRenderState().messages).toEqual(previousMessages);
    });

    it('does not repair explicitly provided pending messages', () => {
      const messages: UIMessage[] = [
        {
          id: 'assistant-1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-save',
              toolCallId: 'call-1',
              state: 'input-available',
              input: {},
            },
          ],
        },
      ];

      const { getRenderState } = getInitializedWidget({
        agentId: 'agentId',
        messages,
        tools: { save: { onToolCall: jest.fn() } },
      });

      expect(getRenderState().messages).toEqual(messages);
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
        tools: {
          algolia_search_index: {
            onToolCall: onSearchToolCall,
            timeout: false,
          },
        },
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

    it('lets a tool claim the names a server derives from it', async () => {
      const onToolCall = jest.fn();

      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-available", "toolCallId": "call_1", "toolName": "my_tool_movies", "input": {}}

data: {"type":"tool-output-available","toolCallId":"call_1","output":{}}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
        tools: {
          my_tool: {
            onToolCall,
            matchesToolName: (toolName: string) =>
              toolName.startsWith('my_tool_'),
            timeout: false,
          },
        },
      });

      await widget.chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'Trigger tool call' }],
      });

      await waitFor(() => {
        expect(onToolCall).toHaveBeenCalledWith(
          expect.objectContaining({ toolName: 'my_tool_movies' })
        );
      });
    });

    it('does not resolve a derived name for a tool that does not claim it', async () => {
      const onToolCall = jest.fn();

      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: {
          fetch: () =>
            Promise.resolve(
              new Response(
                `data: {"type": "start", "messageId": "test-id"}

data: {"type": "start-step"}

data: {"type": "tool-input-available", "toolCallId": "call_1", "toolName": "my_tool_movies", "input": {}}

data: {"type":"tool-output-available","toolCallId":"call_1","output":{}}

data: {"type": "finish-step"}

data: {"type": "finish"}

data: [DONE]`,
                {
                  headers: { 'Content-Type': 'text/event-stream' },
                }
              )
            ),
        },
        // `my_tool` and `my_tool_movies` are separate tools to the registry.
        tools: { my_tool: { onToolCall } },
      });

      await widget.chatInstance.sendMessage({
        id: 'message-id',
        role: 'user',
        parts: [{ type: 'text', text: 'Trigger tool call' }],
      });

      expect(onToolCall).not.toHaveBeenCalled();
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

  describe('sendAutomaticallyWhen', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    // A minimal, immediately-terminating assistant turn — enough for the
    // automatic follow-up request's stream to settle.
    const terminalStream = () =>
      new Response(
        `data: {"type": "start", "messageId": "assistant-2"}

data: {"type": "finish"}

data: [DONE]`,
        { headers: { 'Content-Type': 'text/event-stream' } }
      );

    // An assistant message with a single, still-unresolved tool call. Assigning
    // it directly (rather than streaming it in) keeps the test deterministic:
    // the only request that can fire is the auto-continuation from
    // `addToolResult`.
    const assistantWithPendingTool = () =>
      [
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hi' }] },
        {
          id: 'a1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-myTool',
              toolCallId: 'call_1',
              state: 'input-available',
              input: {},
            },
          ],
        },
      ] as unknown as UIMessage[];

    it('auto-continues by default once a resolved tool completes the assistant message', async () => {
      const fetchMock = jest.fn(() => Promise.resolve(terminalStream()));

      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: { fetch: fetchMock },
      } as ChatConnectorParams);

      widget.chatInstance.messages = assistantWithPendingTool();

      // Resolving the tool result flips the last assistant message's tool part
      // to `output-available`; the default
      // `lastAssistantMessageIsCompleteWithToolCalls` then resubmits. Awaiting
      // `addToolResult` waits for that follow-up to complete, so the assertion
      // is deterministic.
      await widget.chatInstance.addToolResult({
        tool: 'myTool',
        toolCallId: 'call_1',
        output: { ok: true },
      });

      await widget.chatInstance.addToolResult({
        tool: 'myTool',
        toolCallId: 'call_1',
        output: { ok: false },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(widget.chatInstance.messages[1].parts[0]).toMatchObject({
        output: { ok: true },
      });
    });

    it('does not auto-continue when a user `sendAutomaticallyWhen` returns false', async () => {
      const fetchMock = jest.fn(() => Promise.resolve(terminalStream()));
      const sendAutomaticallyWhen = jest.fn(() => false);

      const { widget } = getInitializedWidget({
        agentId: undefined,
        transport: { fetch: fetchMock },
        sendAutomaticallyWhen,
      } as ChatConnectorParams);

      widget.chatInstance.messages = assistantWithPendingTool();

      await widget.chatInstance.addToolResult({
        tool: 'myTool',
        toolCallId: 'call_1',
        output: { ok: true },
      });

      // The user predicate was consulted with the resolved messages...
      expect(sendAutomaticallyWhen).toHaveBeenCalledWith(
        expect.objectContaining({ messages: expect.any(Array) })
      );
      // ...and because it returned `false`, no automatic follow-up fired at
      // all. This is the escape hatch for the runaway auto-continuation loop: a
      // resolved tool no longer forces another completions request.
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('main search status', () => {
    const openStateKey = 'instantsearch-chat-open-state-chat';

    const chatStream = (chunks: UIMessageChunk[]) =>
      new Response(
        `${chunks
          .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
          .join('')}data: [DONE]`,
        { headers: { 'Content-Type': 'text/event-stream' } }
      );

    const startFailingSearch = (
      widgetParams: ChatConnectorParams,
      extraWidgets: Widget[] = []
    ) => {
      const { searches, searchClient } = createControlledSearchClient();
      const search = instantsearch({ indexName: 'indexName', searchClient });
      const errorEvent = new Promise<void>((resolve) => {
        search.on('error', () => resolve());
      });
      const widget = connectChat(jest.fn())({
        disableTriggerValidation: true,
        persistence: false,
        ...widgetParams,
      } as ChatConnectorParams);

      search.addWidgets([widget, ...extraWidgets]);
      search.start();

      return { errorEvent, search, searchClient, searches, widget };
    };

    beforeEach(() => {
      sessionStorage.clear();
    });

    it('schedules sibling renders that never reset the main search status', () => {
      sessionStorage.setItem(openStateKey, 'true');
      const scheduleRender = jest.fn();
      const instantSearchInstance = createInstantSearch({
        scheduleRender:
          scheduleRender as unknown as InstantSearch['scheduleRender'],
      });
      const widget = connectChat(jest.fn())({
        agentId: 'agentId',
        disableTriggerValidation: true,
        persistence: { messages: false, open: true },
      } as ChatConnectorParams);

      // `init`, with the open panel restored from the previous session.
      widget.init(createInitOptions({ instantSearchInstance }));

      expect(scheduleRender).toHaveBeenCalledTimes(1);
      expect(scheduleRender).toHaveBeenLastCalledWith(false);

      // `updateOpen`.
      widget
        .getWidgetRenderState(createInitOptions({ instantSearchInstance }))
        .setOpen(false);

      expect(scheduleRender).toHaveBeenCalledTimes(2);
      expect(scheduleRender).toHaveBeenLastCalledWith(false);

      // `renderOnStatusChange`.
      widget.chatInstance._state.status = 'streaming';

      expect(scheduleRender).toHaveBeenCalledTimes(3);
      expect(scheduleRender).toHaveBeenLastCalledWith(false);
    });

    it('leaves a failed main search in error when the chat opens', async () => {
      const { errorEvent, search, searchClient, searches } = startFailingSearch(
        {
          agentId: 'agentId',
        } as ChatConnectorParams
      );

      await wait(0);
      searches[0].rejecter(new Error('SERVER_ERROR'));
      await errorEvent;
      await wait(0);

      expect(search.status).toBe('error');
      expect(search.error).toEqual(new Error('SERVER_ERROR'));

      search.renderState.indexName.chat!.setOpen(true);
      await wait(0);

      expect(search.status).toBe('error');
      expect(search.error).toEqual(new Error('SERVER_ERROR'));
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    it('leaves a failed main search in error across a chat turn', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValue(
          chatStream([
            { type: 'start', messageId: 'assistant-1' },
            { type: 'text-start', id: 'text-1' },
            { type: 'text-delta', id: 'text-1', delta: 'Hello' },
            { type: 'text-end', id: 'text-1' },
            { type: 'finish' },
          ])
        );
      const { errorEvent, search, searchClient, searches, widget } =
        startFailingSearch({
          agentId: undefined,
          transport: { fetch: fetchMock },
        } as ChatConnectorParams);

      await wait(0);
      searches[0].rejecter(new Error('SERVER_ERROR'));
      await errorEvent;
      await wait(0);

      expect(search.status).toBe('error');
      expect(search.error).toEqual(new Error('SERVER_ERROR'));

      await widget.chatInstance.sendMessage({ text: 'hello' });
      await wait(0);

      expect(widget.chatInstance.messages).toHaveLength(2);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(search.status).toBe('error');
      expect(search.error).toEqual(new Error('SERVER_ERROR'));
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    it('keeps the error state stable when the chat renders after a late failure', async () => {
      const { errorEvent, search, searchClient, searches } = startFailingSearch(
        {
          agentId: 'agentId',
        } as ChatConnectorParams
      );

      await wait(0);
      searches[0].resolver();
      await wait(0);

      expect(search.status).toBe('idle');

      search.mainHelper!.search();
      await wait(0);
      searches[1].rejecter(new Error('SERVER_ERROR'));
      await errorEvent;
      await wait(0);

      expect(search.status).toBe('error');

      // A chat render now sees the `error` status, which is what the index
      // reads to restore the last valid search parameters. Neither the render
      // nor that restore may turn into another request.
      search.renderState.indexName.chat!.setOpen(true);
      await wait(0);

      expect(search.status).toBe('error');
      expect(search.error).toEqual(new Error('SERVER_ERROR'));
      expect(searchClient.search).toHaveBeenCalledTimes(2);
    });

    it('keeps a refinement made after a failure that a chat render shares a tick with', async () => {
      const { errorEvent, search, searchClient, searches } = startFailingSearch(
        {
          agentId: 'agentId',
        } as ChatConnectorParams,
        [connectSearchBox(jest.fn())({})]
      );

      await wait(0);
      searches[0].resolver();
      await wait(0);

      search.mainHelper!.search();
      await wait(0);
      searches[1].rejecter(new Error('SERVER_ERROR'));
      await errorEvent;
      await wait(0);

      expect(search.status).toBe('error');

      // A chat render and a refinement land in the same tick. The chat render
      // runs before the search `setUiState` defers, so the index must not roll
      // the refinement back on it.
      search.renderState.indexName.chat!.setOpen(false);
      search.setUiState({ indexName: { query: 'shoes' } });
      await wait(0);

      expect(search.getUiState()).toEqual({ indexName: { query: 'shoes' } });
      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(
        (searchClient.search as jest.Mock).mock.calls[2][0][0].params.query
      ).toBe('shoes');
    });

    it('does not restore the previous search parameters again on later chat renders', async () => {
      const { errorEvent, search, searches } = startFailingSearch({
        agentId: 'agentId',
      } as ChatConnectorParams);

      await wait(0);
      searches[0].resolver();
      await wait(0);

      search.mainHelper!.search();
      await wait(0);
      searches[1].rejecter(new Error('SERVER_ERROR'));
      await errorEvent;
      await wait(0);

      expect(search.status).toBe('error');

      // The failed search already rolled the parameters back. Repeated chat
      // renders must not keep re-emitting that write, or every middleware
      // `onStateChange` fires for chat panel activity.
      const onChange = jest.fn();
      search.mainIndex.getHelper()!.on('change', onChange);

      search.renderState.indexName.chat!.setOpen(true);
      await wait(0);
      search.renderState.indexName.chat!.setOpen(false);
      await wait(0);
      search.renderState.indexName.chat!.setOpen(true);
      await wait(0);

      expect(search.status).toBe('error');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('still settles the main search once its results arrive after a chat render', async () => {
      const { search, searches, widget } = startFailingSearch({
        agentId: 'agentId',
      } as ChatConnectorParams);

      await wait(0);

      expect(search.status).toBe('loading');

      // A chat render lands while the search it knows nothing about is still
      // in flight. Suppressing the status reset must not strand it on
      // `loading`.
      widget.chatInstance._state.status = 'streaming';
      searches[0].resolver();
      await wait(0);

      expect(search.status).toBe('idle');
      expect(search.error).toBeUndefined();
    });
  });
});
