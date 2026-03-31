/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
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
        container.querySelectorAll('[aria-label="Like"], [aria-label="Dislike"]')
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
        container.querySelectorAll('[aria-label="Like"], [aria-label="Dislike"]')
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
        container.querySelectorAll('[aria-label="Like"], [aria-label="Dislike"]')
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
        container.querySelectorAll('[aria-label="Like"], [aria-label="Dislike"]')
      ).toHaveLength(0);
    });
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
