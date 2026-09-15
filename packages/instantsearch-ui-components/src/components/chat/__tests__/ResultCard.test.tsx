/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render, screen } from '@testing-library/preact';
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
      container.querySelector('.ais-ChatMessageLoader--inline')
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
      container.querySelector('.ais-ChatMessageLoader--inline')
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
      container.querySelector('.ais-ChatMessageLoader--inline')
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

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('dismisses', async () => {
    const onDismiss = jest.fn();
    render(<ResultCard {...createProps({ onDismiss })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
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

  test('offers to expand a clipped answer', async () => {
    const onExpandedChange = jest.fn();
    // jsdom has no layout: fake a body taller than its clipped height.
    const scrollHeight = jest
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockReturnValue(400);
    const clientHeight = jest
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockReturnValue(200);

    const { rerender } = render(
      <ResultCard {...createProps({ onExpandedChange })} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Show more' }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    rerender(
      <ResultCard {...createProps({ onExpandedChange, expanded: true })} />
    );
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    scrollHeight.mockRestore();
    clientHeight.mockRestore();
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
