/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatMessageReasoningComponent } from '../ChatMessageReasoning';

import type { ChatMessageBase } from '../types';

const ChatMessageReasoning = createChatMessageReasoningComponent({
  createElement,
  Fragment,
});

function messageWith(
  parts: ChatMessageBase['parts'],
  overrides: Partial<ChatMessageBase> = {}
): ChatMessageBase {
  return { id: '1', role: 'assistant', parts, ...overrides };
}

describe('ChatMessageReasoning', () => {
  test('renders nothing when there are no reasoning parts', () => {
    const { container } = render(
      <ChatMessageReasoning message={messageWith([])} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when visibility is hidden', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'thinking' }])}
        visibility="hidden"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders a collapsible disclosure with the default "Reasoning" title', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'comparing options' }])}
      />
    );
    const details = container.querySelector('details.ais-ChatMessageReasoning');
    expect(details).toBeInTheDocument();
    // Collapsed by default.
    expect(details).not.toHaveAttribute('open');
    expect(
      container.querySelector('.ais-ChatMessageReasoning-label')
    ).toHaveTextContent('Reasoning');
    // Brain icon is present.
    expect(
      container.querySelector('.ais-ChatMessageReasoning-icon svg')
    ).toBeInTheDocument();
  });

  test('renders the raw reasoning body text', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([
          { type: 'reasoning', text: 'comparing the options' },
        ])}
      />
    );
    expect(
      container.querySelector('.ais-ChatMessageReasoning-text')
    ).toHaveTextContent('comparing the options');
  });

  test('is open when visibility is expanded', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'hello' }])}
        visibility="expanded"
      />
    );
    expect(
      container.querySelector('.ais-ChatMessageReasoning')
    ).toHaveAttribute('open');
  });

  test('is open while streaming under the auto strategy', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([
          { type: 'reasoning', text: 'hello', state: 'streaming' },
        ])}
        visibility="auto"
      />
    );
    const details = container.querySelector('.ais-ChatMessageReasoning');
    expect(details).toHaveAttribute('open');
    expect(details).toHaveClass('ais-ChatMessageReasoning--streaming');
  });

  test('accepts injectable title and toggle label', () => {
    const { container, getByLabelText } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'thinking' }])}
        translations={{
          title: 'Raisonnement',
          toggleLabel: 'Basculer le raisonnement',
        }}
      />
    );
    expect(
      container.querySelector('.ais-ChatMessageReasoning-label')
    ).toHaveTextContent('Raisonnement');
    expect(getByLabelText('Basculer le raisonnement')).toBeInTheDocument();
  });

  test('applies injectable class names', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'hello' }])}
        classNames={{ root: 'my-root', text: 'my-text' }}
      />
    );
    expect(container.querySelector('.my-root')).toBeInTheDocument();
    expect(container.querySelector('.my-text')).toBeInTheDocument();
  });
});
