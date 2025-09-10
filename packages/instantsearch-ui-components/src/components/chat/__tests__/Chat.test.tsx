/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatComponent } from '../Chat';

const Chat = createChatComponent({
  createElement,
  Fragment,
});

describe('Chat', () => {
  test('renders with default props', () => {
    const { container } = render(
      <Chat
        open
        headerProps={{ onClose: jest.fn() }}
        messagesProps={{
          messages: [],
          indexUiState: {},
          setIndexUiState: jest.fn(),
        }}
        promptProps={{}}
        toggleButtonProps={{ open: true, onClick: jest.fn() }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Chat-container"
        >
          <div
            class="ais-ChatHeader"
          >
            <span
              class="ais-ChatHeader-title"
            >
              Chat
            </span>
            <button
              aria-label="Close chat"
              class="ais-ChatHeader-close"
              type="button"
            >
              ×
            </button>
          </div>
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
          <form
            class="ais-ChatPrompt"
          >
            <div
              class="ais-ChatPrompt-body"
            >
              <textarea
                aria-label="Type your message..."
                class="ais-ChatPrompt-textarea"
                placeholder="Type your message..."
                rows="2"
                style="max-height: 12em; resize: none; overflow: auto;"
              />
              <div
                class="ais-ChatPrompt-actions"
              >
                <button
                  class="ais-ChatPrompt-submit"
                  data-status="ready"
                  disabled=""
                  title="Message is empty"
                >
                  <svg
                    fill="none"
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                  >
                    <path
                      clipRule="evenodd"
                      d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `);
  });
});
