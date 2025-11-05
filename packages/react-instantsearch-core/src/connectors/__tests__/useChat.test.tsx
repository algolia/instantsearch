/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { renderHook, act } from '@testing-library/react';
import { DefaultChatTransport } from 'ai';
import { Chat } from 'instantsearch.js/es/lib/chat';

import { useChat } from '../useChat';

jest.mock('instantsearch.js/es/lib/chat', () => ({
  Chat: jest.fn(),
}));

jest.mock('ai', () => ({
  DefaultChatTransport: jest.fn(),
}));

jest.mock('../../lib/useAppIdAndApiKey', () => ({
  useAppIdAndApiKey: jest.fn(() => ['test-app-id', 'test-api-key']),
}));

describe('useChat', () => {
  let mockChatInstance: any;
  let mockTransport: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChatInstance = {
      id: 'test-chat-id',
      messages: [],
      status: 'ready',
      error: undefined,
      sendMessage: jest.fn(),
      regenerate: jest.fn(),
      stop: jest.fn(),
      resumeStream: jest.fn(),
      addToolResult: jest.fn(),
      clearError: jest.fn(),
      '~registerMessagesCallback': (_cb: () => void) => () => {},
      '~registerStatusCallback': (_cb: () => void) => () => {},
      '~registerErrorCallback': (_cb: () => void) => () => {},
    };

    (Chat as jest.MockedClass<typeof Chat>).mockImplementation(() => {
      return mockChatInstance;
    });

    mockTransport = {};
    (
      DefaultChatTransport as jest.MockedClass<typeof DefaultChatTransport>
    ).mockImplementation(() => {
      return mockTransport;
    });
  });

  describe('initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
        })
      );

      expect(result.current).toEqual({
        id: 'test-chat-id',
        messages: [],
        setMessages: expect.any(Function),
        input: '',
        setInput: expect.any(Function),
        open: false,
        setOpen: expect.any(Function),
        isClearing: false,
        clearMessages: expect.any(Function),
        onClearTransitionEnd: expect.any(Function),
        tools: {},
        sendMessage: expect.any(Function),
        regenerate: expect.any(Function),
        clearError: expect.any(Function),
        stop: expect.any(Function),
        error: undefined,
        resumeStream: expect.any(Function),
        status: 'ready',
        addToolResult: expect.any(Function),
      });
    });

    it('initializes with custom initial values', () => {
      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
          initialInput: 'Hello',
          defaultOpen: true,
        })
      );

      expect(result.current.input).toBe('Hello');
      expect(result.current.open).toBe(true);
    });

    it('creates transport with agentId', () => {
      renderHook(() =>
        useChat({
          agentId: 'test-agent-id',
        })
      );

      expect(DefaultChatTransport).toHaveBeenCalledWith({
        api: 'https://test-app-id.algolia.net/agent-studio/1/agents/test-agent-id/completions?compatibilityMode=ai-sdk-5',
        headers: {
          'x-algolia-application-id': 'test-app-id',
          'x-algolia-api-Key': 'test-api-key',
        },
      });
    });

    it('uses custom transport when provided', () => {
      const customTransport = { api: 'https://custom.api' };

      renderHook(() =>
        useChat({
          transport: customTransport,
        })
      );

      expect(DefaultChatTransport).toHaveBeenCalledWith(customTransport);
    });

    it('accepts a Chat instance directly', () => {
      const customChatInstance = new Chat({
        transport: mockTransport,
      });

      const { result } = renderHook(() =>
        useChat({
          chat: customChatInstance,
          agentId: 'agentId',
        })
      );

      expect(result.current.id).toBe('test-chat-id');
    });
  });

  describe('state management', () => {
    it('updates input state', () => {
      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
        })
      );

      expect(result.current.input).toBe('');

      act(() => {
        result.current.setInput('Hello');
      });

      expect(result.current.input).toBe('Hello');
    });

    it('updates open state', () => {
      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
        })
      );

      expect(result.current.open).toBe(false);

      act(() => {
        result.current.setOpen(true);
      });

      expect(result.current.open).toBe(true);
    });

    it('updates clearing state when clearMessages is called', () => {
      mockChatInstance.messages = [{ id: '1', role: 'user', content: 'Hello' }];

      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
        })
      );

      expect(result.current.isClearing).toBe(false);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.isClearing).toBe(true);
    });

    it('does not set clearing state when messages are empty', () => {
      mockChatInstance.messages = [];

      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
        })
      );

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.isClearing).toBe(false);
    });

    it('clears messages and resets state on transition end', () => {
      mockChatInstance.messages = [{ id: '1', role: 'user', content: 'Hello' }];

      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
        })
      );

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.isClearing).toBe(true);

      act(() => {
        result.current.onClearTransitionEnd();
      });

      expect(result.current.isClearing).toBe(false);
      expect(mockChatInstance.clearError).toHaveBeenCalled();
      expect(mockChatInstance.messages).toHaveLength(0);
    });

    it('updates messages with function', () => {
      mockChatInstance.messages = [
        { id: '1', role: 'user', content: 'Hello', parts: [] },
      ];

      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
        })
      );

      act(() => {
        result.current.setMessages((prev) => [
          ...prev,
          { id: '2', role: 'assistant', content: 'Hi there', parts: [] },
        ]);
      });

      expect(mockChatInstance.messages).toHaveLength(2);
    });
  });

  describe('tool handling', () => {
    it('provides tools with addToolResult injected', () => {
      const mockTool = {
        description: 'A test tool',
        parameters: {},
        onToolCall: jest.fn(),
        layoutComponent: jest.fn(),
      };

      const { result } = renderHook(() =>
        useChat({
          agentId: 'agentId',
          tools: {
            testTool: mockTool,
          },
        })
      );

      expect(result.current.tools.testTool).toEqual({
        ...mockTool,
        addToolResult: mockChatInstance.addToolResult,
      });
    });

    it('calls tool onToolCall when provided', () => {
      const mockTool = {
        description: 'A test tool',
        parameters: {},
        onToolCall: jest.fn(),
        layoutComponent: jest.fn(),
      };

      renderHook(() =>
        useChat({
          agentId: 'agentId',
          tools: {
            testTool: mockTool,
          },
        })
      );

      const chatConstructorCall = (Chat as jest.MockedClass<typeof Chat>).mock
        .calls[0][0];
      const onToolCallHandler = chatConstructorCall.onToolCall;

      expect(onToolCallHandler).toBeDefined();

      const toolCall = {
        toolName: 'testTool',
        toolCallId: 'call-123',
        input: {},
      };

      act(() => {
        onToolCallHandler?.({ toolCall });
      });

      expect(mockTool.onToolCall).toHaveBeenCalledWith({
        ...toolCall,
        addToolResult: expect.any(Function),
      });
    });

    it('handles missing tool implementation in production', () => {
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = false;

      renderHook(() =>
        useChat({
          agentId: 'agentId',
          tools: {},
        })
      );

      const chatConstructorCall = (Chat as jest.MockedClass<typeof Chat>).mock
        .calls[0][0];
      const onToolCallHandler = chatConstructorCall.onToolCall;

      const toolCall = {
        toolName: 'nonExistentTool',
        toolCallId: 'call-123',
        input: {},
      };

      act(() => {
        onToolCallHandler?.({ toolCall });
      });

      expect(mockChatInstance.addToolResult).toHaveBeenCalledWith({
        output: 'No tool implemented for "nonExistentTool".',
        tool: 'nonExistentTool',
        toolCallId: 'call-123',
      });

      (global as any).__DEV__ = originalDev;
    });

    it('throws error for missing tool in development', () => {
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = true;

      renderHook(() =>
        useChat({
          agentId: 'agentId',
          tools: {},
        })
      );

      const chatConstructorCall = (Chat as jest.MockedClass<typeof Chat>).mock
        .calls[0][0];
      const onToolCallHandler = chatConstructorCall.onToolCall;

      const toolCall = {
        toolName: 'nonExistentTool',
        toolCallId: 'call-123',
        input: {},
      };

      expect(() => {
        act(() => {
          onToolCallHandler?.({ toolCall });
        });
      }).toThrow(
        'No tool implementation found for "nonExistentTool". Please provide a tool implementation in the `tools` prop.'
      );

      (global as any).__DEV__ = originalDev;
    });
  });

  describe('chat instance recreation', () => {
    it('recreates chat instance when chat prop changes', () => {
      const firstMockInstance = {
        ...mockChatInstance,
        id: 'first-chat-id',
      };
      const secondMockInstance = {
        ...mockChatInstance,
        id: 'second-chat-id',
      };

      let callCount = 0;
      (Chat as jest.MockedClass<typeof Chat>).mockImplementation(() => {
        callCount++;
        return callCount === 1 ? firstMockInstance : secondMockInstance;
      });

      const firstChat = new Chat({ transport: mockTransport });
      const secondChat = new Chat({ transport: mockTransport });

      const { result, rerender } = renderHook(
        ({ chat }) =>
          useChat({
            chat,
            agentId: 'agentId',
          }),
        {
          initialProps: { chat: firstChat },
        }
      );

      expect(result.current.id).toBe('first-chat-id');

      rerender({ chat: secondChat });

      expect(result.current.id).toBe('second-chat-id');
    });

    it('recreates chat instance when id changes', () => {
      const { rerender } = renderHook(
        ({ id }) => useChat({ agentId: 'agentId', id }),
        {
          initialProps: { id: 'chat-1' },
        }
      );

      const firstCallCount = (Chat as jest.MockedClass<typeof Chat>).mock.calls
        .length;

      mockChatInstance.id = 'chat-2';

      rerender({ id: 'chat-2' });

      expect((Chat as jest.MockedClass<typeof Chat>).mock.calls.length).toBe(
        firstCallCount + 1
      );
    });
  });
});
