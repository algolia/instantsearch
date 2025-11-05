/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
          tools: {},
          onReload: jest.fn(),
          onClose: jest.fn(),
        }}
        promptProps={{}}
        toggleButtonProps={{ open: true, onClick: jest.fn() }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Chat"
        >
          <div
            class="ais-Chat-container ais-Chat-container--open"
          >
            <div
              class="ais-ChatHeader"
            >
              <span
                class="ais-ChatHeader-title"
              >
                <span
                  class="ais-ChatHeader-titleIcon"
                >
                  <svg
                    fill="none"
                    height="20"
                    viewBox="0 0 20 20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 1.875c.27 0 .51.173.594.43l1.593 4.844a1.043 1.043 0 0 0 .664.664l4.844 1.593a.625.625 0 0 1 0 1.188l-4.844 1.593a1.043 1.043 0 0 0-.664.664l-1.593 4.844a.625.625 0 0 1-1.188 0l-1.593-4.844a1.042 1.042 0 0 0-.664-.664l-4.844-1.593a.625.625 0 0 1 0-1.188l4.844-1.593a1.042 1.042 0 0 0 .664-.664l1.593-4.844a.625.625 0 0 1 .594-.43ZM9 7.539A2.292 2.292 0 0 1 7.54 9L4.5 10l3.04 1A2.292 2.292 0 0 1 9 12.46l1 3.04 1-3.04A2.293 2.293 0 0 1 12.46 11l3.04-1-3.04-1A2.292 2.292 0 0 1 11 7.54L10 4.5 9 7.54ZM4.167 1.875c.345 0 .625.28.625.625v3.333a.625.625 0 0 1-1.25 0V2.5c0-.345.28-.625.625-.625ZM15.833 13.542c.345 0 .625.28.625.625V17.5a.625.625 0 1 1-1.25 0v-3.333c0-.345.28-.625.625-.625Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                    <path
                      clipRule="evenodd"
                      d="M1.875 4.167c0-.346.28-.625.625-.625h3.333a.625.625 0 1 1 0 1.25H2.5a.625.625 0 0 1-.625-.625ZM13.542 15.833c0-.345.28-.625.625-.625H17.5a.625.625 0 0 1 0 1.25h-3.333a.625.625 0 0 1-.625-.625Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                </span>
                Chat
              </span>
              <div
                class="ais-ChatHeader-actions"
              >
                <button
                  aria-label="Maximize chat"
                  class="ais-Button ais-Button--ghost ais-Button--sm ais-Button--icon-only ais-ChatHeader-maximize"
                  type="button"
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 3h6v6"
                    />
                    <path
                      d="m21 3-7 7"
                    />
                    <path
                      d="m3 21 7-7"
                    />
                    <path
                      d="M9 21H3v-6"
                    />
                  </svg>
                </button>
                <button
                  aria-label="Close chat"
                  class="ais-Button ais-Button--ghost ais-Button--sm ais-Button--icon-only ais-ChatHeader-close"
                  title="Close chat"
                  type="button"
                >
                  <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6 6 18"
                    />
                    <path
                      d="m6 6 12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
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
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m6 9 6 6 6-6"
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
                  autofocus="true"
                  class="ais-ChatPrompt-textarea ais-Scrollbar"
                  data-max-rows="5"
                  placeholder="Type your message..."
                  style="height: auto; overflow-y: hidden;"
                />
                <div
                  class="ais-ChatPrompt-actions"
                >
                  <button
                    aria-label="Message is empty"
                    class="ais-Button ais-Button--primary ais-Button--sm ais-Button--icon-only ais-ChatPrompt-submit"
                    data-status="ready"
                    disabled=""
                    type="submit"
                  >
                    <svg
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="m5 12 7-7 7 7"
                      />
                      <path
                        d="M12 19V5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                class="ais-ChatPrompt-footer"
              >
                <div
                  class="ais-ChatPrompt-disclaimer"
                >
                  AI can make mistakes. Verify responses.
                </div>
              </div>
            </form>
          </div>
          <div
            class="ais-Chat-toggleButtonWrapper"
          >
            <button
              class="ais-Button ais-Button--primary ais-Button--md ais-Button--icon-only ais-ChatToggleButton ais-ChatToggleButton--open"
              type="button"
            >
              <svg
                fill="none"
                height="28"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="28"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m18 15-6-6-6 6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `);
  });
});
