import {
  flattenErrorMessageForMatching,
  genericChatErrorDisplayResolvers,
  getChatErrorDisplayMessage,
  getStartNewConversationErrorDisplayMessage,
  isConversationThreadDepthLimitError,
  isPartText,
  isRequestOriginNotAllowedError,
  isStartNewConversationError,
  registerGenericChatErrorDisplayResolver,
  registerNewConversationErrorMatcher,
  registerStartNewConversationErrorDisplayResolver,
  newConversationErrorMatchers,
  startNewConversationErrorDisplayResolvers,
} from '../chat';

describe('isConversationThreadDepthLimitError', () => {
  test('returns true for Agent Studio thread depth wording', () => {
    expect(
      isConversationThreadDepthLimitError(
        new Error(
          'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.'
        )
      )
    ).toBe(true);
  });

  test('is case-insensitive', () => {
    expect(
      isConversationThreadDepthLimitError(
        new Error('MAXIMUM THREAD DEPTH reached')
      )
    ).toBe(true);
  });

  test('returns false for other errors', () => {
    expect(
      isConversationThreadDepthLimitError(new Error('HTTP error: 500'))
    ).toBe(false);
    expect(isConversationThreadDepthLimitError(undefined)).toBe(false);
  });

  test('returns false for LangGraph recursion errors (use isStartNewConversationError)', () => {
    expect(
      isConversationThreadDepthLimitError(
        new Error('Recursion limit of 5 reached. recursion_limit GRAPH_RECURSION_LIMIT')
      )
    ).toBe(false);
  });
});

describe('isStartNewConversationError', () => {
  test('includes thread depth', () => {
    expect(
      isStartNewConversationError(
        new Error(
          'Conversation has reached its maximum thread depth of 3 messages.'
        )
      )
    ).toBe(true);
  });

  test('detects LangGraph / stream errorText with nested JSON', () => {
    const raw =
      '"{\\"error\\": \\"Recursion limit of 5 reached without hitting a stop condition. \\\\nFor troubleshooting: GRAPH_RECURSION_LIMIT\\"}"';
    expect(isStartNewConversationError(new Error(raw))).toBe(true);
  });

  test('detects Recursion limit of after flattening JSON', () => {
    const raw = JSON.stringify({
      error:
        'Recursion limit of 5 reached. Set recursion_limit in config. See GRAPH_RECURSION_LIMIT',
    });
    expect(isStartNewConversationError(new Error(raw))).toBe(true);
  });

  test('detects max_output_tokens / incomplete response (same UX as thread depth)', () => {
    expect(
      isStartNewConversationError(
        new Error('Response is incomplete due to: max_output_tokens')
      )
    ).toBe(true);
  });

  test('detects rate limiting (phrase and HTTP 429)', () => {
    expect(
      isStartNewConversationError(
        new Error('Rate limit exceeded. Retry after 60 seconds.')
      )
    ).toBe(true);
    expect(
      isStartNewConversationError(new Error('HTTP error: 429 Too Many Requests'))
    ).toBe(true);
  });

  test('does not match on GRAPH_RECURSION_LIMIT alone without Recursion limit of', () => {
    expect(
      isStartNewConversationError(
        new Error('See https://docs.../GRAPH_RECURSION_LIMIT')
      )
    ).toBe(false);
  });

  test('returns false for unrelated errors', () => {
    expect(isStartNewConversationError(new Error('HTTP error: 500'))).toBe(
      false
    );
    expect(isStartNewConversationError(undefined)).toBe(false);
  });

  test('registerNewConversationErrorMatcher extends behavior', () => {
    const len = newConversationErrorMatchers.length;
    registerNewConversationErrorMatcher((m) => m.includes('CUSTOM_XYZ'));
    expect(isStartNewConversationError(new Error('CUSTOM_XYZ'))).toBe(true);
    newConversationErrorMatchers.pop();
    expect(newConversationErrorMatchers.length).toBe(len);
  });
});

describe('isRequestOriginNotAllowedError', () => {
  test('returns true for Agent Studio 403 origin message', () => {
    expect(
      isRequestOriginNotAllowedError(
        new Error(
          'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.'
        )
      )
    ).toBe(true);
  });

  test('unwraps JSON message field', () => {
    const body = JSON.stringify({
      message:
        'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.',
    });
    expect(isRequestOriginNotAllowedError(new Error(body))).toBe(true);
  });

  test('returns false for unrelated errors', () => {
    expect(isRequestOriginNotAllowedError(new Error('HTTP error: 403'))).toBe(
      false
    );
    expect(isRequestOriginNotAllowedError(undefined)).toBe(false);
  });
});

