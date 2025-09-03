/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createChatMessagesComponent } from '../ChatMessages';

const ChatMessages = createChatMessagesComponent({
  createElement,
  Fragment,
});

describe('ChatMessages', () => {
  test('renders with default props', () => {
    const { container } = render(<ChatMessages messages={[]} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          aria-label="Chat messages"
          aria-live="polite"
          class="ais-ChatMessages"
          role="log"
        >
          <div
            class="ais-ChatMessages-scroll"
          >
            <div
              class="ais-ChatMessages-content"
            />
          </div>
          <button
            aria-label="Scroll to bottom"
            class="ais-ChatMessages-scrollToBottom"
            title="Scroll to bottom"
            type="button"
          >
            <svg
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
            >
              <path
                clipRule="evenodd"
                d="M3.646 5.646a.5.5 0 0 1 .708 0L8 9.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z"
                fill="currentColor"
                fillRule="evenodd"
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
        messageComponent={Messages}
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
          aria-label="Chat messages"
          aria-live="polite"
          class="ais-ChatMessages"
          role="log"
        >
          <div
            class="ais-ChatMessages-scroll"
          >
            <div
              class="ais-ChatMessages-content"
            >
              <div
                class="ais-ChatMessages-message ais-ChatMessages-message--user"
                data-role="user"
              >
                <span>
                  Messages
                </span>
              </div>
            </div>
          </div>
          <button
            aria-label="Scroll to bottom"
            class="ais-ChatMessages-scrollToBottom"
            title="Scroll to bottom"
            type="button"
          >
            <svg
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
            >
              <path
                clipRule="evenodd"
                d="M3.646 5.646a.5.5 0 0 1 .708 0L8 9.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    `);
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
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          aria-label="Chat messages"
          aria-live="polite"
          class="ais-ChatMessages root"
          role="log"
        >
          <div
            class="ais-ChatMessages-scroll scroll"
          >
            <div
              class="ais-ChatMessages-content content"
            />
          </div>
          <button
            aria-label="Scroll to bottom"
            class="ais-ChatMessages-scrollToBottom scrollToBottom"
            title="Scroll to bottom"
            type="button"
          >
            <svg
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
            >
              <path
                clipRule="evenodd"
                d="M3.646 5.646a.5.5 0 0 1 .708 0L8 9.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    `);
  });
});
