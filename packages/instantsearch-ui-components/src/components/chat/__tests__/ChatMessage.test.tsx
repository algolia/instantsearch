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
  type ChatMessageReasoningComponentProps,
  type ChatMessageTextComponentProps,
  type ChatMessageTranslations,
} from '../ChatMessage';

import type { AddToolResult, ChatMessageBase, ClientSideTool } from '../types';
import type { ChatComponentContext } from '../types';

const ChatMessage = createChatMessageComponent({
  createElement,
  Fragment,
});

const createContext = <TMessage extends ChatMessageBase = ChatMessageBase>(
  overrides: Partial<ChatComponentContext<TMessage>> = {}
): ChatComponentContext<TMessage> => ({
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
        context={createContext()}
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
        context={createContext()}
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
          context={createContext()}
        />
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'assistant',
            id: '2',
            parts: [{ type: 'text', text: 'Assistant content' }],
          }}
          context={createContext()}
        />
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'system',
            id: '3',
            parts: [{ type: 'text', text: 'System content' }],
          }}
          context={createContext()}
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
        context={createContext()}
        showReasoning={true}
      />
    );

    expect(getByRole('group', { name: 'Reasoning' })).toBeInTheDocument();
    expect(getByText('I should search the catalog first.')).toBeInTheDocument();
  });

  test('keeps the non-scrollable reasoning body out of the tab order', () => {
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
        context={createContext()}
        showReasoning={true}
      />
    );

    const disclosure = getByRole('group', { name: 'Reasoning' });
    const summary = disclosure.querySelector('summary')!;
    userEvent.click(summary);

    const body = disclosure.querySelector('.ais-ChatMessageReasoning-body')!;
    expect(body).not.toHaveAttribute('tabindex');
    expect(queryByRole('region', { hidden: true })).not.toBeInTheDocument();

    summary.focus();
    expect(summary).toHaveFocus();
    userEvent.tab();
    expect(body).not.toHaveFocus();
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
        context={createContext()}
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
      const { container, queryByRole } = render(
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'assistant',
            id: '1',
            parts: [{ type: 'reasoning', text, state: 'done' }],
          }}
          context={createContext({ status })}
          showReasoning={true}
        />
      );

      expect(
        queryByRole('group', { name: 'Reasoning' })
      ).not.toBeInTheDocument();
      expect(
        container.querySelector('.ais-ChatMessageReasoning')
      ).not.toBeInTheDocument();
    }
  );

  test('does not mount blank reasoning for a non-current response', () => {
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [{ type: 'reasoning' as const, text: '', state: 'done' as const }],
    };
    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={message}
        context={createContext({
          status: 'streaming',
          messages: [message, { role: 'assistant', id: '2', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageReasoning')
    ).not.toBeInTheDocument();
  });

  test.each(['', ' \n '])(
    'keeps blank reasoning active without rendering an empty status',
    (text) => {
      const { getByRole } = render(
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={{
            role: 'assistant',
            id: '1',
            parts: [{ type: 'reasoning', text, state: 'streaming' }],
          }}
          context={createContext({
            status: 'streaming',
            messages: [{ role: 'assistant', id: '1', parts: [] }],
          })}
          showReasoning={true}
        />
      );

      const disclosure = getByRole('group', { name: 'Reasoning' });
      expect(disclosure).toHaveAttribute('aria-busy', 'true');
      expect(
        disclosure.querySelector('.ais-ChatMessageReasoning-icon')
      ).toHaveClass('ais-ChatMessageReasoning-icon--streaming');
      expect(
        disclosure.querySelector('.ais-ChatMessageReasoning-label')
      ).toHaveClass('ais-ChatMessageReasoning-label--streaming');
      expect(
        disclosure.querySelector('.ais-ChatMessageReasoning-status')
      ).not.toBeInTheDocument();
      expect(
        disclosure.querySelector('.ais-ChatMessageReasoning-separator')
      ).not.toBeInTheDocument();
      expect(
        disclosure.querySelector('.ais-ChatMessageReasoning-hint')
      ).not.toBeInTheDocument();
    }
  );

  test('aggregates reasoning around a tool without absorbing the tool', () => {
    const textComponent = jest.fn(({ part }: ChatMessageTextComponentProps) => (
      <span data-testid="custom-text">{part.text}</span>
    ));
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
        context={createContext({
          tools: {
            test_tool: {
              layoutComponent: () => <div>Tool result</div>,
              addToolResult: jest.fn(),
              applyFilters: jest.fn(),
            },
          },
        })}
        showReasoning={true}
        textComponent={textComponent}
      />
    );

    const message = container.querySelector('.ais-ChatMessage-message')!;
    const children = Array.from(message.children);
    const disclosures = getAllByRole('group', { name: 'Reasoning' });
    const entries = getAllByRole('listitem');

    expect(children).toHaveLength(3);
    expect(disclosures).toHaveLength(1);
    expect(children[0]).toBe(disclosures[0]);
    expect(children[1]).toContainElement(getByText('Tool result'));
    expect(children[2]).toContainElement(getByText('Final answer'));
    expect(children[2]).toContainElement(
      container.querySelector('[data-testid="custom-text"]')
    );
    expect(entries.map((entry) => entry.textContent)).toEqual([
      'First thought',
      'Second thought',
    ]);
    expect(textComponent).toHaveBeenCalledTimes(1);
    expect(queryAllByRole('region')).toHaveLength(0);
  });

  test('renders a custom reasoning component once per eligible part', () => {
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
          type: 'tool-test_tool' as const,
          toolCallId: '123',
          input: {},
          state: 'output-available' as const,
          output: {},
        },
        { type: 'reasoning' as const, text: '   ', state: 'done' as const },
        {
          type: 'reasoning' as const,
          text: 'Current thought',
          state: 'streaming' as const,
        },
      ],
    };
    const context = createContext({
      status: 'streaming',
      messages: [message],
      tools: {
        test_tool: {
          layoutComponent: () => <div>Tool result</div>,
          addToolResult: jest.fn(),
          applyFilters: jest.fn(),
        },
      },
    });
    const reasoningComponent = jest.fn(
      ({ part }: ChatMessageReasoningComponentProps) => (
        <div data-testid="custom-reasoning">{part.text}</div>
      )
    );

    const { getAllByTestId, getByText } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={message}
        context={context}
        showReasoning={true}
        reasoningComponent={reasoningComponent}
      />
    );

    // The blank part at index 2 stays ineligible, so it gets no call.
    expect(
      getAllByTestId('custom-reasoning').map((node) => node.textContent)
    ).toEqual(['First thought', 'Current thought']);
    expect(getByText('Tool result')).toBeInTheDocument();
    expect(reasoningComponent).toHaveBeenCalledTimes(2);
    expect(reasoningComponent.mock.calls[0][0]).toEqual({
      part: message.parts[0],
      partIndex: 0,
      isStreaming: false,
      message,
      context,
    });
    expect(reasoningComponent.mock.calls[1][0]).toEqual({
      part: message.parts[3],
      partIndex: 3,
      isStreaming: true,
      message,
      context,
    });
  });

  test('keeps custom reasoning in stream order around tool calls', () => {
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
          type: 'tool-first_tool' as const,
          toolCallId: 'a',
          input: {},
          state: 'output-available' as const,
          output: {},
        },
        {
          type: 'reasoning' as const,
          text: 'Second thought',
          state: 'done' as const,
        },
        {
          type: 'tool-second_tool' as const,
          toolCallId: 'b',
          input: {},
          state: 'output-available' as const,
          output: {},
        },
        {
          type: 'reasoning' as const,
          text: 'Third thought',
          state: 'done' as const,
        },
        { type: 'text' as const, text: 'Final answer' },
      ],
    };

    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={message}
        context={createContext({
          messages: [message],
          tools: {
            first_tool: {
              layoutComponent: () => <div>TOOL a</div>,
              addToolResult: jest.fn(),
              applyFilters: jest.fn(),
            },
            second_tool: {
              layoutComponent: () => <div>TOOL b</div>,
              addToolResult: jest.fn(),
              applyFilters: jest.fn(),
            },
          },
        })}
        showReasoning={true}
        reasoningComponent={({ part }: ChatMessageReasoningComponentProps) => (
          <div>{part.text}</div>
        )}
      />
    );

    const rendered = container.querySelector('.ais-ChatMessage-message')!;

    expect(
      Array.from(rendered.children).map((child) => child.textContent)
    ).toEqual([
      'First thought',
      'TOOL a',
      'Second thought',
      'TOOL b',
      'Third thought',
      'Final answer',
    ]);
  });

  test('marks the aggregate disclosure busy while reasoning streams', () => {
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
        context={createContext({ status: 'streaming', messages: [message] })}
        showReasoning={true}
      />
    );

    let disclosures = getAllByRole('group', { name: 'Reasoning' });
    expect(disclosures).toHaveLength(1);
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'true');
    expect(disclosures[0]).not.toHaveAttribute('open');
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-label')
    ).toHaveTextContent(/^Reasoning$/);
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-hint')
    ).toHaveTextContent('Second thought');

    rerender(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          ...message,
          parts: [message.parts[0], { ...message.parts[1], state: 'done' }],
        }}
        context={createContext({ status: 'ready', messages: [message] })}
        showReasoning={true}
      />
    );

    disclosures = getAllByRole('group', { name: 'Reasoning' });
    expect(disclosures).toHaveLength(1);
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'false');
    expect(disclosures[0]).not.toHaveAttribute('open');
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-label')
    ).toHaveTextContent(/^Reasoning$/);
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-hint')
    ).not.toBeInTheDocument();
  });

  test('signals activity on the icon and shows the current hint', () => {
    const { getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [{ type: 'reasoning', text: 'Working', state: 'streaming' }],
        }}
        context={createContext({
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
    const hint = summary.querySelector('.ais-ChatMessageReasoning-hint')!;

    expect(disclosure).toHaveAttribute('aria-busy', 'true');
    expect(label).toHaveTextContent(/^Raisonnement de la demande en cours$/);
    expect(label).toHaveClass('ais-ChatMessageReasoning-label--streaming');
    expect(hint).toHaveTextContent('Working');

    expect(
      Array.from(summary.children).map((child) => child.className)
    ).toEqual([
      'ais-ChatMessageReasoning-icon ais-ChatMessageReasoning-icon--streaming',
      'ais-ChatMessageReasoning-label ais-ChatMessageReasoning-label--streaming',
      'ais-ChatMessageReasoning-status',
      'ais-ChatMessageReasoning-chevron',
    ]);
    expect(summary).toHaveTextContent(
      /^Raisonnement de la demande en cours·Working$/
    );
  });

  test('renders the current Markdown hint without exposing markup', () => {
    const hint = '**Searching for TVs** I need… <img src=x onerror=alert(1)>';
    const { getByRole } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: '1',
          parts: [{ type: 'reasoning', text: hint, state: 'streaming' }],
        }}
        context={createContext({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    const hintElement = getByRole('group', {
      name: 'Reasoning',
    }).querySelector('.ais-ChatMessageReasoning-hint')!;
    expect(hintElement).toHaveTextContent('Searching for TVs I need…');
    expect(hintElement).not.toHaveTextContent('**');
    expect(hintElement).not.toHaveTextContent('<img');
    expect(hintElement.querySelector('strong')).toHaveTextContent(
      'Searching for TVs'
    );
    expect(hintElement.querySelector('img')).toBeNull();
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
        context={createContext({
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

  test('marks only the current reasoning entry as active', () => {
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
        context={createContext({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    const disclosures = getAllByRole('group', { name: 'Reasoning' });
    const entries = getAllByRole('listitem');
    expect(disclosures).toHaveLength(1);
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'true');
    expect(entries[0]).not.toHaveAttribute('aria-current');
    expect(entries[1]).toHaveAttribute('aria-current', 'step');
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-hint')
    ).toHaveTextContent('Check one candidate');
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
            context={createContext({ status: 'streaming', messages })}
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
        context={createContext({
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

  test('keeps an earlier unfinished reasoning entry active after a later block ends', () => {
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
        context={createContext({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts: [] }],
        })}
        showReasoning={true}
      />
    );

    const disclosures = getAllByRole('group', { name: 'Reasoning' });
    const entries = getAllByRole('listitem');
    expect(disclosures).toHaveLength(1);
    expect(disclosures[0]).toHaveAttribute('aria-busy', 'true');
    expect(entries[0]).toHaveAttribute('aria-current', 'step');
    expect(entries[1]).not.toHaveAttribute('aria-current');
    expect(
      disclosures[0].querySelector('.ais-ChatMessageReasoning-hint')
    ).toHaveTextContent('Compare the candidates');
  });

  test('keeps the reader choice through interleaved updates and completion', () => {
    const renderMessage = (
      parts: ChatMessageBase['parts'],
      status: 'streaming' | 'ready' = 'streaming'
    ) => (
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{ role: 'assistant', id: '1', parts }}
        context={createContext({
          status,
          messages: [{ role: 'assistant', id: '1', parts }],
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
    const firstParts: ChatMessageBase['parts'] = [
      { type: 'reasoning', text: 'First thought', state: 'streaming' },
    ];
    const interleavedParts: ChatMessageBase['parts'] = [
      { type: 'reasoning', text: 'First thought', state: 'done' },
      {
        type: 'tool-test_tool',
        toolCallId: '123',
        input: {},
        state: 'output-available',
        output: {},
      },
      { type: 'reasoning', text: 'Second thought', state: 'streaming' },
    ];
    const answeringParts: ChatMessageBase['parts'] = [
      ...interleavedParts.slice(0, -1),
      { type: 'reasoning', text: 'Second thought', state: 'done' },
      { type: 'text', text: 'Final answer', state: 'streaming' },
    ];
    const { getByRole, rerender } = render(renderMessage(firstParts));
    const disclosure = getByRole('group', { name: 'Reasoning' });

    userEvent.click(disclosure.querySelector('summary')!);
    expect(disclosure).toHaveAttribute('open');

    rerender(renderMessage(interleavedParts));
    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute('open');

    userEvent.click(
      getByRole('group', { name: 'Reasoning' }).querySelector('summary')!
    );
    expect(getByRole('group', { name: 'Reasoning' })).not.toHaveAttribute(
      'open'
    );

    rerender(renderMessage(answeringParts));
    expect(getByRole('group', { name: 'Reasoning' })).not.toHaveAttribute(
      'open'
    );
    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute(
      'aria-busy',
      'false'
    );

    rerender(renderMessage(answeringParts, 'ready'));
    expect(getByRole('group', { name: 'Reasoning' })).not.toHaveAttribute(
      'open'
    );
  });

  test('mounts restored completed history static and reader-owned', () => {
    const message = {
      role: 'assistant' as const,
      id: 'restored',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Restored thought',
          state: 'done' as const,
        },
        {
          type: 'text' as const,
          text: 'Restored answer',
          state: 'done' as const,
        },
      ],
    };
    const renderMessage = () => (
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{ ...message, parts: [...message.parts] }}
        context={createContext({ status: 'ready', messages: [message] })}
        showReasoning={true}
      />
    );
    const { getByRole, rerender } = render(renderMessage());
    const disclosure = getByRole('group', { name: 'Reasoning' });

    expect(disclosure).not.toHaveAttribute('open');
    expect(disclosure).toHaveAttribute('aria-busy', 'false');
    expect(
      disclosure.querySelector('.ais-ChatMessageReasoning-hint')
    ).not.toBeInTheDocument();
    expect(
      disclosure.querySelector('.ais-ChatMessageReasoning-icon--streaming')
    ).not.toBeInTheDocument();

    userEvent.click(disclosure.querySelector('summary')!);
    expect(disclosure).toHaveAttribute('open');

    rerender(renderMessage());
    expect(getByRole('group', { name: 'Reasoning' })).toHaveAttribute('open');
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
        context={createContext({
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

  test('preserves an open disclosure across a textless reasoning-to-tool gap', () => {
    const renderMessage = (parts: ChatMessageBase['parts']) => (
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{ role: 'assistant', id: '1', parts }}
        context={createContext({
          status: 'streaming',
          messages: [{ role: 'assistant', id: '1', parts }],
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
    const { getByRole, getByText, queryByRole, rerender } = render(
      renderMessage([{ type: 'reasoning', text: '', state: 'streaming' }])
    );
    const disclosure = getByRole('group', { name: 'Reasoning' });
    const toolPart = {
      type: 'tool-test_tool' as const,
      toolCallId: '123',
      input: {},
      state: 'output-available' as const,
      output: {},
    };

    userEvent.click(disclosure.querySelector('summary')!);
    expect(disclosure).toHaveAttribute('open');

    rerender(
      renderMessage([{ type: 'reasoning', text: '', state: 'done' }, toolPart])
    );
    expect(queryByRole('group', { name: 'Reasoning' })).not.toBeInTheDocument();
    expect(disclosure).toBeInTheDocument();
    expect(disclosure).toHaveAttribute('hidden');
    expect(disclosure).toHaveAttribute('open');
    expect(getByText('Tool result').closest('.ais-ChatMessage-tool')).not.toBe(
      null
    );

    rerender(
      renderMessage([
        { type: 'reasoning', text: '', state: 'done' },
        toolPart,
        { type: 'reasoning', text: 'Next thought', state: 'streaming' },
      ])
    );
    const resumedDisclosure = getByRole('group', { name: 'Reasoning' });

    expect(resumedDisclosure).toHaveAttribute('open');
    expect(resumedDisclosure).toBe(disclosure);
    expect(resumedDisclosure).not.toContainElement(getByText('Tool result'));
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
        context={createContext({
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
        context={createContext()}
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
        context={createContext()}
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
        context={createContext()}
      />
    );

    // markdown-to-jsx turns `*b*` into an <em>, so the literal asterisks are
    // gone from the output.
    expect(container.querySelector('em')).not.toBeNull();
    expect(container.querySelector('em')!.textContent).toBe('b');
    expect(container.querySelector('.ais-ChatMessage-text')).toBeNull();
  });

  test('renders each text part with a custom component and its message context', () => {
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        { type: 'text' as const, text: 'First answer' },
        { type: 'step-start' as const },
        { type: 'text' as const, text: 'Second answer' },
      ],
    };
    const textComponent = jest.fn(
      ({ part, partIndex }: ChatMessageTextComponentProps) => (
        <p data-part-index={partIndex}>{part.text}</p>
      )
    );

    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={message}
        context={createContext({ status: 'streaming', messages: [message] })}
        textComponent={textComponent}
      />
    );

    expect(
      textComponent.mock.calls.map(([props]) => ({
        part: props.part,
        message: props.message,
        messages: props.messages,
        status: props.status,
        partIndex: props.partIndex,
      }))
    ).toEqual([
      {
        part: message.parts[0],
        message,
        messages: [message],
        status: 'streaming',
        partIndex: 0,
      },
      {
        part: message.parts[2],
        message,
        messages: [message],
        status: 'streaming',
        partIndex: 2,
      },
    ]);
    expect(
      Array.from(container.querySelectorAll('[data-part-index]')).map(
        (element) => element.textContent
      )
    ).toEqual(['First answer', 'Second answer']);
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
        context={createContext()}
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
        context={createContext()}
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
        context={createContext()}
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
        context={createContext()}
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
        context={createContext()}
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
        context={createContext()}
      />
    );

    expect(container.textContent).toBe('Hello');
    expect(container.textContent).not.toContain('example.com');
    expect(container.textContent).not.toContain('turnContext');
  });

  test('renders with tools', () => {
    const layoutComponent = jest.fn(({ context }) => (
      <div className="wrapper">{JSON.stringify(context.message.output)}</div>
    ));
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
        context={createContext({
          tools: {
            test_tool: {
              layoutComponent,
              addToolResult: jest.fn(),
              onToolCall: jest.fn(),
              applyFilters: jest.fn(),
            },
          },
        })}
      />
    );
    expect(layoutComponent.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        context: expect.objectContaining({ status: 'ready' }),
      })
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

  test('passes the explicit messages override to tool components', () => {
    const layoutComponent = jest.fn(({ context }) => (
      <div>{context.messages?.length}</div>
    ));
    const overrideMessages: ChatMessageBase[] = [
      {
        role: 'assistant',
        id: 'override',
        parts: [{ type: 'text', text: 'Override' }],
      },
    ];
    const sharedMessages: ChatMessageBase[] = [
      { role: 'user', id: 'shared', parts: [{ type: 'text', text: 'Shared' }] },
    ];
    render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        messages={overrideMessages}
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
        context={createContext({
          messages: sharedMessages,
          tools: {
            test_tool: {
              layoutComponent,
              addToolResult: jest.fn(),
              onToolCall: jest.fn(),
              applyFilters: jest.fn(),
            },
          },
        })}
      />
    );

    expect(layoutComponent.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        context: expect.objectContaining({ messages: overrideMessages }),
      })
    );
  });

  test('hands any tool the records the conversation searched for', () => {
    const searchPart = {
      type: 'tool-algolia_search_index',
      toolCallId: 'search',
      input: { query: 'shoes' },
      state: 'output-available',
      output: { hits: [{ objectID: 'record-1', name: 'Runner' }] },
    } as const;
    // A tool of our own, handed nothing but an object ID.
    const customPart = {
      type: 'tool-custom_tool',
      toolCallId: 'custom',
      input: { objectID: 'record-1' },
      state: 'output-available',
      output: {},
    } as const;
    const message = {
      role: 'assistant',
      id: '1',
      parts: [searchPart, customPart],
    } as ChatMessageBase;

    const { container } = render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={message}
        messages={[message]}
        context={createContext({
          status: 'ready',
          tools: {
            algolia_search_index: {
              addToolResult: jest.fn(),
              applyFilters: jest.fn(),
            },
            custom_tool: {
              layoutComponent: ({ context }) => {
                const { message: part, records } = context;
                return (
                  <div className="custom">
                    {
                      records?.get(
                        (part.input as { objectID: string }).objectID
                      )?.name as string
                    }
                  </div>
                );
              },
              addToolResult: jest.fn(),
              applyFilters: jest.fn(),
            },
          },
        })}
      />
    );

    expect(container.querySelector('.custom')).toHaveTextContent('Runner');
  });

  test('adds assistant message attribution to tool result events', () => {
    const sendEvent = jest.fn();
    const hit = {
      objectID: 'record-1',
      __queryID: 'search-query-id',
      __position: 1,
    };

    render(
      <ChatMessage
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        message={{
          role: 'assistant',
          id: 'assistant-message-id',
          parts: [
            {
              type: 'tool-test_tool',
              toolCallId: 'tool-call-id',
              input: {},
              state: 'output-available',
              output: {},
            },
          ],
        }}
        context={createContext({
          tools: {
            test_tool: {
              layoutComponent: ({ context: { sendEvent: toolSendEvent } }) => {
                toolSendEvent('click', hit, 'Product Clicked', {
                  customField: 'custom value',
                });

                return <div>Tool result</div>;
              },
              addToolResult: jest.fn(),
              onToolCall: jest.fn(),
              applyFilters: jest.fn(),
              sendEvent,
              insightsEventContext: {
                agentId: 'agent-id',
              },
            },
          },
        })}
      />
    );

    expect(sendEvent).toHaveBeenCalledWith('click', hit, 'Product Clicked', {
      customField: 'custom value',
      queryID: 'message_assistant-message-id',
      agentId: 'agent-id',
      toolCallId: 'tool-call-id',
    });
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
      layoutComponent: ({ context: { addToolResult: submit } }) => {
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
        context={createContext({
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
        context={createContext({
          tools: {
            test_tool: {
              layoutComponent: ({ context: { addToolResult: submit } }) => {
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

  /* eslint-disable typescript/no-deprecated -- these tests exist to
     pin the deprecated root-level props until they are removed. */
  describe('deprecated root-level props', () => {
    const toolMessage: ChatMessageBase = {
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
    };

    test('still passes the pre-`context` root props to tool components', () => {
      const layoutComponent = jest.fn(() => <div />);
      const setIndexUiState = jest.fn();
      const onClose = jest.fn();
      const applyFilters = jest.fn();
      const messages = [toolMessage];

      render(
        <ChatMessage
          indexUiState={{ query: 'shoes' }}
          setIndexUiState={setIndexUiState}
          message={toolMessage}
          context={createContext({
            messages,
            status: 'streaming',
            onClose,
            tools: {
              test_tool: {
                layoutComponent,
                addToolResult: jest.fn(),
                applyFilters,
              },
            },
          })}
        />
      );

      // A tool component written against the previous API reads these from the
      // root; they must stay in lockstep with `context`.
      expect(layoutComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({ toolCallId: '123' }),
          messages,
          status: 'streaming',
          indexUiState: { query: 'shoes' },
          setIndexUiState,
          onClose,
          applyFilters,
          addToolResult: expect.any(Function),
          sendEvent: expect.any(Function),
          records: expect.anything(),
        }),
        {}
      );
    });

    test('root `status` overrides the shared context', () => {
      const layoutComponent = jest.fn(() => <div />);

      render(
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={toolMessage}
          status="streaming"
          context={createContext({
            status: 'ready',
            tools: {
              test_tool: {
                layoutComponent,
                addToolResult: jest.fn(),
                applyFilters: jest.fn(),
              },
            },
          })}
        />
      );

      expect(layoutComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'streaming',
          context: expect.objectContaining({ status: 'streaming' }),
        }),
        {}
      );
    });

    test('root `tools` overrides the shared context', () => {
      const layoutComponent = jest.fn(() => <div />);

      render(
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={toolMessage}
          tools={{
            test_tool: {
              layoutComponent,
              addToolResult: jest.fn(),
              applyFilters: jest.fn(),
            },
          }}
          // The context registers no tools, so the part only renders if the
          // root-level override wins.
          context={createContext({ tools: {} })}
        />
      );

      expect(layoutComponent).toHaveBeenCalledTimes(1);
    });

    test('root `onClose` overrides the shared context', () => {
      const layoutComponent = jest.fn(() => <div />);
      const onClose = jest.fn();

      render(
        <ChatMessage
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          message={toolMessage}
          onClose={onClose}
          context={createContext({
            onClose: jest.fn(),
            tools: {
              test_tool: {
                layoutComponent,
                addToolResult: jest.fn(),
                applyFilters: jest.fn(),
              },
            },
          })}
        />
      );

      expect(layoutComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          onClose,
          context: expect.objectContaining({ onClose }),
        }),
        {}
      );
    });
  });
  /* eslint-enable typescript/no-deprecated */
});