describe('getChatErrorDisplayMessage', () => {
  test('surfaces Agent Studio request-origin API message', () => {
    const api =
      'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.';
    expect(getChatErrorDisplayMessage(new Error(api))).toBe(api);
  });

  test('registerGenericChatErrorDisplayResolver overrides built-in origin copy', () => {
    const len = genericChatErrorDisplayResolvers.length;
    registerGenericChatErrorDisplayResolver((flat) =>
      flat.includes('allowed domains list') ? 'Custom origin hint' : null
    );
    expect(
      getChatErrorDisplayMessage(
        new Error(
          'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.'
        )
      )
    ).toBe('Custom origin hint');
    genericChatErrorDisplayResolvers.shift();
    expect(genericChatErrorDisplayResolvers.length).toBe(len);
  });

  test('surfaces max_output_tokens / incomplete response API text', () => {
    const msg = 'Response is incomplete due to: max_output_tokens';
    expect(getChatErrorDisplayMessage(new Error(msg))).toBe(msg);
  });

  test('unwraps JSON-wrapped stream error (error field)', () => {
    const inner = 'Response is incomplete due to: max_output_tokens';
    const wrapped = JSON.stringify({
      error: inner,
    });
    expect(getChatErrorDisplayMessage(new Error(wrapped))).toBe(inner);
  });

  test('delegates to start-new conversation and surfaces thread depth API text', () => {
    expect(
      getChatErrorDisplayMessage(
        new Error(
          'Conversation has reached its maximum thread depth of 3 messages.'
        )
      )
    ).toBe('Conversation has reached its maximum thread depth of 3 messages.');
  });
});

describe('getStartNewConversationErrorDisplayMessage', () => {
  test('surfaces thread depth API text', () => {
    expect(
      getStartNewConversationErrorDisplayMessage(
        new Error(
          'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.'
        )
      )
    ).toBe(
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.'
    );
  });

  test('surfaces LangGraph recursion API text', () => {
    const long =
      'Recursion limit of 5 reached without hitting a stop condition. You can increase the limit by setting the `recursion_limit` config key. For troubleshooting, visit: https://example.com';
    expect(getStartNewConversationErrorDisplayMessage(new Error(long))).toBe(
      long
    );
  });

  test('prefers recursion when the same payload also mentions thread depth', () => {
    const combined =
      'Recursion limit of 5 reached.\nConversation has reached its maximum thread depth of 3 messages. Please start a new conversation.';
    expect(getStartNewConversationErrorDisplayMessage(new Error(combined))).toBe(
      combined
    );
  });

  test('unwraps JSON message field for thread depth display', () => {
    const inner =
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.';
    const body = JSON.stringify({
      message: inner,
    });
    expect(getStartNewConversationErrorDisplayMessage(new Error(body))).toBe(
      inner
    );
  });

  test('surfaces max_output_tokens API text', () => {
    const msg = 'Response is incomplete due to: max_output_tokens';
    expect(getStartNewConversationErrorDisplayMessage(new Error(msg))).toBe(
      msg
    );
  });

  test('surfaces max steps API text', () => {
    const msg = 'Maximum steps (25) exceeded for this run.';
    expect(isStartNewConversationError(new Error(msg))).toBe(true);
    expect(getStartNewConversationErrorDisplayMessage(new Error(msg))).toBe(
      msg
    );
    expect(getChatErrorDisplayMessage(new Error(msg))).toBe(msg);
  });

  test('surfaces rate limit API text', () => {
    const msg = 'Rate limit exceeded. Retry after 60 seconds.';
    expect(isStartNewConversationError(new Error(msg))).toBe(true);
    expect(getStartNewConversationErrorDisplayMessage(new Error(msg))).toBe(msg);
    expect(getChatErrorDisplayMessage(new Error(msg))).toBe(msg);
  });

  test('thread depth API text never maps to max_output copy', () => {
    const api =
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.';
    expect(getStartNewConversationErrorDisplayMessage(new Error(api))).toBe(
      api
    );
    expect(getChatErrorDisplayMessage(new Error(api))).toBe(api);
  });

  test('returns undefined when not a start-new error', () => {
    expect(
      getStartNewConversationErrorDisplayMessage(new Error('HTTP 500'))
    ).toBeUndefined();
  });

  test('registerStartNewConversationErrorDisplayResolver prepends custom copy', () => {
    const matcherLen = newConversationErrorMatchers.length;
    const resolverLen = startNewConversationErrorDisplayResolvers.length;
    registerNewConversationErrorMatcher((m) => m.includes('CUSTOM_ABC'));
    registerStartNewConversationErrorDisplayResolver((flat) =>
      flat.includes('CUSTOM_ABC') ? 'Custom message' : null
    );
    expect(
      getStartNewConversationErrorDisplayMessage(new Error('CUSTOM_ABC detail'))
    ).toBe('Custom message');
    startNewConversationErrorDisplayResolvers.shift();
    newConversationErrorMatchers.pop();
    expect(startNewConversationErrorDisplayResolvers.length).toBe(resolverLen);
    expect(newConversationErrorMatchers.length).toBe(matcherLen);
  });
});

describe('flattenErrorMessageForMatching', () => {
  test('unwraps stringified JSON with error field', () => {
    const inner = { error: 'Recursion limit of 5 reached. recursion_limit' };
    const raw = JSON.stringify(JSON.stringify(inner));
    const flat = flattenErrorMessageForMatching(raw);
    expect(flat).toContain('Recursion limit');
    expect(flat).toContain('recursion_limit');
  });

  test('unwraps JSON with message field', () => {
    const inner = {
      message:
        'Conversation has reached its maximum thread depth of 3 messages.',
    };
    const flat = flattenErrorMessageForMatching(JSON.stringify(inner));
    expect(flat).toContain('maximum thread depth');
  });
});

describe('isPartText', () => {
  test('narrows type for text parts', () => {
    expect(isPartText({ type: 'text', text: 'x' })).toBe(true);
    expect(isPartText({ type: 'step-start' } as any)).toBe(false);
  });
});
