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
        messages: [],
        '~registerErrorCallback': (_onChange: () => void) => {},
        '~registerMessagesCallback': (_onChange: () => void) => {},
        '~registerStatusCallback': (_onChange: () => void) => {},
      })),
    };
  });
}
