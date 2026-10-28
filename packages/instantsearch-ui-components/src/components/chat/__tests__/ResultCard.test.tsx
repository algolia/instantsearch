/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { act, fireEvent, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement, render as renderWithoutAct } from 'preact';
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

// Lets the deferred expansion on the first overflow run.
const flushExpansion = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

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
    onRetry: jest.fn(),
    minimized: false,
    onToggleMinimize: jest.fn(),
    canContinueInChat: true,
    onContinueInChat: jest.fn(),
    expanded: false,
    onExpandedChange: jest.fn(),
    ...overrides,
  };
}

describe('ResultCard', () => {
  test('renders nothing when hidden', () => {
    const { container } = render(
      <ResultCard {...createProps({ status: 'hidden' })} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the answer with the header and handoff action', () => {
    const { container } = render(<ResultCard {...createProps()} />);

    expect(container.querySelector('.ais-ResultCard')).not.toHaveAttribute(
      'aria-live'
    );
    expect(container.querySelector('[aria-busy]')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Answer ready');
    expect(screen.getByText('AI Overview')).toBeInTheDocument();
    expect(
      screen.getByText('Pick the Pegasus for daily runs.')
    ).toBeInTheDocument();
    expect(screen.queryByText('running shoes')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue in chat' })
    ).toBeInTheDocument();
  });

  test('shows a loader while busy and marks the answer busy', () => {
    const { container } = render(
      <ResultCard {...createProps({ status: 'loading', messages: [] })} />
    );

    expect(container.querySelector('.ais-ResultCard-body')).toHaveAttribute(
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

  test('announces progress once in a status region, not each streamed chunk', () => {
    const { container, rerender } = render(
      <ResultCard {...createProps({ status: 'streaming' })} />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Generating answer');
    // A busy ancestor would defer the announcement until the answer is done.
    expect(status.closest('[aria-busy]')).toBeNull();
    expect(container.querySelector('.ais-ResultCard-body')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(container.querySelector('[aria-live="polite"]')).toBe(status);

    rerender(<ResultCard {...createProps({ status: 'complete' })} />);
    expect(screen.getByRole('status')).toHaveTextContent('Answer ready');
  });

  test('fills the status region after it mounts', async () => {
    // Without `act`, so effects stay pending right after the render.
    const container = document.createElement('div');
    renderWithoutAct(
      <ResultCard {...createProps({ status: 'hidden', messages: [] })} />,
      container
    );
    renderWithoutAct(
      <ResultCard {...createProps({ status: 'loading', messages: [] })} />,
      container
    );
    const status = container.querySelector('[role="status"]')!;
    expect(status.textContent).toBe('');

    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
    expect(status.textContent).toBe('Generating answer');
  });

  test('shows a loader while a tool runs, then the streamed text', () => {
    const toolCall: ChatMessageBase = {
      id: 'a1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index_products',
          toolCallId: 'call-1',
          state: 'input-available',
          input: {},
        },
      ],
    };
    const { container, rerender } = render(
      <ResultCard
        {...createProps({
          status: 'streaming',
          messages: [userMessage, toolCall],
        })}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageLoader--inline')
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ais-ChatMessageLoader-text')
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('.ais-ResultCard-loader')
    ).not.toBeInTheDocument();

    rerender(
      <ResultCard
        {...createProps({
          status: 'streaming',
          messages: [
            userMessage,
            {
              ...toolCall,
              parts: [...toolCall.parts, ...assistantMessage.parts],
            },
          ],
        })}
      />
    );

    expect(
      screen.getByText('Pick the Pegasus for daily runs.')
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ais-ChatMessageLoader')
    ).not.toBeInTheDocument();
  });

  test('keeps a failed tool call hidden while streaming', () => {
    const failedTool: ChatMessageBase = {
      id: 'a1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index_products',
          toolCallId: 'call-1',
          state: 'output-error',
          input: {},
          errorText: 'Search failed.',
        },
      ],
    };
    const { container } = render(
      <ResultCard
        {...createProps({
          status: 'streaming',
          messages: [userMessage, failedTool],
        })}
      />
    );

    expect(
      container.querySelector('.ais-ChatMessageLoader--inline')
    ).toBeInTheDocument();
    expect(screen.queryByText('Search failed.')).not.toBeInTheDocument();
  });

  test('hides reasoning and keeps the skeleton until the answer text starts', () => {
    const reasoning: ChatMessageBase = {
      id: 'a1',
      role: 'assistant',
      parts: [{ type: 'reasoning', text: 'Comparing the top hits.' }],
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

  test('renders only the answer text, not failed tool calls', () => {
    const withFailedTool: ChatMessageBase = {
      id: 'a1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index_products',
          toolCallId: 'call-1',
          state: 'output-error',
          input: {},
          errorText: 'Search failed.',
        },
        { type: 'text', text: 'Pick the Pegasus for daily runs.' },
      ],
    };
    const { container } = render(
      <ResultCard
        {...createProps({ messages: [userMessage, withFailedTool] })}
      />
    );

    expect(
      screen.getByText('Pick the Pegasus for daily runs.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Search failed.')).not.toBeInTheDocument();
    expect(
      container.querySelector('.ais-ChatMessage-toolError')
    ).not.toBeInTheDocument();
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

    const retry = screen.getByRole('button', { name: 'Retry' });
    expect(screen.getByRole('alert')).toContainElement(retry);
    await userEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('minimizes on click', async () => {
    const onToggleMinimize = jest.fn();
    render(<ResultCard {...createProps({ onToggleMinimize })} />);

    const toggle = screen.getByRole('button', { name: 'Minimize' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(toggle);
    expect(onToggleMinimize).toHaveBeenCalledTimes(1);
  });

  test('collapses to the header when minimized', async () => {
    const onToggleMinimize = jest.fn();
    const { container } = render(
      <ResultCard
        {...createProps({
          minimized: true,
          onToggleMinimize,
          suggestions: ['Which one is waterproof?'],
        })}
      />
    );

    expect(screen.getByText('AI Overview')).toBeInTheDocument();
    expect(
      container.querySelector('.ais-ResultCard-body')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue in chat' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Which one is waterproof?')
    ).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Maximize' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    expect(onToggleMinimize).toHaveBeenCalledTimes(1);
  });

  test('keeps showing progress in the header when minimized', () => {
    const { container } = render(
      <ResultCard {...createProps({ status: 'streaming', minimized: true })} />
    );

    // The theme pulses the header icon from `data-status`.
    expect(container.querySelector('.ais-ResultCard')).toHaveAttribute(
      'data-status',
      'streaming'
    );
    expect(screen.getByRole('status')).toHaveTextContent('Generating answer');
    expect(
      container.querySelector('.ais-ResultCard-body')
    ).not.toBeInTheDocument();
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

      // Ignore the expansion on the first overflow.
      await flushExpansion();
      onExpandedChange.mockClear();
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
      expect(body.getAttribute('style')).toContain(
        'min(400px, var(--ais-result-card-expanded-max-height))'
      );
    });

    test('offers to expand while streaming', () => {
      render(<ResultCard {...createProps({ status: 'streaming' })} />);

      expect(
        screen.getByRole('button', { name: 'Show more' })
      ).toBeInTheDocument();
    });

    test('lets the keyboard scroll the expanded answer', () => {
      const { container, rerender } = render(<ResultCard {...createProps()} />);
      const body = container.querySelector('.ais-ResultCard-body')!;
      expect(body).not.toHaveAttribute('tabindex');

      rerender(<ResultCard {...createProps({ expanded: true })} />);
      expect(screen.getByRole('region', { name: 'AI Overview' })).toBe(body);
      expect(body).toHaveAttribute('tabindex', '0');
    });

    test('scrolls the answer back to the top on "Show less"', async () => {
      const setScrollTop = jest.spyOn(Element.prototype, 'scrollTop', 'set');
      render(<ResultCard {...createProps({ expanded: true })} />);

      await userEvent.click(screen.getByRole('button', { name: 'Show less' }));
      expect(setScrollTop).toHaveBeenCalledWith(0);
    });

    test('names the answer it expands', () => {
      const { container } = render(<ResultCard {...createProps()} />);

      const body = container.querySelector('.ais-ResultCard-body')!;
      expect(body.id).not.toBe('');
      expect(screen.getByRole('button', { name: 'Show more' })).toHaveAttribute(
        'aria-controls',
        body.id
      );
    });

    test('keeps offering to expand when the answer finishes mid-collapse', async () => {
      const clientHeight = jest.spyOn(
        HTMLElement.prototype,
        'clientHeight',
        'get'
      );
      const { container, rerender } = render(
        <ResultCard {...createProps({ status: 'streaming', expanded: true })} />
      );
      const body = container.querySelector('.ais-ResultCard-body')!;

      // "Show less": the height is still at its expanded value, so nothing
      // looks clipped when the final status arrives.
      clientHeight.mockReturnValue(400);
      rerender(
        <ResultCard {...createProps({ status: 'complete', expanded: false })} />
      );

      // The transition ends at the clipped height.
      clientHeight.mockReturnValue(200);
      fireEvent.transitionEnd(body);
      expect(
        screen.getByRole('button', { name: 'Show more' })
      ).toBeInTheDocument();
    });

    test('stays collapsed after "Show less" on a retried answer', async () => {
      const onExpandedChange = jest.fn();
      const { container, rerender } = render(
        <ResultCard {...createProps({ expanded: true, onExpandedChange })} />
      );
      const body = container.querySelector('.ais-ResultCard-body')!;

      // Retry keeps the card expanded while the new answer streams in.
      rerender(
        <ResultCard
          {...createProps({
            expanded: true,
            onExpandedChange,
            status: 'loading',
            messages: [userMessage],
          })}
        />
      );
      rerender(
        <ResultCard
          {...createProps({
            expanded: true,
            onExpandedChange,
            status: 'streaming',
          })}
        />
      );
      await flushExpansion();

      rerender(<ResultCard {...createProps({ onExpandedChange })} />);
      fireEvent.transitionEnd(body);
      await flushExpansion();

      expect(onExpandedChange).not.toHaveBeenCalled();
    });

    test('expands once when the answer first outgrows the clipped height', async () => {
      const onExpandedChange = jest.fn();
      const longer: ChatMessageBase = {
        ...assistantMessage,
        parts: [{ type: 'text', text: 'Pick the Pegasus. It is light.' }],
      };
      const { rerender } = render(
        <ResultCard
          {...createProps({ status: 'streaming', onExpandedChange })}
        />
      );
      await flushExpansion();
      expect(onExpandedChange).toHaveBeenCalledTimes(1);
      expect(onExpandedChange).toHaveBeenCalledWith(true);

      // Still clipped, as after "Show less": more text does not expand it again.
      rerender(
        <ResultCard
          {...createProps({
            status: 'streaming',
            onExpandedChange,
            messages: [userMessage, longer],
          })}
        />
      );
      await flushExpansion();
      expect(onExpandedChange).toHaveBeenCalledTimes(1);

      // A new answer starts over.
      rerender(
        <ResultCard
          {...createProps({
            status: 'loading',
            onExpandedChange,
            messages: [],
          })}
        />
      );
      rerender(
        <ResultCard
          {...createProps({ status: 'streaming', onExpandedChange })}
        />
      );
      await flushExpansion();
      expect(onExpandedChange).toHaveBeenCalledTimes(2);
    });

    test('expands when focus reaches its content', async () => {
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

      // Ignore the expansion on the first overflow.
      await flushExpansion();
      onExpandedChange.mockClear();
      screen.getByRole('link', { name: 'sizing guide' }).focus();
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });

    test('measures the answer again when restored', () => {
      const { container, rerender } = render(
        <ResultCard {...createProps({ minimized: true })} />
      );
      expect(
        screen.queryByRole('button', { name: 'Show more' })
      ).not.toBeInTheDocument();

      rerender(<ResultCard {...createProps({ minimized: false })} />);
      expect(container.querySelector('.ais-ResultCard-body')).toHaveClass(
        'ais-ResultCard-body--clipped'
      );
      expect(
        screen.getByRole('button', { name: 'Show more' })
      ).toBeInTheDocument();
    });

    test('keeps a restored card at its previous size', async () => {
      const onExpandedChange = jest.fn();
      const { rerender } = render(
        <ResultCard {...createProps({ onExpandedChange })} />
      );
      await flushExpansion();
      // Expanded on the first overflow, then "Show less" (`expanded` stays
      // false): minimizing and restoring keeps it clipped.
      onExpandedChange.mockClear();
      rerender(
        <ResultCard {...createProps({ onExpandedChange, minimized: true })} />
      );
      rerender(<ResultCard {...createProps({ onExpandedChange })} />);
      await flushExpansion();

      expect(onExpandedChange).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: 'Show more' })
      ).toBeInTheDocument();
    });

    test('never clips the error, so Retry stays reachable', () => {
      const { container } = render(
        <ResultCard
          {...createProps({
            status: 'failed',
            messages: [userMessage],
            error: new Error('boom'),
          })}
        />
      );

      const body = container.querySelector('.ais-ResultCard-body')!;
      expect(body).not.toHaveClass('ais-ResultCard-body--clipped');
      expect(body).toHaveClass('ais-ResultCard-body--expanded');
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Show more' })
      ).not.toBeInTheDocument();
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

  test('neither expands nor offers to expand a short answer', async () => {
    const onExpandedChange = jest.fn();
    render(
      <ResultCard {...createProps({ status: 'streaming', onExpandedChange })} />
    );
    await flushExpansion();

    expect(
      screen.queryByRole('button', { name: 'Show more' })
    ).not.toBeInTheDocument();
    expect(onExpandedChange).not.toHaveBeenCalled();
    // Server renders never show the toggle, so they carry no ids to mismatch.
    expect(document.querySelector('.ais-ResultCard [id]')).toBeNull();
  });

  test('applies translations and class names', () => {
    const { container } = render(
      <ResultCard
        {...createProps()}
        translations={{
          headerTitle: 'Aperçu',
          continueInChatText: 'Continuer',
          minimizeLabel: 'Réduire',
        }}
        classNames={{
          root: 'ROOT',
          header: 'HEADER',
          continueButton: 'CONTINUE',
          minimizeButton: 'MINIMIZE',
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
    expect(screen.getByRole('button', { name: 'Réduire' })).toHaveClass(
      'MINIMIZE'
    );
  });
});
