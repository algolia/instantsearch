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
import connectChat from '../connectChat';

import type { UIMessage } from '../../../lib/chat';
import type { InstantSearch, IndexWidget } from '../../../types';
import type { ChatConnectorParams } from '../connectChat';

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
});
