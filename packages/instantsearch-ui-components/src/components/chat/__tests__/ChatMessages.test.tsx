/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { act, render, screen } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import * as chatUtils from '../../../lib/utils/chat';
import { createChatMessageErrorComponent } from '../ChatMessageError';
import { createChatMessagesComponent } from '../ChatMessages';

import type {
  ChatMessageReasoningComponentProps,
  ChatMessageTextComponentProps,
} from '../ChatMessage';
import type { ChatMessageErrorProps } from '../ChatMessageError';
import type { ChatComponentPropsWithContext } from '../types';

const ChatMessages = createChatMessagesComponent({
  createElement,
  Fragment,
  useMemo: (factory) => factory(),
  useState,
  useEffect,
});
const MemoizedChatMessages = createChatMessagesComponent({
  createElement,
  Fragment,
  useMemo,
  useState,
  useEffect,
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

  test('shows the loader while streaming reasoning is hidden', () => {
    const { container } = render(
      <ChatMessages
        messages={[
          {
            role: 'assistant',
            id: '1',
            parts: [
              {
                type: 'reasoning',
                text: 'Checking the catalog.',
                state: 'streaming',
              },
            ],
          },
        ]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        status="streaming"
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.queryByRole('group', { name: 'Reasoning' })
    ).not.toBeInTheDocument();
    expect(container.querySelector('.ais-ChatMessageLoader')).not.toBeNull();
  });

  test('does not show the loader below visible streaming reasoning', () => {
    const { container } = render(
      <ChatMessages
        messages={[
          {
            role: 'assistant',
            id: '1',
            parts: [
              {
                type: 'reasoning',
                text: 'Checking the catalog.',
                state: 'streaming',
              },
            ],
          },
        ]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        status="streaming"
        assistantMessageProps={{ showReasoning: true }}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getByRole('group', { name: 'Reasoning' })
    ).toBeInTheDocument();
    expect(container.querySelector('.ais-ChatMessageLoader')).toBeNull();
  });

  test('shows the loader after empty reasoning finishes while the response continues', () => {
    const { container } = render(
      <ChatMessages
        messages={[
          {
            role: 'assistant',
            id: '1',
            parts: [
              {
                type: 'reasoning',
                text: '',
                state: 'done',
              },
            ],
          },
        ]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        status="streaming"
        assistantMessageProps={{ showReasoning: true }}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.queryByRole('group', { name: 'Reasoning' })
    ).not.toBeInTheDocument();
    expect(container.querySelector('.ais-ChatMessageLoader')).not.toBeNull();
  });

  test('shows the loader after visible reasoning finishes while the response continues', () => {
    const { container } = render(
      <ChatMessages
        messages={[
          {
            role: 'assistant',
            id: '1',
            parts: [
              {
                type: 'reasoning',
                text: 'Checking the catalog.',
                state: 'done',
              },
            ],
          },
        ]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        status="streaming"
        assistantMessageProps={{ showReasoning: true }}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getByRole('group', { name: 'Reasoning' })
    ).toBeInTheDocument();
    expect(container.querySelector('.ais-ChatMessageLoader')).not.toBeNull();
  });

  test('does not show the loader while an earlier reasoning part is still active', () => {
    const { container } = render(
      <ChatMessages
        messages={[
          {
            role: 'assistant',
            id: '1',
            parts: [
              {
                type: 'reasoning',
                text: 'Checking the catalog.',
                state: 'streaming',
              },
              {
                type: 'reasoning',
                text: 'Comparing the results.',
                state: 'done',
              },
            ],
          },
        ]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        status="streaming"
        assistantMessageProps={{ showReasoning: true }}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getAllByRole('group', { name: 'Reasoning' })[0]
    ).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.ais-ChatMessageLoader')).toBeNull();
  });

  test('updates nested reasoning labels for every completed message', () => {
    const firstMessage = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Checking the catalog.',
          state: 'done' as const,
        },
      ],
    };
    const secondMessage = {
      role: 'assistant' as const,
      id: '2',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Comparing the results.',
          state: 'done' as const,
        },
      ],
    };
    const { rerender } = render(
      <MemoizedChatMessages
        messages={[firstMessage, secondMessage]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        assistantMessageProps={{
          showReasoning: true,
          translations: { reasoningLabel: 'Reasoning' },
        }}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(screen.getAllByRole('group', { name: 'Reasoning' })).toHaveLength(2);

    rerender(
      <MemoizedChatMessages
        messages={[firstMessage, { ...secondMessage }]}
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        assistantMessageProps={{
          showReasoning: true,
          translations: { reasoningLabel: 'Raisonnement' },
        }}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.queryByRole('group', { name: 'Reasoning' })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('group', { name: 'Raisonnement' })).toHaveLength(
      2
    );
  });

  test.each(['messageClassNames', 'assistantMessageProps'] as const)(
    'updates reasoning classes for every completed message through %s',
    (classNameSource) => {
      const firstMessage = {
        role: 'assistant' as const,
        id: '1',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Checking the catalog.',
            state: 'done' as const,
          },
        ],
      };
      const secondMessage = {
        role: 'assistant' as const,
        id: '2',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Comparing the results.',
            state: 'done' as const,
          },
        ],
      };
      const createReasoningClassNames = (suffix: string) => ({
        reasoning: `reasoning-${suffix}`,
        reasoningHeader: `reasoning-header-${suffix}`,
        reasoningIcon: `reasoning-icon-${suffix}`,
        reasoningLabel: `reasoning-label-${suffix}`,
        reasoningChevron: `reasoning-chevron-${suffix}`,
        reasoningBody: `reasoning-body-${suffix}`,
        reasoningText: `reasoning-text-${suffix}`,
      });
      const createClassNameProps = (suffix: string) =>
        classNameSource === 'messageClassNames'
          ? {
              messageClassNames: createReasoningClassNames(suffix),
              assistantMessageProps: { showReasoning: true },
            }
          : {
              assistantMessageProps: {
                showReasoning: true,
                classNames: createReasoningClassNames(suffix),
              },
            };
      const { container, rerender } = render(
        <MemoizedChatMessages
          messages={[firstMessage, secondMessage]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          {...createClassNameProps('old')}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
        />
      );
      const firstDisclosure = container.querySelector('details');
      firstDisclosure!.open = true;
      Object.values(createReasoningClassNames('old')).forEach((className) => {
        expect(container.querySelectorAll(`.${className}`)).toHaveLength(2);
      });

      rerender(
        <MemoizedChatMessages
          messages={[firstMessage, { ...secondMessage }]}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          {...createClassNameProps('new')}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
        />
      );

      Object.values(createReasoningClassNames('old')).forEach((className) => {
        expect(container.querySelectorAll(`.${className}`)).toHaveLength(0);
      });
      Object.values(createReasoningClassNames('new')).forEach((className) => {
        expect(container.querySelectorAll(`.${className}`)).toHaveLength(2);
      });
      expect(container.querySelector('details')).toBe(firstDisclosure);
      expect(firstDisclosure).toHaveProperty('open', true);
      expect(firstDisclosure).toHaveAttribute('aria-label', 'Reasoning');
      expect(firstDisclosure).toHaveAttribute('aria-busy', 'false');
    }
  );

  // The test above moves all seven keys at once, so six could stop being
  // dependencies unnoticed. One key at a time makes each individually load-bearing.
  const reasoningClassCases: Array<
    [string, 'messageClassNames' | 'assistantMessageProps']
  > = [
    'reasoning',
    'reasoningHeader',
    'reasoningIcon',
    'reasoningLabel',
    'reasoningChevron',
    'reasoningBody',
    'reasoningText',
  ].flatMap((key) => [
    [key, 'messageClassNames'],
    [key, 'assistantMessageProps'],
  ]);

  test.each(reasoningClassCases)(
    'updates the %s class on its own for completed messages through %s',
    (key, classNameSource) => {
      const message = {
        role: 'assistant' as const,
        id: '1',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Checking the catalog.',
            state: 'done' as const,
          },
        ],
      };
      const createProps = (suffix: string) => {
        const reasoningClassNames = { [key]: `${key}-${suffix}` };
        return {
          // Same `message` reference in both renders, so the class name is the
          // only input the comparator can react to.
          messages: [message],
          indexUiState: {},
          setIndexUiState: jest.fn(),
          tools: {},
          onReload: jest.fn(),
          onClose: jest.fn(),
          ...(classNameSource === 'messageClassNames'
            ? {
                messageClassNames: reasoningClassNames,
                assistantMessageProps: { showReasoning: true },
              }
            : {
                assistantMessageProps: {
                  showReasoning: true,
                  classNames: reasoningClassNames,
                },
              }),
        };
      };

      const { container, rerender } = render(
        <MemoizedChatMessages {...createProps('old')} />
      );
      const disclosure = container.querySelector('details')!;
      disclosure.open = true;
      expect(container.querySelectorAll(`.${key}-old`)).toHaveLength(1);

      rerender(<MemoizedChatMessages {...createProps('new')} />);

      expect(container.querySelectorAll(`.${key}-old`)).toHaveLength(0);
      expect(container.querySelectorAll(`.${key}-new`)).toHaveLength(1);
      // Updated in place rather than remounted, so reader state survives.
      expect(container.querySelector('details')).toBe(disclosure);
      expect(disclosure).toHaveProperty('open', true);
    }
  );

  test('falls back to the default label when a nested override is removed', () => {
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Checking the catalog.',
          state: 'done' as const,
        },
      ],
    };
    const createProps = (
      translations: Record<string, string>
    ): React.ComponentProps<typeof MemoizedChatMessages> => ({
      messages: [message],
      indexUiState: {},
      setIndexUiState: jest.fn(),
      messageTranslations: { reasoningLabel: 'Nested' },
      assistantMessageProps: { showReasoning: true, translations },
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    });

    const { container, rerender } = render(
      <MemoizedChatMessages {...createProps({ reasoningLabel: 'Nested' })} />
    );
    expect(container.querySelector('details')).toHaveAttribute(
      'aria-label',
      'Nested'
    );

    // The nested object replaces `messageTranslations` wholesale, so dropping its
    // label falls back to the built-in default, not to the outer value.
    rerender(
      <MemoizedChatMessages {...createProps({ messageLabel: 'Unrelated' })} />
    );

    expect(container.querySelector('details')).toHaveAttribute(
      'aria-label',
      'Reasoning'
    );
  });

  test('falls back to the default label when a nested override becomes undefined', () => {
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Checking the catalog.',
          state: 'done' as const,
        },
      ],
    };
    const createProps = (
      translations: Record<string, string> | undefined
    ): React.ComponentProps<typeof MemoizedChatMessages> => ({
      messages: [message],
      indexUiState: {},
      setIndexUiState: jest.fn(),
      messageTranslations: { reasoningLabel: 'Nested' },
      assistantMessageProps: { showReasoning: true, translations },
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    });

    const { container, rerender } = render(
      <MemoizedChatMessages {...createProps({ reasoningLabel: 'Nested' })} />
    );
    expect(container.querySelector('details')).toHaveAttribute(
      'aria-label',
      'Nested'
    );

    // The key is present holding `undefined`, which still replaces
    // `messageTranslations`. The comparator has to read presence, not nullishness.
    rerender(<MemoizedChatMessages {...createProps(undefined)} />);

    expect(container.querySelector('details')).toHaveAttribute(
      'aria-label',
      'Reasoning'
    );
  });

  test('drops a nested class override when it becomes undefined', () => {
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Checking the catalog.',
          state: 'done' as const,
        },
      ],
    };
    const createProps = (
      classNames: Record<string, string> | undefined
    ): React.ComponentProps<typeof MemoizedChatMessages> => ({
      messages: [message],
      indexUiState: {},
      setIndexUiState: jest.fn(),
      messageClassNames: { reasoning: 'shared-reasoning' },
      assistantMessageProps: { showReasoning: true, classNames },
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    });

    const { container, rerender } = render(
      <MemoizedChatMessages
        {...createProps({ reasoning: 'shared-reasoning' })}
      />
    );
    expect(container.querySelectorAll('.shared-reasoning')).toHaveLength(1);

    // Both surfaces hold the same value here, so a nullish fallback would compute
    // an unchanged dependency and strand the class on a row that dropped it.
    rerender(<MemoizedChatMessages {...createProps(undefined)} />);

    expect(container.querySelectorAll('.shared-reasoning')).toHaveLength(0);
  });

  test('leaves completed user rows alone when assistant reasoning changes', () => {
    const userMessage = {
      role: 'user' as const,
      id: '1',
      parts: [{ type: 'text' as const, text: 'Show me sneakers.' }],
    };
    const assistantMessage = {
      role: 'assistant' as const,
      id: '2',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Checking the catalog.',
          state: 'done' as const,
        },
      ],
    };
    let userRenders = 0;
    const createProps = (reasoningLabel: string) => ({
      messages: [userMessage, assistantMessage],
      indexUiState: {},
      setIndexUiState: jest.fn(),
      userMessageProps: {
        footerComponent: () => {
          userRenders++;
          return <span />;
        },
      },
      assistantMessageProps: {
        showReasoning: true,
        translations: { reasoningLabel },
      },
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    });

    const { rerender } = render(
      <MemoizedChatMessages {...createProps('Reasoning')} />
    );
    const baseline = userRenders;
    expect(baseline).toBeGreaterThan(0);

    rerender(<MemoizedChatMessages {...createProps('Raisonnement')} />);

    // A user row renders with `userMessageProps`, so an assistant-only change must
    // not invalidate it and recompile its markdown to the same output.
    expect(userRenders).toBe(baseline);
    expect(screen.getAllByRole('group', { name: 'Raisonnement' })).toHaveLength(
      1
    );
  });

  test('updates completed user rows when their own reasoning changes', () => {
    const message = {
      role: 'user' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Checking the catalog.',
          state: 'done' as const,
        },
      ],
    };
    const createProps = (reasoningLabel: string) => ({
      messages: [message],
      indexUiState: {},
      setIndexUiState: jest.fn(),
      userMessageProps: {
        showReasoning: true,
        translations: { reasoningLabel },
      },
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    });

    const { container, rerender } = render(
      <MemoizedChatMessages {...createProps('Reasoning')} />
    );
    expect(container.querySelector('details')).toHaveAttribute(
      'aria-label',
      'Reasoning'
    );

    // Reading `assistantMessageProps` for every role would strand this change.
    rerender(<MemoizedChatMessages {...createProps('Raisonnement')} />);

    expect(container.querySelector('details')).toHaveAttribute(
      'aria-label',
      'Raisonnement'
    );
  });

  test('does not scan for active reasoning while the disclosure is off', () => {
    const isReasoningPartActive = jest.spyOn(
      chatUtils,
      'isReasoningPartActive'
    );
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'One.',
          state: 'streaming' as const,
        },
        {
          type: 'reasoning' as const,
          text: 'Two.',
          state: 'streaming' as const,
        },
      ],
    };
    const props = {
      messages: [message],
      indexUiState: {},
      setIndexUiState: jest.fn(),
      status: 'streaming' as const,
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    };

    const { unmount } = render(<ChatMessages {...props} />);

    // The scan slices the remaining parts per candidate, so it must not run while
    // the opt-in is off.
    expect(isReasoningPartActive).not.toHaveBeenCalled();

    unmount();
    render(
      <ChatMessages
        {...props}
        assistantMessageProps={{ showReasoning: true }}
      />
    );

    expect(isReasoningPartActive).toHaveBeenCalled();
    isReasoningPartActive.mockRestore();
  });

  test('toggles the disclosure on completed messages when the option changes', () => {
    const message = {
      role: 'assistant' as const,
      id: '1',
      parts: [
        {
          type: 'reasoning' as const,
          text: 'Checking the catalog.',
          state: 'done' as const,
        },
      ],
    };
    const createProps = (showReasoning: boolean) => ({
      messages: [message],
      indexUiState: {},
      setIndexUiState: jest.fn(),
      assistantMessageProps: { showReasoning },
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    });

    const { container, rerender } = render(
      <MemoizedChatMessages {...createProps(false)} />
    );
    expect(container.querySelector('details')).toBeNull();

    // A host app can flip the option after the answer settled, so completed rows
    // have to react to the option itself, not only to labels and classes.
    rerender(<MemoizedChatMessages {...createProps(true)} />);

    expect(container.querySelector('details')).not.toBeNull();
  });

  describe('textComponent', () => {
    test('routes the ordered conversation through both message prop paths', () => {
      const messages = [
        {
          role: 'user' as const,
          id: 'user-1',
          parts: [{ type: 'text' as const, text: 'Question' }],
        },
        {
          role: 'assistant' as const,
          id: 'assistant-1',
          parts: [{ type: 'text' as const, text: 'Answer' }],
        },
      ];
      const userTextComponent = jest.fn(
        ({ part }: ChatMessageTextComponentProps) => (
          <span data-testid="user-text">{part.text}</span>
        )
      );
      const assistantTextComponent = jest.fn(
        ({ part }: ChatMessageTextComponentProps) => (
          <span data-testid="assistant-text">{part.text}</span>
        )
      );

      render(
        <ChatMessages
          messages={messages}
          indexUiState={{}}
          setIndexUiState={jest.fn()}
          status="ready"
          userMessageProps={{ textComponent: userTextComponent }}
          assistantMessageProps={{ textComponent: assistantTextComponent }}
          tools={{}}
          onReload={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(userTextComponent.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          part: messages[0].parts[0],
          message: messages[0],
          messages,
          status: 'ready',
          partIndex: 0,
        })
      );
      expect(assistantTextComponent.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          part: messages[1].parts[0],
          message: messages[1],
          messages,
          status: 'ready',
          partIndex: 0,
        })
      );
      expect(screen.getByTestId('user-text')).toHaveTextContent('Question');
      expect(screen.getByTestId('assistant-text')).toHaveTextContent('Answer');
    });

    test('updates completed messages when the text component changes', () => {
      const message = {
        role: 'assistant' as const,
        id: 'assistant-1',
        parts: [{ type: 'text' as const, text: 'Answer' }],
      };
      const messages = [message];
      const FirstTextComponent = ({ part }: ChatMessageTextComponentProps) => (
        <span data-testid="first-text">{part.text}</span>
      );
      const SecondTextComponent = ({ part }: ChatMessageTextComponentProps) => (
        <span data-testid="second-text">{part.text}</span>
      );
      const createProps = (
        textComponent: (props: ChatMessageTextComponentProps) => JSX.Element
      ) => ({
        messages,
        indexUiState: {},
        setIndexUiState: jest.fn(),
        assistantMessageProps: { textComponent },
        tools: {},
        onReload: jest.fn(),
        onClose: jest.fn(),
      });

      const { rerender } = render(
        <MemoizedChatMessages {...createProps(FirstTextComponent)} />
      );
      expect(screen.getByTestId('first-text')).toHaveTextContent('Answer');

      rerender(<MemoizedChatMessages {...createProps(SecondTextComponent)} />);

      expect(screen.queryByTestId('first-text')).not.toBeInTheDocument();
      expect(screen.getByTestId('second-text')).toHaveTextContent('Answer');
    });

    test('updates completed messages when the reasoning component changes', () => {
      const message = {
        role: 'assistant' as const,
        id: 'assistant-1',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Thought',
            state: 'done' as const,
          },
        ],
      };
      const messages = [message];
      const FirstReasoningComponent = ({
        part,
      }: ChatMessageReasoningComponentProps) => (
        <span data-testid="first-reasoning">{part.text}</span>
      );
      const SecondReasoningComponent = ({
        part,
      }: ChatMessageReasoningComponentProps) => (
        <span data-testid="second-reasoning">{part.text}</span>
      );
      const createProps = (
        reasoningComponent: (
          props: ChatMessageReasoningComponentProps
        ) => JSX.Element
      ) => ({
        messages,
        indexUiState: {},
        setIndexUiState: jest.fn(),
        assistantMessageProps: {
          showReasoning: true,
          reasoningComponent,
        },
        tools: {},
        onReload: jest.fn(),
        onClose: jest.fn(),
      });

      const { rerender } = render(
        <MemoizedChatMessages {...createProps(FirstReasoningComponent)} />
      );
      expect(screen.getByTestId('first-reasoning')).toHaveTextContent(
        'Thought'
      );

      rerender(
        <MemoizedChatMessages {...createProps(SecondReasoningComponent)} />
      );

      expect(screen.queryByTestId('first-reasoning')).not.toBeInTheDocument();
      expect(screen.getByTestId('second-reasoning')).toHaveTextContent(
        'Thought'
      );
    });

    test('does not rerender completed custom reasoning for scroll or callback-only changes', () => {
      const message = {
        role: 'assistant' as const,
        id: 'assistant-1',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Thought',
            state: 'done' as const,
          },
        ],
      };
      const messages = [message];
      const tools = {};
      const ReasoningComponent = jest.fn(
        ({ part }: ChatMessageReasoningComponentProps) => (
          <span data-testid="reasoning-render">{part.text}</span>
        )
      );
      const firstCallbacks = {
        onReload: jest.fn(),
        onClose: jest.fn(),
      };
      const secondCallbacks = {
        onReload: jest.fn(),
        onClose: jest.fn(),
      };
      const createProps = (
        isScrollAtBottom: boolean,
        callbacks: typeof firstCallbacks
      ) => ({
        messages,
        indexUiState: {},
        setIndexUiState: jest.fn(),
        assistantMessageProps: {
          showReasoning: true,
          reasoningComponent: ReasoningComponent,
        },
        tools,
        isScrollAtBottom,
        ...callbacks,
      });

      const { rerender } = render(
        <MemoizedChatMessages {...createProps(false, firstCallbacks)} />
      );
      expect(ReasoningComponent).toHaveBeenCalledTimes(1);

      rerender(<MemoizedChatMessages {...createProps(true, firstCallbacks)} />);
      expect(ReasoningComponent).toHaveBeenCalledTimes(1);

      rerender(
        <MemoizedChatMessages {...createProps(true, secondCallbacks)} />
      );
      expect(ReasoningComponent).toHaveBeenCalledTimes(1);
    });

    test('keeps the full reasoning component context current for completed messages', () => {
      const message = {
        role: 'assistant' as const,
        id: 'assistant-1',
        parts: [
          {
            type: 'reasoning' as const,
            text: 'Thought',
            state: 'done' as const,
          },
        ],
      };
      const messages = [message];
      const ReasoningComponent = ({
        context,
      }: ChatMessageReasoningComponentProps) => (
        <span data-testid="reasoning-state">
          {context.isClearing ? 'clearing' : 'idle'}:
          {context.open ? 'open' : 'closed'}
        </span>
      );
      const createProps = (isClearing: boolean) => ({
        messages,
        indexUiState: {},
        setIndexUiState: jest.fn(),
        assistantMessageProps: {
          showReasoning: true,
          reasoningComponent: ReasoningComponent,
        },
        tools: {},
        isClearing,
        open: true,
        onReload: jest.fn(),
        onClose: jest.fn(),
      });

      const { rerender } = render(
        <MemoizedChatMessages {...createProps(false)} />
      );
      expect(screen.getByTestId('reasoning-state')).toHaveTextContent(
        'idle:open'
      );

      rerender(<MemoizedChatMessages {...createProps(true)} />);

      expect(screen.getByTestId('reasoning-state')).toHaveTextContent(
        'clearing:open'
      );
    });

    test('updates completed tool rows when the panel is maximized', () => {
      // A completed (non-current) tool row: the memo must still track
      // `context.maximized` so tool components see the panel state change.
      const toolMessage = {
        role: 'assistant' as const,
        id: 'assistant-1',
        parts: [
          {
            type: 'tool-test_tool' as const,
            toolCallId: '123',
            input: {},
            state: 'output-available' as const,
            output: {},
          },
        ],
      };
      const trailingMessage = {
        role: 'assistant' as const,
        id: 'assistant-2',
        parts: [{ type: 'text' as const, text: 'Answer' }],
      };
      const messages = [toolMessage, trailingMessage];
      const tools = {
        test_tool: {
          layoutComponent: ({
            context,
          }: {
            context: { maximized?: boolean };
          }) => (
            <span data-testid="tool-maximized">
              {String(context.maximized)}
            </span>
          ),
          addToolResult: jest.fn(),
          onToolCall: jest.fn(),
          applyFilters: jest.fn(),
        },
      };
      const createProps = (maximized: boolean) => ({
        messages,
        indexUiState: {},
        setIndexUiState: jest.fn(),
        tools,
        maximized,
        onReload: jest.fn(),
        onClose: jest.fn(),
      });

      const { rerender } = render(
        <MemoizedChatMessages {...createProps(false)} />
      );
      expect(screen.getByTestId('tool-maximized')).toHaveTextContent('false');

      rerender(<MemoizedChatMessages {...createProps(true)} />);

      expect(screen.getByTestId('tool-maximized')).toHaveTextContent('true');
    });

    test('keeps the ordered conversation current for completed messages', () => {
      const firstMessage = {
        role: 'assistant' as const,
        id: 'assistant-1',
        parts: [{ type: 'text' as const, text: 'First answer' }],
      };
      const secondMessage = {
        role: 'assistant' as const,
        id: 'assistant-2',
        parts: [{ type: 'text' as const, text: 'Second answer' }],
      };
      const thirdMessage = {
        role: 'assistant' as const,
        id: 'assistant-3',
        parts: [{ type: 'text' as const, text: 'Third answer' }],
      };
      const textComponent = ({
        message,
        messages,
      }: ChatMessageTextComponentProps) => (
        <span data-testid={`conversation-length-${message.id}`}>
          {messages?.length}
        </span>
      );
      const createProps = (
        messages: Array<typeof firstMessage | typeof secondMessage>
      ) => ({
        messages,
        indexUiState: {},
        setIndexUiState: jest.fn(),
        assistantMessageProps: { textComponent },
        tools: {},
        onReload: jest.fn(),
        onClose: jest.fn(),
      });

      const { rerender } = render(
        <MemoizedChatMessages {...createProps([firstMessage, secondMessage])} />
      );
      expect(
        screen.getByTestId('conversation-length-assistant-1')
      ).toHaveTextContent('2');

      rerender(
        <MemoizedChatMessages
          {...createProps([firstMessage, secondMessage, thirdMessage])}
        />
      );

      expect(
        screen.getByTestId('conversation-length-assistant-1')
      ).toHaveTextContent('3');
      expect(
        screen.getByTestId('conversation-length-assistant-2')
      ).toHaveTextContent('3');
      expect(
        screen.getByTestId('conversation-length-assistant-3')
      ).toHaveTextContent('3');
    });

    test('keeps the conversation owned by ChatMessages', () => {
      const message = {
        role: 'assistant' as const,
        id: 'assistant-1',
        parts: [{ type: 'text' as const, text: 'Answer' }],
      };
      const messages = [message];
      const textComponent = ({
        messages: currentMessages,
      }: ChatMessageTextComponentProps) => (
        <span data-testid="conversation-id">{currentMessages?.[0].id}</span>
      );
      const createProps = (conversationId: string) => ({
        messages,
        indexUiState: {},
        setIndexUiState: jest.fn(),
        assistantMessageProps: {
          textComponent,
          messages: [
            {
              ...message,
              id: conversationId,
            },
          ],
        },
        tools: {},
        onReload: jest.fn(),
        onClose: jest.fn(),
      });

      const { rerender } = render(
        <MemoizedChatMessages {...createProps('override-a')} />
      );
      expect(screen.getByTestId('conversation-id')).toHaveTextContent(
        'assistant-1'
      );

      rerender(<MemoizedChatMessages {...createProps('override-b')} />);

      expect(screen.getByTestId('conversation-id')).toHaveTextContent(
        'assistant-1'
      );
    });
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

    test('switches completed messages between markdown and plain text', () => {
      const message = {
        role: 'user' as const,
        id: '1',
        parts: [{ type: 'text' as const, text: 'a *b* c' }],
      };
      const createProps = (parseMarkdown: boolean) => ({
        messages: [message],
        indexUiState: {},
        setIndexUiState: jest.fn(),
        userMessageProps: { parseMarkdown },
        tools: {},
        onReload: jest.fn(),
        onClose: jest.fn(),
      });

      const { container, rerender } = render(
        <MemoizedChatMessages {...createProps(true)} />
      );
      expect(container.querySelector('em')).not.toBeNull();

      rerender(<MemoizedChatMessages {...createProps(false)} />);

      expect(container.querySelector('em')).toBeNull();
      expect(container.querySelector('.ais-ChatMessage-text')).not.toBeNull();
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
      props: ChatComponentPropsWithContext<ChatMessageErrorProps>
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

  describe('loader visibility', () => {
    const baseProps = {
      indexUiState: {},
      setIndexUiState: jest.fn(),
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    };

    const pendingTool = {
      type: 'tool-some_tool' as const,
      toolCallId: '1',
      input: undefined,
      state: 'input-streaming' as const,
    };

    const assistant = (parts: any[]) => [
      { role: 'assistant' as const, id: '1', parts },
    ];

    const loader = (container: Element) =>
      container.querySelector('.ais-ChatMessageLoader');

    test('ignores a trailing data part after the answer', () => {
      // Renders nothing, so it must not bring the loader back.
      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={assistant([
            { type: 'text', text: 'Here you go.', state: 'done' },
            { type: 'data-suggestions', data: { suggestions: ['More?'] } },
          ])}
        />
      );

      expect(loader(container)).toBeNull();
    });

    test('keeps the loader while a text part has no content yet', () => {
      // `text-start` creates the part before the first delta.
      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={assistant([
            {
              type: 'tool-some_tool',
              toolCallId: '1',
              input: {},
              state: 'output-available',
              output: {},
            },
            { type: 'text', text: '', state: 'streaming' },
          ])}
        />
      );

      expect(loader(container)).not.toBeNull();
    });

    test('sets aria-busy while loading', () => {
      const { container } = render(
        <ChatMessages {...baseProps} status="submitted" messages={[]} />
      );

      expect(container.querySelector('[role="log"]')).toHaveAttribute(
        'aria-busy',
        'true'
      );
    });

    test('keeps aria-busy set while a suppressed loader hides progress', () => {
      // The log keeps updating even when the loader is overridden away, so the
      // busy state follows the turn rather than the loader.
      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={assistant([pendingTool])}
          shouldShowLoader={() => false}
        />
      );

      expect(loader(container)).toBeNull();
      expect(container.querySelector('[role="log"]')).toHaveAttribute(
        'aria-busy',
        'true'
      );
    });

    describe('with timers', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      // Arms the delay; the turn's first loader is always immediate.
      function renderAfterFirstCycle() {
        const utils = render(
          <ChatMessages {...baseProps} status="streaming" messages={[]} />
        );

        expect(loader(utils.container)).not.toBeNull();

        utils.rerender(
          <ChatMessages
            {...baseProps}
            status="streaming"
            messages={assistant([
              { type: 'text', text: 'Working on it.', state: 'done' },
            ])}
          />
        );
        act(() => {
          jest.advanceTimersByTime(200);
        });

        expect(loader(utils.container)).toBeNull();

        return utils;
      }

      test('holds the loader briefly so it cannot flash', () => {
        const { container, rerender } = render(
          <ChatMessages {...baseProps} status="submitted" messages={[]} />
        );

        expect(loader(container)).not.toBeNull();

        // Without the hold this is a one-frame flash.
        rerender(
          <ChatMessages
            {...baseProps}
            status="streaming"
            messages={assistant([
              { type: 'text', text: 'H', state: 'streaming' },
            ])}
          />
        );

        expect(loader(container)).not.toBeNull();

        act(() => {
          jest.advanceTimersByTime(200);
        });

        expect(loader(container)).toBeNull();
      });

      test('does not bring the loader back for a gap between steps', () => {
        const { container, rerender } = renderAfterFirstCycle();

        // All within the delay, so the loader never returns.
        rerender(
          <ChatMessages
            {...baseProps}
            status="streaming"
            messages={assistant([
              { type: 'text', text: 'Working on it.', state: 'done' },
              { type: 'step-start' },
              pendingTool,
            ])}
          />
        );

        expect(loader(container)).toBeNull();

        act(() => {
          jest.advanceTimersByTime(100);
        });
        rerender(
          <ChatMessages
            {...baseProps}
            status="streaming"
            messages={assistant([
              { type: 'text', text: 'Working on it.', state: 'done' },
              { type: 'step-start' },
              { ...pendingTool, state: 'output-available', output: {} },
              { type: 'text', text: 'Found it.', state: 'streaming' },
            ])}
          />
        );
        act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(loader(container)).toBeNull();
      });

      test('brings the loader back for a wait that lasts', () => {
        const { container, rerender } = renderAfterFirstCycle();

        rerender(
          <ChatMessages
            {...baseProps}
            status="streaming"
            messages={assistant([
              { type: 'text', text: 'Working on it.', state: 'done' },
              pendingTool,
            ])}
          />
        );

        expect(loader(container)).toBeNull();

        act(() => {
          jest.advanceTimersByTime(250);
        });

        expect(loader(container)).not.toBeNull();
      });

      test("starts the next turn's loader immediately", () => {
        const answer = {
          role: 'assistant' as const,
          id: '1',
          parts: [
            { type: 'text' as const, text: 'Done.', state: 'done' as const },
          ],
        };

        // The loader is still up when the turn ends, so the turn's end is what
        // hides it. That hide must not arm the delay for the next turn.
        const { container, rerender } = render(
          <ChatMessages {...baseProps} status="submitted" messages={[]} />
        );

        expect(loader(container)).not.toBeNull();

        rerender(
          <ChatMessages {...baseProps} status="ready" messages={[answer]} />
        );

        expect(loader(container)).toBeNull();

        rerender(
          <ChatMessages
            {...baseProps}
            status="submitted"
            messages={[
              answer,
              {
                role: 'user' as const,
                id: '2',
                parts: [{ type: 'text' as const, text: 'More?' }],
              },
            ]}
          />
        );

        expect(loader(container)).not.toBeNull();
      });

      test('hides the loader as soon as the turn ends', () => {
        const { container, rerender } = render(
          <ChatMessages {...baseProps} status="submitted" messages={[]} />
        );

        expect(loader(container)).not.toBeNull();

        rerender(
          <ChatMessages
            {...baseProps}
            status="ready"
            messages={assistant([{ type: 'text', text: 'Done.' }])}
          />
        );

        expect(loader(container)).toBeNull();
      });
    });
  });

  describe('loader customization', () => {
    const baseProps = {
      indexUiState: {},
      setIndexUiState: jest.fn(),
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    };

    const searchingMessages = [
      {
        role: 'assistant' as const,
        id: '1',
        parts: [
          {
            type: 'tool-some_tool' as const,
            toolCallId: '1',
            input: undefined,
            state: 'input-streaming' as const,
          },
        ],
      },
    ];

    test('leaves the loader message unset while the turn has none', () => {
      const LoaderComponent = jest.fn(() => <span>Loading</span>);

      // `submitted` still shows the user's own message, which the loader does
      // not belong to.
      render(
        <ChatMessages
          {...baseProps}
          status="submitted"
          messages={[
            {
              role: 'user' as const,
              id: '1',
              parts: [{ type: 'text' as const, text: 'Hi' }],
            },
          ]}
          loaderComponent={LoaderComponent}
        />
      );

      expect(LoaderComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            phase: 'submitted',
            message: undefined,
          }),
        }),
        {}
      );
    });

    test('passes the turn context to a custom loader', () => {
      const LoaderComponent = jest.fn(() => <span>Loading</span>);

      render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={searchingMessages}
          loaderComponent={LoaderComponent}
        />
      );

      expect(LoaderComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            status: 'streaming',
            phase: 'tool',
            message: searchingMessages[0],
            messages: searchingMessages,
          }),
        }),
        {}
      );
    });

    test('resolves loaderText against the turn context', () => {
      render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={searchingMessages}
          translations={{
            loaderText: ({ phase }) =>
              phase === 'tool' ? 'Searching…' : 'Thinking…',
          }}
        />
      );

      expect(screen.getByText('Searching…')).toBeInTheDocument();
    });

    test('lets shouldShowLoader narrow the built-in decision', () => {
      const shouldShowLoader = jest.fn(({ defaultValue, phase }) => {
        return defaultValue && phase !== 'tool';
      });

      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={searchingMessages}
          shouldShowLoader={shouldShowLoader}
        />
      );

      expect(shouldShowLoader).toHaveBeenCalledWith(
        expect.objectContaining({ defaultValue: true, phase: 'tool' })
      );
      expect(container.querySelector('.ais-ChatMessageLoader')).toBeNull();
    });

    test('renders the loader inside the streaming message when inline', () => {
      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={searchingMessages}
          loaderPosition="message-inline"
        />
      );

      const message = container.querySelector('.ais-ChatMessage-message')!;

      expect(
        message.querySelector('.ais-ChatMessageLoader--inline')
      ).not.toBeNull();
      expect(container.querySelectorAll('.ais-ChatMessageLoader')).toHaveLength(
        1
      );
    });

    test('falls back to its own row when there is no message to host it', () => {
      // Right after submitting there is no assistant message to host it.
      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="submitted"
          messages={[{ role: 'user', id: '1', parts: [] }]}
          loaderPosition="message-inline"
        />
      );

      expect(
        container.querySelector('.ais-ChatMessageLoader--inline')
      ).toBeNull();
      expect(container.querySelector('.ais-ChatMessageLoader')).not.toBeNull();
    });
  });

  describe('pending suggestions', () => {
    const baseProps = {
      indexUiState: {},
      setIndexUiState: jest.fn(),
      tools: {},
      onReload: jest.fn(),
      onClose: jest.fn(),
    };

    const answered = [
      {
        role: 'assistant' as const,
        id: '1',
        parts: [
          {
            type: 'text' as const,
            text: 'Here you go.',
            state: 'done' as const,
          },
        ],
      },
    ];

    test('mounts the suggestions element before the turn settles', () => {
      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={answered}
          suggestionsLoading
          suggestionsElement={<span className="suggestions" />}
        />
      );

      expect(container.querySelector('.suggestions')).not.toBeNull();
    });

    test('waits for the answer to have text', () => {
      const { container } = render(
        <ChatMessages
          {...baseProps}
          status="streaming"
          messages={[{ role: 'assistant', id: '1', parts: [] }]}
          suggestionsLoading
          suggestionsElement={<span className="suggestions" />}
        />
      );

      expect(container.querySelector('.suggestions')).toBeNull();
    });
  });

  test('forwards context to overridable components', () => {
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
        context: expect.objectContaining({
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

  test('clears activePart once the response settles', () => {
    const Message = jest.fn(() => <span>Message</span>);
    const messages = [
      {
        role: 'assistant' as const,
        id: '1',
        parts: [{ type: 'text' as const, text: 'Done' }],
      },
    ];

    render(
      <ChatMessages
        messages={messages}
        status="ready"
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        messageComponent={Message}
      />
    );

    expect(Message).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          status: 'ready',
          activePart: undefined,
        }),
      }),
      {}
    );
  });

  test('leaves activePart unset until the assistant produces a part', () => {
    const Message = jest.fn(() => <span>Message</span>);
    const messages = [
      {
        role: 'user' as const,
        id: '1',
        parts: [{ type: 'text' as const, text: 'Find me shoes' }],
      },
    ];

    render(
      <ChatMessages
        messages={messages}
        status="submitted"
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={jest.fn()}
        messageComponent={Message}
      />
    );

    expect(Message).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          status: 'submitted',
          activePart: undefined,
        }),
      }),
      {}
    );
  });

  test('still passes the pre-`context` root props to a custom empty component', () => {
    const Empty = jest.fn(() => <span>Empty</span>);
    const onClose = jest.fn();
    const sendMessage = jest.fn();
    const setInput = jest.fn();

    render(
      <ChatMessages
        messages={[]}
        status="ready"
        indexUiState={{}}
        setIndexUiState={jest.fn()}
        tools={{}}
        onReload={jest.fn()}
        onClose={onClose}
        sendMessage={sendMessage}
        setInput={setInput}
        emptyComponent={Empty}
      />
    );

    // An empty/greeting component written against the previous API reads these
    // from the root rather than from `context`.
    expect(Empty).toHaveBeenCalledWith(
      expect.objectContaining({
        sendMessage,
        setInput,
        status: 'ready',
        onClose,
        context: expect.objectContaining({ status: 'ready' }),
      }),
      {}
    );
  });
});
