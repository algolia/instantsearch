/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { createResultCardComponent } from '../ResultCard';

import type { ResultCardOwnProps } from '../ResultCard';
import type { ChatMessageBase } from '../types';

const ResultCard = createResultCardComponent({
  createElement,
  Fragment,
  useState,
  useEffect,
});

const userMessage: ChatMessageBase = {
  id: 'u1',
  role: 'user',
  parts: [{ type: 'text', text: 'running shoes' }],
};
const assistantMessage: ChatMessageBase = {
  id: 'a1',
  role: 'assistant',
  parts: [{ type: 'text', text: 'Pick the Pegasus for daily runs.' }],
};

function createProps(
  overrides: Partial<ResultCardOwnProps> = {}
): ResultCardOwnProps {
  return {
    status: 'complete',
    messages: [userMessage, assistantMessage],
    tools: {},
    indexUiState: {},
    setIndexUiState: jest.fn(),
    onDismiss: jest.fn(),
    onRetry: jest.fn(),
    canContinueInChat: true,
    onContinueInChat: jest.fn(),
    expanded: false,
    onExpandedChange: jest.fn(),
    ...overrides,
  };
}

describe('ResultCard', () => {
  test('renders nothing when hidden or dismissed', () => {
    const { container, rerender } = render(
      <ResultCard {...createProps({ status: 'hidden' })} />
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<ResultCard {...createProps({ status: 'dismissed' })} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the answer with the header and handoff action', () => {
    const { container } = render(<ResultCard {...createProps()} />);

    expect(container.querySelector('.ais-ResultCard')).toHaveAttribute(
      'aria-live',
      'polite'
    );
    expect(container.querySelector('.ais-ResultCard')).not.toHaveAttribute(
      'aria-busy'
    );
    expect(screen.getByText('AI Overview')).toBeInTheDocument();
    expect(
      screen.getByText('Pick the Pegasus for daily runs.')
    ).toBeInTheDocument();
    expect(screen.queryByText('running shoes')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue in chat' })
    ).toBeInTheDocument();
  });

  test('shows a loader while busy and marks the region busy', () => {
    const { container } = render(
      <ResultCard {...createProps({ status: 'loading', messages: [] })} />
    );

    expect(container.querySelector('.ais-ResultCard')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(
      container.querySelector('.ais-ResultCard-loader')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue in chat' })
    ).not.toBeInTheDocument();
  });

  test('hides reasoning and keeps the loader until the answer text starts', () => {
    const reasoning: ChatMessageBase = {
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'reasoning', text: 'Comparing the top hits.' },
        {
          type: 'tool-algolia_search_index_products',
          toolCallId: 'call-1',
          state: 'output-available',
          input: {},
          output: {},
        },
      ],
    };
    const { container, rerender } = render(
      <ResultCard
        {...createProps({
          status: 'streaming',
          messages: [userMessage, reasoning],
        })}
      />
    );

    expect(
      container.querySelector('.ais-ResultCard-loader')
    ).toBeInTheDocument();
    expect(screen.queryByText('Reasoning')).not.toBeInTheDocument();

    rerender(
      <ResultCard
        {...createProps({
          status: 'complete',
          messages: [
            userMessage,
            {
              ...reasoning,
              parts: [...reasoning.parts, ...assistantMessage.parts],
            },
          ],
        })}
      />
    );

    expect(
      screen.getByText('Pick the Pegasus for daily runs.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Reasoning')).not.toBeInTheDocument();
    expect(
      container.querySelector('.ais-ResultCard-loader')
    ).not.toBeInTheDocument();
  });

  test('renders nothing when the completed answer has no text', () => {
    const toolOnly: ChatMessageBase = {
      id: 'a1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index_products',
          toolCallId: 'call-1',
          state: 'output-available',
          input: {},
          output: {},
        },
      ],
    };
    const { container } = render(
      <ResultCard
        {...createProps({
          status: 'complete',
          messages: [userMessage, toolOnly],
        })}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('renders the streamed text before completion', () => {
    render(<ResultCard {...createProps({ status: 'streaming' })} />);

    expect(
      screen.getByText('Pick the Pegasus for daily runs.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue in chat' })
    ).not.toBeInTheDocument();
  });

  test('renders the error with a retry button', async () => {
    const onRetry = jest.fn();
    render(
      <ResultCard
        {...createProps({
          status: 'failed',
          messages: [userMessage],
          error: new Error('boom'),
          onRetry,
        })}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  describe('dismiss', () => {
    const originalMatchMedia = window.matchMedia;
    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    const mockReducedMotion = (matches: boolean) => {
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)' && matches,
      }));
    };

    // jsdom has no `TransitionEvent`: a plain event with `propertyName` set.
    const transitionEnd = (element: Element, propertyName = 'opacity') => {
      const event = new Event('transitionend', { bubbles: true });
      Object.defineProperty(event, 'propertyName', { value: propertyName });
      fireEvent(element, event);
    };

    test('fades out, then commits when the opacity transition ends', async () => {
      mockReducedMotion(false);
      const onDismiss = jest.fn();
      const { container } = render(
        <ResultCard {...createProps({ onDismiss })} />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      const card = container.querySelector('.ais-ResultCard')!;
      expect(card).toHaveClass('ais-ResultCard--leaving');
      expect(onDismiss).not.toHaveBeenCalled();

      // Children fade in with their own transitions; only the card's counts.
      transitionEnd(container.querySelector('.ais-ResultCard-message')!);
      transitionEnd(card, 'max-height');
      expect(onDismiss).not.toHaveBeenCalled();

      transitionEnd(card);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    test('commits immediately when the user prefers reduced motion', async () => {
      mockReducedMotion(true);
      const onDismiss = jest.fn();
      const { container } = render(
        <ResultCard {...createProps({ onDismiss })} />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(container.querySelector('.ais-ResultCard')).not.toHaveClass(
        'ais-ResultCard--leaving'
      );
    });

    test('commits on its own when no opacity transition ends', async () => {
      mockReducedMotion(false);
      const onDismiss = jest.fn();
      render(<ResultCard {...createProps({ onDismiss })} />);

      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(onDismiss).not.toHaveBeenCalled();

      await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1), {
        timeout: 1500,
      });
    });
  });

  test('hands off to the chat, with or without a follow-up', async () => {
    const onContinueInChat = jest.fn();
    render(
      <ResultCard
        {...createProps({
          onContinueInChat,
          suggestions: ['Which one is waterproof?'],
        })}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Continue in chat' })
    );
    expect(onContinueInChat).toHaveBeenLastCalledWith();

    await userEvent.click(
      screen.getByRole('button', { name: 'Which one is waterproof?' })
    );
    expect(onContinueInChat).toHaveBeenLastCalledWith(
      'Which one is waterproof?'
    );
  });

  test('shows at most two suggestions', () => {
    render(
      <ResultCard
        {...createProps({
          suggestions: ['First?', 'Second?', 'Third?'],
        })}
      />
    );

    expect(screen.getByRole('button', { name: 'First?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Second?' })).toBeInTheDocument();
    expect(screen.queryByText('Third?')).not.toBeInTheDocument();
  });

  test('hides the handoff and suggestions without a matching chat', () => {
    render(
      <ResultCard
        {...createProps({
          canContinueInChat: false,
          suggestions: ['Which one is waterproof?'],
        })}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Continue in chat' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Which one is waterproof?')
    ).not.toBeInTheDocument();
  });

  describe('clipped answer', () => {
    // jsdom has no layout: fake a body taller than its clipped height.
    beforeEach(() => {
      jest
        .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
        .mockReturnValue(400);
      jest
        .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
        .mockReturnValue(200);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('offers to expand', async () => {
      const onExpandedChange = jest.fn();
      const { container, rerender } = render(
        <ResultCard {...createProps({ onExpandedChange })} />
      );
      const body = container.querySelector('.ais-ResultCard-body')!;
      expect(body).toHaveClass('ais-ResultCard-body--clipped');

      await userEvent.click(screen.getByRole('button', { name: 'Show more' }));
      expect(onExpandedChange).toHaveBeenCalledWith(true);

      rerender(
        <ResultCard {...createProps({ onExpandedChange, expanded: true })} />
      );
      expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      // The measured height lets `max-height` transition instead of jumping.
      expect(body).not.toHaveClass('ais-ResultCard-body--clipped');
      expect(body).toHaveStyle({ maxHeight: '400px' });
    });

    test('expands when focus reaches its content', () => {
      const onExpandedChange = jest.fn();
      render(
        <ResultCard
          {...createProps({
            onExpandedChange,
            messages: [
              userMessage,
              {
                ...assistantMessage,
                parts: [
                  {
                    type: 'text',
                    text: 'See the [sizing guide](https://example.com/sizing).',
                  },
                ],
              },
            ],
          })}
        />
      );

      screen.getByRole('link', { name: 'sizing guide' }).focus();
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });

    test('hides the suggestions until expanded', () => {
      const { rerender } = render(
        <ResultCard {...createProps({ suggestions: ['Waterproof?'] })} />
      );
      expect(
        screen.queryByRole('button', { name: 'Waterproof?' })
      ).not.toBeInTheDocument();

      rerender(
        <ResultCard
          {...createProps({ suggestions: ['Waterproof?'], expanded: true })}
        />
      );
      expect(
        screen.getByRole('button', { name: 'Waterproof?' })
      ).toBeInTheDocument();
    });
  });

  test('does not offer to expand a short answer', () => {
    render(<ResultCard {...createProps()} />);

    expect(
      screen.queryByRole('button', { name: 'Show more' })
    ).not.toBeInTheDocument();
  });

  test('applies translations and class names', () => {
    const { container } = render(
      <ResultCard
        {...createProps()}
        translations={{
          headerTitle: 'Aperçu',
          continueInChatText: 'Continuer',
        }}
        classNames={{
          root: 'ROOT',
          header: 'HEADER',
          continueButton: 'CONTINUE',
        }}
      />
    );

    expect(container.querySelector('.ais-ResultCard')).toHaveClass('ROOT');
    expect(container.querySelector('.ais-ResultCard-header')).toHaveClass(
      'HEADER'
    );
    expect(screen.getByText('Aperçu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuer' })).toHaveClass(
      'CONTINUE'
    );
  });
});
