export function mockAiSdk() {
  jest.mock('ai', () => {
    return {
      DefaultChatTransport: jest.fn().mockImplementation(() => ({
        sendMessage: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
      })),
    };
  });

  jest.mock('instantsearch.js/es/lib/chat', () => {
    return {
      Chat: jest.fn().mockImplementation(() => ({
        id: 'mock-chat-id',
        messages: [],
        status: 'idle',
        error: undefined,
        sendMessage: jest.fn(),
        regenerate: jest.fn(),
        clearError: jest.fn(),
        stop: jest.fn(),
        resumeStream: jest.fn(),
        addToolResult: jest.fn(),
        '~registerMessagesCallback': jest.fn(),
        '~registerStatusCallback': jest.fn(),
        '~registerErrorCallback': jest.fn(),
      })),
    };
  });
}
