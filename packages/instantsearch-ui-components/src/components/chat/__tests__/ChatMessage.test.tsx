/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import {
  createChatMessageComponent,
  type ChatMessageClassNames,
  type ChatMessageTranslations,
} from '../ChatMessage';

import type { AddToolResult, ChatMessageBase, ClientSideTool } from '../types';
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
  open: true,
  maximized: false,
  tools: {},
  regenerate: jest.fn(),
  stop: jest.fn(),
  onReload: jest.fn(),
  onClose: jest.fn(),
  ...overrides,
});

describe('ChatMessage', () => {
  test('accepts customization types without reasoning overrides', () => {
    const classNames: ChatMessageClassNames = {
      root: 'root',
      container: 'container',
      leading: 'leading',
      content: 'content',
      message: 'message',
      actions: 'actions',
      footer: 'footer',
    };
    const translations: ChatMessageTranslations = {
      messageLabel: 'Message',
      actionsLabel: 'Message actions',
    };

    expect({ classNames, translations }).toEqual({
      classNames: {
        root: 'root',
        container: 'container',
        leading: 'leading',
        content: 'content',
        message: 'message',
        actions: 'actions',
        footer: 'footer',
      },
      translations: {
        messageLabel: 'Message',
        actionsLabel: 'Message actions',
      },
    });
  });

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

  test('renders reasoning in an accessible disclosure when enabled', () => {
    const { getByRole, getByText } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: 'I should search the catalog first.',
              state: 'done',
            },
          ],
        }}
        metadata={createMetadata()}
        showReasoning={true}
      />
    );

    expect(getByRole('group', { name: 'Reasoning' })).toBeInTheDocument();
    expect(getByText('I should search the catalog first.')).toBeInTheDocument();
  });

  test('makes overflowing reasoning keyboard reachable', () => {
    const { getByRole, queryByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: Array.from(
                { length: 20 },
                (_, index) => `Reasoning paragraph ${index + 1}.`
              ).join('\n\n'),
              state: 'done',
            },
          ],
        }}
        metadata={createMetadata()}
        showReasoning={true}
      />
    );

    const disclosure = getByRole('group', { name: 'Reasoning' });
    const summary = disclosure.querySelector('summary')!;
    userEvent.click(summary);

    const body = disclosure.querySelector('.ais-ChatMessageReasoning-body')!;
    expect(body).toHaveAttribute('tabindex', '0');
    expect(queryByRole('region', { hidden: true })).not.toBeInTheDocument();

    summary.focus();
    userEvent.tab();
    expect(body).toHaveFocus();
  });

  test('does not render reasoning unless it is enabled', () => {
    const { queryByRole, queryByText } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [{ type: 'reasoning', text: 'Private reasoning' }],
        }}
        metadata={createMetadata()}
      />
    );

    expect(queryByRole('group', { name: 'Reasoning' })).not.toBeInTheDocument();
    expect(queryByText('Private reasoning')).not.toBeInTheDocument();
  });

  test.each([
    ['stopped', 'ready' as const, ''],
    ['disconnected', 'error' as const, ''],
    ['finished with only whitespace', 'ready' as const, ' \n '],
  ])(
    'does not render blank reasoning after a response is %s',
    (_responseState, status, text) => {
      const { queryByRole } = render(
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'assistant',
            id: '1',
            parts: [{ type: 'reasoning', text, state: 'done' }],
          }}
          metadata={createMetadata({ status })}
          showReasoning={true}
        />
      );

      expect(
        queryByRole('group', { name: 'Reasoning' })
      ).not.toBeInTheDocument();
    }
  );

  test('renders empty reasoning while the response is active', () => {
    const { getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [{ type: 'reasoning', text: '', state: 'streaming' }],
        }}
        metadata={createMetadata({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });

  test('keeps reasoning disclosures in message part order', () => {
    const { container, getAllByRole, getByText, queryAllByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            { type: 'reasoning', text: 'First thought', state: 'done' },
            {
              type: 'tool-test_tool',
              toolCallId: '123',
              input: {},
              state: 'output-available',
              output: { data: 'Tool result' },
            },
            { type: 'reasoning', text: 'Second thought', state: 'done' },
            { type: 'text', text: 'Final answer' },
          ],
        }}
        metadata={createMetadata({
          tools: {
            test_tool: {
              layoutComponent: () => <div>Tool result</div>,
              addToolResult: jest.fn(),
              applyFilters: jest.fn(),
            },
          },
        })}
        showReasoning={true}
      />
    );

    const message = container.querySelector('.ais-ChatMessage-message')!;
    const children = Array.from(message.children);
    const disclosures = getAllByRole('group', { name: 'Reasoning' });

    expect(children).toHaveLength(4);
    expect(children[0]).toBe(disclosures[0]);
    expect(children[1]).toContainElement(getByText('Tool result'));
    expect(children[2]).toBe(disclosures[1]);
    expect(children[3]).toContainElement(getByText('Final answer'));
    expect(queryAllByRole('region')).toHaveLength(0);
  });

  test('marks only the streaming reasoning disclosure as busy', () => {
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'First thought',
          state: 'done' as const,
        },
        {
          type: 'reasoning' as const,
          text: 'Second thought',
          state: 'streaming' as const,
        },
      ],
    };
    const { getAllByRole, rerender } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={message}
        metadata={createMetadata({ status: 'streaming', messages: [message] })}
        showReasoning={true}
      />
    );

    let disclosures = getAllByRole('group', { name: 'Reasoning' });
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'false');
    expect(disclosures[1]).toHaveAttribute('aria-busy', 'true');
    expect(disclosures[0]).not.toHaveAttribute('open');
    expect(disclosures[1]).not.toHaveAttribute('open');
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-label')
    ).toHaveTextContent(/^Reasoning$/);
    expect(
      disclosures[1].querySelector('.ais-ChatMessageReasoning-label')
    ).toHaveTextContent(/^Reasoning$/);
    expect(
      disclosures[1].querySelector('.ais-ChatMessageReasoning-label')!
        .nextElementSibling
    ).toHaveClass('ais-ChatMessageReasoning-chevron');

    rerender(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          ...message,
          parts: [message.parts[0], { ...message.parts[1], state: 'done' }],
        }}
        metadata={createMetadata({ status: 'ready', messages: [message] })}
        showReasoning={true}
      />
    );

    disclosures = getAllByRole('group', { name: 'Reasoning' });
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'false');
    expect(disclosures[1]).toHaveAttribute('aria-busy', 'false');
    expect(disclosures[0]).not.toHaveAttribute('open');
    expect(disclosures[1]).not.toHaveAttribute('open');
    expect(
      disclosures[1].querySelector('.ais-ChatMessageReasoning-label')
    ).toHaveTextContent(/^Reasoning$/);
    expect(
      disclosures[1].querySelector('.ais-ChatMessageReasoning-label')!
        .nextElementSibling
    ).toHaveClass('ais-ChatMessageReasoning-chevron');
  });

  test('signals activity on the label alone while streaming', () => {
    const { getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [{ type: 'reasoning', text: 'Working', state: 'streaming' }],
        }}
        metadata={createMetadata({
          status: 'streaming',
          messages: [
            {
              role: 'assistant',
              id: '1',
              parts: [
                { type: 'reasoning', text: 'Working', state: 'streaming' },
              ],
            },
          ],
        })}
        showReasoning={true}
        translations={{
          reasoningLabel: 'Raisonnement de la demande en cours',
        }}
      />
    );

    const disclosure = getByRole('group', {
      name: 'Raisonnement de la demande en cours',
    });
    const summary = disclosure.querySelector('summary')!;
    const label = summary.querySelector('.ais-ChatMessageReasoning-label')!;

    expect(disclosure).toHaveAttribute('aria-busy', 'true');
    expect(label).toHaveTextContent(/^Raisonnement de la demande en cours$/);
    expect(label).toHaveClass('ais-ChatMessageReasoning-label--streaming');

    expect(
      Array.from(summary.children).map((child) => child.className)
    ).toEqual([
      'ais-ChatMessageReasoning-icon',
      'ais-ChatMessageReasoning-label ais-ChatMessageReasoning-label--streaming',
      'ais-ChatMessageReasoning-chevron',
    ]);
    expect(summary).toHaveTextContent(/^Raisonnement de la demande en cours$/);
  });

  test('routes custom header and label class names to their own elements', () => {
    const { getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [{ type: 'reasoning', text: 'Working', state: 'streaming' }],
        }}
        metadata={createMetadata({
          status: 'streaming',
          messages: [
            {
              role: 'assistant',
              id: '1',
              parts: [
                { type: 'reasoning', text: 'Working', state: 'streaming' },
              ],
            },
          ],
        })}
        showReasoning={true}
        classNames={{
          reasoningHeader: 'custom-header',
          reasoningLabel: 'custom-label',
        }}
      />
    );

    const summary = getByRole('group', { name: 'Reasoning' }).querySelector(
      'summary'
    )!;
    const label = summary.querySelector('.ais-ChatMessageReasoning-label')!;

    expect(summary).toHaveClass('custom-header');
    expect(label).toHaveClass('custom-label');
    expect(label).toHaveClass('ais-ChatMessageReasoning-label--streaming');
    expect(
      summary.querySelector('.ais-ChatMessageReasoning-chevron')
    ).not.toHaveClass('custom-label');
  });

  test('marks only the latest unfinished reasoning block as busy', () => {
    const { getAllByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: 'Compare the candidates',
              state: 'streaming',
            },
            {
              type: 'reasoning',
              text: 'Check one candidate',
              state: 'streaming',
            },
          ],
        }}
        metadata={createMetadata({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    const disclosures = getAllByRole('group', { name: 'Reasoning' });
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'false');
    expect(disclosures[1]).toHaveAttribute('aria-busy', 'true');
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-label--streaming')
    ).not.toBeInTheDocument();
    expect(
      disclosures[1].querySelector('.ais-ChatMessageReasoning-label--streaming')
    ).toBeInTheDocument();
  });

  test('marks reasoning as busy only on the active response', () => {
    const messages = [
      {
        role: 'assistant' as const,
        id: 'previous',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Stopped reasoning',
            state: 'streaming' as const,
          },
        ],
      },
      {
        role: 'assistant' as const,
        id: 'current',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Current reasoning',
            state: 'streaming' as const,
          },
        ],
      },
    ];

    const { getAllByRole } = render(
      <Fragment>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            indexUiState={{}}
            setIndexUiState={jest.fn()}
            message={message}
            metadata={createMetadata({ status: 'streaming', messages })}
            showReasoning={true}
          />
        ))}
      </Fragment>
    );

    const disclosures = getAllByRole('group', { name: 'Reasoning' });
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'false');
    expect(disclosures[1]).toHaveAttribute('aria-busy', 'true');
  });

  test('does not mark reasoning as busy after answer text starts streaming', () => {
    const { getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: 'Checking the catalog',
              state: 'streaming',
            },
            {
              type: 'text',
              text: 'Here is what I found',
              state: 'streaming',
            },
          ],
        }}
        metadata={createMetadata({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    const disclosure = getByRole('group', { name: 'Reasoning' });
    expect(disclosure).toHaveAttribute('aria-busy', 'false');
    expect(
      disclosure.querySelector('.ais-ChatMessageReasoning-label--streaming')
    ).not.toBeInTheDocument();
  });

  test('marks an earlier unfinished reasoning block as busy after a later block ends', () => {
    const { getAllByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: 'Compare the candidates',
              state: 'streaming',
            },
            {
              type: 'reasoning',
              text: 'Check one candidate',
              state: 'done',
            },
          ],
        }}
        metadata={createMetadata({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    const disclosures = getAllByRole('group', { name: 'Reasoning' });
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'true');
    expect(disclosures[1]).toHaveAttribute('aria-busy', 'false');
  });

  test('preserves an open disclosure while reasoning text streams', () => {
    const renderMessage = (text: string) => (
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [{ type: 'reasoning', text, state: 'streaming' }],
        }}
        metadata={createMetadata({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );
    const { getByRole, rerender } = render(renderMessage('First'));
    const disclosure = getByRole('group', { name: 'Reasoning' });

    userEvent.click(disclosure.querySelector('summary')!);
    expect(disclosure).toHaveAttribute('open');

    rerender(renderMessage('First second'));
    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute('open');
  });

  test('keeps a reader-opened disclosure open once the answer starts and the response completes', () => {
    const renderMessage = (
      answer?: string,
      status: 'streaming' | 'ready' = 'streaming'
    ) => (
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: 'Checking the catalog',
              state: answer ? ('done' as const) : ('streaming' as const),
            },
            ...(answer
              ? [
                  {
                    type: 'text' as const,
                    text: answer,
                    state:
                      status === 'ready'
                        ? ('done' as const)
                        : ('streaming' as const),
                  },
                ]
              : []),
          ],
        }}
        metadata={createMetadata({
          status,
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );
    const { getByRole, rerender } = render(renderMessage());
    const disclosure = getByRole('group', { name: 'Reasoning' });

    expect(disclosure).not.toHaveAttribute('open');
    expect(disclosure).toHaveAttribute('aria-busy', 'true');

    userEvent.click(disclosure.querySelector('summary')!);
    expect(disclosure).toHaveAttribute('open');

    rerender(renderMessage('The answer starts'));
    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute('open');
    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute(
      'aria-busy',
      'false'
    );

    rerender(renderMessage('The answer starts', 'ready'));
    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute('open');
  });

  test('renders reasoning as markdown with a translated label', () => {
    const { container, getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: 'Check the **release date**.',
              state: 'done',
            },
          ],
        }}
        metadata={createMetadata()}
        showReasoning={true}
        translations={{ reasoningLabel: 'Raisonnement' }}
      />
    );

    expect(getByRole('group', { name: 'Raisonnement' })).toBeInTheDocument();
    expect(container.querySelector('strong')).toHaveTextContent('release date');
  });

  test('renders reasoning as plain text when parseMarkdown is false', () => {
    const { container, getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [
            {
              type: 'reasoning',
              text: 'Check the **release date**.\nThen compare.',
              state: 'done',
            },
          ],
        }}
        metadata={createMetadata()}
        showReasoning={true}
        parseMarkdown={false}
      />
    );

    const body = getByRole('group', { name: 'Reasoning' }).querySelector(
      '.ais-ChatMessageReasoning-text'
    )!;
    expect(container.querySelector('strong')).toBeNull();
    expect(body.textContent).toBe('Check the **release date**.\nThen compare.');
    expect(body.querySelector('.ais-ChatMessage-text')).not.toBeNull();
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

  test('submits a layout result for the owning assistant message', async () => {
    let submitResult!: (params: { output: unknown }) => Promise<void>;
    const addToolResult = jest.fn(() => Promise.resolve());
    const addToolResultForMessage = jest.fn(() => Promise.resolve());
    const tool: ClientSideTool & {
      '~addToolResultForMessage': (
        message: ChatMessageBase,
        params: Parameters<AddToolResult>[0]
      ) => ReturnType<AddToolResult>;
    } = {
      layoutComponent: ({ addToolResult: submit }) => {
        submitResult = submit;
        return <div />;
      },
      addToolResult,
      '~addToolResultForMessage': addToolResultForMessage,
      applyFilters: jest.fn(),
    };

    render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: 'assistant-new',
          parts: [
            {
              type: 'tool-test_tool',
              toolCallId: 'call-1',
              input: {},
              state: 'input-available',
            },
          ],
        }}
        metadata={createMetadata({
          tools: {
            test_tool: tool,
          },
        })}
      />
    );

    await submitResult({ output: { owner: 'new' } });

    expect(addToolResultForMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'assistant-new' }),
      {
        tool: 'tool-test_tool',
        toolCallId: 'call-1',
        output: { owner: 'new' },
      }
    );
    expect(addToolResult).not.toHaveBeenCalled();
  });

  test('falls back to the public tool result submission', async () => {
    let submitResult!: (params: { output: unknown }) => Promise<void>;
    const addToolResult = jest.fn(() => Promise.resolve());

    render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: 'assistant-1',
          parts: [
            {
              type: 'tool-test_tool',
              toolCallId: 'call-1',
              input: {},
              state: 'input-available',
            },
          ],
        }}
        metadata={createMetadata({
          tools: {
            test_tool: {
              layoutComponent: ({ addToolResult: submit }) => {
                submitResult = submit;
                return <div />;
              },
              addToolResult,
              applyFilters: jest.fn(),
            },
          },
        })}
      />
    );

    await submitResult({ output: { owner: 'public' } });

    expect(addToolResult).toHaveBeenCalledWith({
      tool: 'tool-test_tool',
      toolCallId: 'call-1',
      output: { owner: 'public' },
    });
  });
});
