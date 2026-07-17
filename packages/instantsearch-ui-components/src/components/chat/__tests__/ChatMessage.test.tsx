/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatMessageComponent } from '../ChatMessage';

import type { ChatComponentMetadata } from '../types';

const ChatMessage = createChatMessageComponent({
  createElement,
  Fragment,
});

const createMetadata = (
  overrides: Partial<ChatComponentMetadata> = {}
): ChatComponentMetadata => ({
  messages: [],
  status: 'ready',
  isClearing: false,
  tools: {},
  onClose: jest.fn(),
  ...overrides,
});

describe('ChatMessage', () => {
  test('renders with default props', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{ role: 'user', id: '1', parts: [] }}
        metadata={createMetadata()}
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
        metadata={createMetadata()}
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
          metadata={createMetadata()}
        />
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'assistant',
            id: '2',
            parts: [{ type: 'text', text: 'Assistant content' }],
          }}
          metadata={createMetadata()}
        />
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'system',
            id: '3',
            parts: [{ type: 'text', text: 'System content' }],
          }}
          metadata={createMetadata()}
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

  test('parses text parts as markdown by default', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [{ type: 'text', text: 'a *b* c' }],
        }}
        metadata={createMetadata()}
      />
    );

    // markdown-to-jsx turns `*b*` into an <em>, so the literal asterisks are
    // gone from the output.
    expect(container.querySelector('em')).not.toBeNull();
    expect(container.querySelector('em')!.textContent).toBe('b');
    expect(container.querySelector('.ais-ChatMessage-text')).toBeNull();
  });

  test('renders text parts as plain text when parseMarkdown is false', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [{ type: 'text', text: 'a *b* c' }],
        }}
        metadata={createMetadata()}
        parseMarkdown={false}
      />
    );

    const text = container.querySelector('.ais-ChatMessage-text');
    expect(text).not.toBeNull();
    // The literal asterisks survive: no markdown transformation happened.
    expect(text!.textContent).toBe('a *b* c');
    expect(container.querySelector('em')).toBeNull();
  });

  test('plain-text mode renders the expected DOM structure', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [{ type: 'text', text: 'Use * and _ literally' }],
        }}
        metadata={createMetadata()}
        parseMarkdown={false}
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
                <p
                  class="ais-ChatMessage-text"
                >
                  Use * and _ literally
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    `);
  });

  test('preserves newlines in plain-text mode', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [{ type: 'text', text: 'line one\nline two' }],
        }}
        metadata={createMetadata()}
        parseMarkdown={false}
      />
    );

    expect(container.querySelector('.ais-ChatMessage-text')!.textContent).toBe(
      'line one\nline two'
    );
  });

  test('still hides legacy `<context>` parts when parseMarkdown is false', () => {
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [
            {
              type: 'text',
              text: '<context>{"currentPage":"https://example.com/products"}</context>',
            },
            { type: 'text', text: 'Hello' },
          ],
        }}
        metadata={createMetadata()}
        parseMarkdown={false}
      />
    );

    expect(container.textContent).toBe('Hello');
    expect(container.textContent).not.toContain('example.com');
    expect(container.textContent).not.toContain('context');
  });

  test('does not render legacy `<context>` text parts (back-compat)', () => {
    // Pre-migration sessions persisted a `<context>{...}</context>` text part.
    // The shim in `ChatMessage` keeps those out of the rendered transcript
    // until existing sessionStorage caches roll over.
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [
            {
              type: 'text',
              text: '<context>{"currentPage":"https://example.com/products","userLocale":"en-US"}</context>',
            },
            { type: 'text', text: 'Hello' },
          ],
        }}
        metadata={createMetadata()}
      />
    );

    expect(container.textContent).toBe('Hello');
    expect(container.textContent).not.toContain('example.com');
    expect(container.textContent).not.toContain('context');
  });

  test('does not render turnContext from message metadata', () => {
    // turnContext is an out-of-band server-grounding signal; it must never
    // surface in the rendered transcript even if a message somehow carries it.
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'user',
          id: '1',
          parts: [{ type: 'text', text: 'Hello' }],
          metadata: {
            turnContext: {
              url: 'https://example.com/products',
              locale: 'en-US',
            },
          },
        }}
        metadata={createMetadata()}
      />
    );

    expect(container.textContent).toBe('Hello');
    expect(container.textContent).not.toContain('example.com');
    expect(container.textContent).not.toContain('turnContext');
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
        metadata={createMetadata({
          tools: {
            test_tool: {
              layoutComponent: ({ message }) => (
                <div className="wrapper">{JSON.stringify(message.output)}</div>
              ),
              addToolResult: jest.fn(),
              onToolCall: jest.fn(),
              applyFilters: jest.fn(),
            },
          },
        })}
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
