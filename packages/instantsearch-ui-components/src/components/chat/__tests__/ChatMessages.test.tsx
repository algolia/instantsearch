/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatMessagesComponent } from '../ChatMessages';

const ChatMessages = createChatMessagesComponent({
  createElement,
  Fragment,
});

describe('ChatMessages', () => {
  test('renders with default props', () => {
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          aria-live="polite"
          class="ais-ChatMessages"
          role="log"
        >
          <div
            class="ais-ChatMessages-scroll ais-Scrollbar"
          >
            <div
              class="ais-ChatMessages-content"
            />
          </div>
          <button
            aria-label="Scroll to bottom"
            class="ais-Button ais-Button--outline ais-Button--sm ais-Button--icon-only ais-ChatMessages-scrollToBottom"
            tabindex="0"
            type="button"
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6 9 6 6 6-6"
              />
            </svg>
          </button>
        </div>
      </div>
    `);
  });

  test('renders with messages', () => {
    const Messages = jest.fn(() => <span>Messages</span>);

    const { container } = render(
      <ChatMessages
        messages={[
          {
            role: 'user',
            content: 'Hello',
            id: '1',
            parts: [{ type: 'text', text: 'Test text' }],
          },
        ]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        messageComponent={Messages}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(Messages).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          role: 'user',
          content: 'Hello',
          id: '1',
          parts: [{ type: 'text', text: 'Test text' }],
        }),
      }),
      {}
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          aria-live="polite"
          class="ais-ChatMessages"
          role="log"
        >
          <div
            class="ais-ChatMessages-scroll ais-Scrollbar"
          >
            <div
              class="ais-ChatMessages-content"
            >
              <span>
                Messages
              </span>
            </div>
          </div>
          <button
            aria-label="Scroll to bottom"
            class="ais-Button ais-Button--outline ais-Button--sm ais-Button--icon-only ais-ChatMessages-scrollToBottom"
            tabindex="0"
            type="button"
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6 9 6 6 6-6"
              />
            </svg>
          </button>
        </div>
      </div>
    `);
  });

  describe('feedback', () => {
    const assistantMessage = {
      role: 'assistant' as const,
      id: 'msg-1',
      parts: [{ type: 'text' as const, text: 'Hello!' }],
    };

    test('renders thumbs up/down when onFeedback is provided', () => {
      const { container } = render(
        <ChatMessages
          messages={[assistantMessage]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
          onFeedback={jest.fn()}
          feedbackState={{}}
        />
      );

      expect(
        container.querySelectorAll(
          '[aria-label="Like"], [aria-label="Dislike"]'
        )
      ).toHaveLength(2);
    });

    test('does not render thumbs when onFeedback is not provided', () => {
      const { container } = render(
        <ChatMessages
          messages={[assistantMessage]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
          feedbackState={{}}
        />
      );

      expect(
        container.querySelectorAll(
          '[aria-label="Like"], [aria-label="Dislike"]'
        )
      ).toHaveLength(0);
    });

    test('renders spinner when feedbackState is sending', () => {
      const { container } = render(
        <ChatMessages
          messages={[assistantMessage]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
          onFeedback={jest.fn()}
          feedbackState={{ 'msg-1': 'sending' }}
        />
      );

      expect(
        container.querySelector('.ais-ChatMessage-feedbackSpinner')
      ).not.toBeNull();
      expect(
        container.querySelectorAll(
          '[aria-label="Like"], [aria-label="Dislike"]'
        )
      ).toHaveLength(0);
    });

    test('renders check icon and thank you text when voted', () => {
      const { container } = render(
        <ChatMessages
          messages={[assistantMessage]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
          onFeedback={jest.fn()}
          feedbackState={{ 'msg-1': 1 }}
        />
      );

      expect(
        container.querySelector('.ais-ChatMessage-feedbackCheck')
      ).not.toBeNull();
      expect(
        container.querySelector('.ais-ChatMessage-feedbackText')
      ).not.toBeNull();
      expect(
        container.querySelector('.ais-ChatMessage-feedbackText')!.textContent
      ).toBe('Thanks for your feedback!');
    });

    test('does not render thumbs on user messages', () => {
      const userMessage = {
        role: 'user' as const,
        id: 'msg-2',
        parts: [{ type: 'text' as const, text: 'Hi' }],
      };

      const { container } = render(
        <ChatMessages
          messages={[userMessage]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
          onFeedback={jest.fn()}
          feedbackState={{}}
        />
      );

      expect(
        container.querySelectorAll(
          '[aria-label="Like"], [aria-label="Dislike"]'
        )
      ).toHaveLength(0);
    });
  });

  test('shows API error message when status is error and error is set', () => {
    const apiMessage =
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.';

    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe(apiMessage);
  });

  test('conversation depth error shows API text only, no link or retry without handler', () => {
    const apiMessage =
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.';

    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError--conversationLimit')
    ).not.toBeNull();
    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe(apiMessage);
    expect(container.querySelector('.ais-ChatMessageError-link')).toBeNull();
    expect(container.querySelector('.ais-ChatMessage-errorAction')).toBeNull();
  });

  test('conversation depth error renders start-new link when handler is provided', () => {
    const apiMessage =
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.';
    const onStartNewConversation = jest.fn();

    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
        onStartNewConversation={onStartNewConversation}
      />
    );

    const link = container.querySelector('.ais-ChatMessageError-link');
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe('Start a new conversation');

    fireEvent.click(link!);
    expect(onStartNewConversation).toHaveBeenCalledTimes(1);
  });

  test('recursion limit error surfaces API text', () => {
    const long =
      'Recursion limit of 5 reached without hitting a stop condition. You can increase the limit by setting the `recursion_limit` config key.';

    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(long)}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe(long);
  });

  test('max_output_tokens error uses conversation-limit variant like thread depth', () => {
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error('Response is incomplete due to: max_output_tokens')}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError--conversationLimit')
    ).not.toBeNull();
    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe('Response is incomplete due to: max_output_tokens');
    expect(container.querySelector('.ais-ChatMessage-errorAction')).toBeNull();
    expect(container.querySelector('.ais-ChatMessageError-link')).toBeNull();
  });

  test('max_output_tokens error renders start-new link when handler is provided', () => {
    const onStartNewConversation = jest.fn();
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error('Response is incomplete due to: max_output_tokens')}
        onStartNewConversation={onStartNewConversation}
      />
    );

    const link = container.querySelector('.ais-ChatMessageError-link');
    expect(link).not.toBeNull();
    fireEvent.click(link!);
    expect(onStartNewConversation).toHaveBeenCalledTimes(1);
  });

  test('rate limit error uses conversation-limit variant and API text', () => {
    const apiMessage = 'Rate limit exceeded. Retry after 60 seconds.';
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError--conversationLimit')
    ).not.toBeNull();
    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe(apiMessage);
    expect(container.querySelector('.ais-ChatMessage-errorAction')).toBeNull();
  });

  test('rate limit error renders start-new link when handler is provided', () => {
    const onStartNewConversation = jest.fn();
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error('HTTP error: 429 Too Many Requests')}
        onStartNewConversation={onStartNewConversation}
      />
    );

    const link = container.querySelector('.ais-ChatMessageError-link');
    expect(link).not.toBeNull();
    fireEvent.click(link!);
    expect(onStartNewConversation).toHaveBeenCalledTimes(1);
  });

  test('request origin not allowed error uses conversation-limit layout without retry', () => {
    const apiMessage =
      'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.';
    const onReload = jest.fn();
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={onReload}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError--conversationLimit')
    ).not.toBeNull();
    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe(apiMessage);
    expect(container.querySelector('.ais-ChatMessage-errorAction')).toBeNull();
    expect(onReload).not.toHaveBeenCalled();
  });

  test('request origin error renders start-new link when handler is provided', () => {
    const apiMessage =
      'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.';
    const onStartNewConversation = jest.fn();
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
        onStartNewConversation={onStartNewConversation}
      />
    );

    const link = container.querySelector('.ais-ChatMessageError-link');
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe('Start a new conversation');
    fireEvent.click(link!);
    expect(onStartNewConversation).toHaveBeenCalledTimes(1);
  });

  test('requestOriginNotAllowedErrorMessage translation overrides default copy', () => {
    const apiMessage =
      'Request origin is not in the allowed domains list. Add your domain in Agent Studio settings.';

    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
        translations={{
          requestOriginNotAllowedErrorMessage: 'Origin blocked — fix in Studio',
        }}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe('Origin blocked — fix in Studio');
  });

  test('conversationLimitErrorMessage translation overrides default message', () => {
    const apiMessage =
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.';

    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error(apiMessage)}
        translations={{
          conversationLimitErrorMessage: 'Thread limit — start over',
        }}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError-primary')?.textContent
    ).toBe('Thread limit — start over');
  });

  test('renders with custom class names', () => {
    const { container } = render(
      <ChatMessages
        messages={[]}
        classNames={{
          root: 'root',
          scroll: 'scroll',
          content: 'content',
          scrollToBottom: 'scrollToBottom',
        }}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          aria-live="polite"
          class="ais-ChatMessages root"
          role="log"
        >
          <div
            class="ais-ChatMessages-scroll ais-Scrollbar scroll"
          >
            <div
              class="ais-ChatMessages-content content"
            />
          </div>
          <button
            aria-label="Scroll to bottom"
            class="ais-Button ais-Button--outline ais-Button--sm ais-Button--icon-only ais-ChatMessages-scrollToBottom scrollToBottom"
            tabindex="0"
            type="button"
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6 9 6 6 6-6"
              />
            </svg>
          </button>
        </div>
      </div>
    `);
  });
});
