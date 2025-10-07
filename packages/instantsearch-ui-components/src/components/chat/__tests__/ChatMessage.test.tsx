/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatMessageComponent } from '../ChatMessage';

const ChatMessage = createChatMessageComponent({
  createElement,
  Fragment,
});

describe('ChatMessage', () => {
  test('renders with default props', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{ role: 'user', id: '1', parts: [] }}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <article
          aria-label="Message"
          class="ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
        >
          <div
            class="ais-ChatMessage-container"
          >
            <div
              class="ais-ChatMessage-content"
            >
              <div
                class="ais-ChatMessage-message"
              />
            </div>
          </div>
        </article>
      </div>
    `);
  });

  test('renders with custom class names', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [],
        }}
        classNames={{
          root: 'root',
          container: 'container',
          leading: 'leading',
          content: 'content',
          message: 'message',
          actions: 'actions',
        }}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <article
          aria-label="Message"
          class="ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle root"
        >
          <div
            class="ais-ChatMessage-container container"
          >
            <div
              class="ais-ChatMessage-content content"
            >
              <div
                class="ais-ChatMessage-message message"
              />
            </div>
          </div>
        </article>
      </div>
    `);
  });

  test('renders all types of messages', () => {
    const { container } = render(
      <div>
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'user',
            id: '1',
            parts: [{ type: 'text', text: 'User content' }],
          }}
        />
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'assistant',
            id: '2',
            parts: [{ type: 'text', text: 'Assistant content' }],
          }}
        />
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'system',
            id: '3',
            parts: [{ type: 'text', text: 'System content' }],
          }}
        />
      </div>
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <article
            aria-label="Message"
            class="ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
          >
            <div
              class="ais-ChatMessage-container"
            >
              <div
                class="ais-ChatMessage-content"
              >
                <div
                  class="ais-ChatMessage-message"
                >
                  <span>
                    <span>
                      User content
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </article>
          <article
            aria-label="Message"
            class="ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
          >
            <div
              class="ais-ChatMessage-container"
            >
              <div
                class="ais-ChatMessage-content"
              >
                <div
                  class="ais-ChatMessage-message"
                >
                  <span>
                    <span>
                      Assistant content
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </article>
          <article
            aria-label="Message"
            class="ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
          >
            <div
              class="ais-ChatMessage-container"
            >
              <div
                class="ais-ChatMessage-content"
              >
                <div
                  class="ais-ChatMessage-message"
                >
                  <span>
                    <span>
                      System content
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    `);
  });

  test('renders with tools', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'tool-test_tool',
              toolCallId: '123',
              input: {},
              state: 'output-available',
              output: { data: 'Test data' },
            },
          ],
        }}
        tools={{
          test_tool: {
            layoutComponent: ({ message }) => (
              <div className="wrapper">{JSON.stringify(message.output)}</div>
            ),
            addToolResult: jest.fn(),
            onToolCall: jest.fn(),
          },
        }}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <article
          aria-label="Message"
          class="ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
        >
          <div
            class="ais-ChatMessage-container"
          >
            <div
              class="ais-ChatMessage-content"
            >
              <div
                class="ais-ChatMessage-message"
              >
                <div
                  class="ais-ChatMessage-tool"
                >
                  <div
                    class="wrapper"
                  >
                    {"data":"Test data"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    `);
  });
});
