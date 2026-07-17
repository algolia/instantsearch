/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render, screen } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatMessageErrorComponent } from '../ChatMessageError';
import { createChatMessagesComponent } from '../ChatMessages';

import type { ChatMessageErrorProps } from '../ChatMessageError';
import type { ChatComponentPropsWithMetadata } from '../types';

const ChatMessages = createChatMessagesComponent({
  createElement,
  Fragment,
  memo: (component) => component,
});
const ChatMessageError = createChatMessageErrorComponent({ createElement });

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

  describe('parseMarkdown', () => {
    test('parses user message text as markdown by default', () => {
      const { container } = render(
        <ChatMessages
          messages={[
            {
              role: 'user',
              id: '1',
              parts: [{ type: 'text', text: 'a *b* c' }],
            },
          ]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(container.querySelector('em')).not.toBeNull();
      expect(container.querySelector('.ais-ChatMessage-text')).toBeNull();
    });

    test('renders user message text as plain text via userMessageProps', () => {
      const { container } = render(
        <ChatMessages
          messages={[
            {
              role: 'user',
              id: '1',
              parts: [{ type: 'text', text: 'a *b* c\nsecond line' }],
            },
          ]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
          userMessageProps={{ parseMarkdown: false }}
        />
      );

      const text = container.querySelector('.ais-ChatMessage-text');
      expect(text).not.toBeNull();
      // No markdown transformation, and the newline is preserved.
      expect(text!.textContent).toBe('a *b* c\nsecond line');
      expect(container.querySelector('em')).toBeNull();
    });

    test('only affects the targeted role', () => {
      const { container } = render(
        <ChatMessages
          messages={[
            {
              role: 'user',
              id: '1',
              parts: [{ type: 'text', text: 'user *text*' }],
            },
            {
              role: 'assistant',
              id: '2',
              parts: [{ type: 'text', text: 'assistant *text*' }],
            },
          ]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
          userMessageProps={{ parseMarkdown: false }}
        />
      );

      const messages = container.querySelectorAll('.ais-ChatMessage-message');
      // User message: plain text, no emphasis.
      expect(messages[0].querySelector('.ais-ChatMessage-text')).not.toBeNull();
      expect(messages[0].querySelector('em')).toBeNull();
      // Assistant message: still parsed as markdown.
      expect(messages[1].querySelector('em')).not.toBeNull();
      expect(messages[1].querySelector('.ais-ChatMessage-text')).toBeNull();
    });
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

  test('does not expose raw API error message by default', () => {
    render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error('Request blocked for this domain')}
      />
    );

    expect(
      screen.getByText(
        'Sorry, we are not able to generate a response at the moment. Please contact support.'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Request blocked for this domain')
    ).not.toBeInTheDocument();
  });

  test('renders the raw error message verbatim for guardrail violations', () => {
    const fallbackResponse =
      "I'm sorry I couldn't respond to that, please try again with another message.";
    const guardrailError = new Error(fallbackResponse);
    guardrailError.name = 'GuardrailViolationError';

    render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={guardrailError}
      />
    );

    expect(screen.getByText(fallbackResponse)).toBeInTheDocument();
    // Friendly default should NOT be shown — guardrail messages are
    // service-authored copy meant for end users, so we trust them.
    expect(
      screen.queryByText(
        'Sorry, we are not able to generate a response at the moment. Please contact support.'
      )
    ).not.toBeInTheDocument();
  });

  test('does not render an action button by default in error state', () => {
    const { container } = render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error('Request blocked for this domain')}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageError .ais-ChatMessage-actions')
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Start a new conversation' })
    ).toBeNull();
  });

  test('renders a "Start a new conversation" button when onNewConversation is provided', () => {
    const onNewConversation = jest.fn();

    render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        onNewConversation={onNewConversation}
        status="error"
        error={new Error('Request blocked for this domain')}
      />
    );

    const button = screen.getByRole('button', {
      name: 'Start a new conversation',
    });
    expect(button).toBeInTheDocument();

    button.click();
    expect(onNewConversation).toHaveBeenCalledTimes(1);
  });

  test('passes raw error message to custom error component', () => {
    const ErrorComponent = jest.fn(() => <span>Custom error</span>);

    render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error('Request blocked for this domain')}
        errorComponent={ErrorComponent}
      />
    );

    expect(ErrorComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: 'Request blocked for this domain',
      }),
      {}
    );
  });

  test('allows error translation to use raw error message', () => {
    const CustomError = (
      props: ChatComponentPropsWithMetadata<ChatMessageErrorProps>
    ) => (
      <ChatMessageError
        {...props}
        translations={{
          errorMessage: ({ errorMessage }) =>
            errorMessage ? `Friendly: ${errorMessage}` : 'Friendly fallback',
        }}
      />
    );

    render(
      <ChatMessages
        messages={[]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        status="error"
        error={new Error('Request blocked for this domain')}
        errorComponent={CustomError}
      />
    );

    expect(
      screen.getByText('Friendly: Request blocked for this domain')
    ).toBeInTheDocument();
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

  test('forwards metadata to overridable components', () => {
    const Loader = jest.fn(() => <span>Loader</span>);
    const setIndexUiState = jest.fn();
    const onClose = jest.fn();
    const sendMessage = jest.fn();
    const setInput = jest.fn();
    const messages = [
      {
        role: 'assistant' as const,
        id: '1',
        parts: [{ type: 'text' as const, text: 'Working on it' }],
      },
    ];

    render(
      <ChatMessages
        messages={messages}
        status="submitted"
        indexUiState={{ query: 'shoes' }}
        setIndexUiState={setIndexUiState}
        tools={{}}
        onReload={jest.fn()}
        onClose={onClose}
        sendMessage={sendMessage}
        setInput={setInput}
        loaderComponent={Loader}
      />
    );

    expect(Loader).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          messages,
          status: 'submitted',
          error: undefined,
          isClearing: false,
          activePart: { type: 'text', text: 'Working on it' },
          tools: {},
          sendMessage,
          setInput,
          onClose,
        }),
      }),
      {}
    );
  });
});
