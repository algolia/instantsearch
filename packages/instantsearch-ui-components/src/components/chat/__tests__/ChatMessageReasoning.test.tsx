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

  test('renders the reasoning body text', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([
          { type: 'reasoning', text: 'comparing the options' },
        ])}
        visibility="expanded"
      />
    );
    expect(
      container.querySelector('.ais-ChatMessageReasoning-text')
    ).toHaveTextContent('comparing the options');
  });

  test('accepts an injectable toggle label and elapsed time strings', () => {
    const { getByRole, getByText } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'thinking' }])}
        elapsedMs={2500}
        translations={{
          toggleLabel: 'Basculer le raisonnement',
          elapsedPrefix: 'Réflexion pendant',
          elapsedSuffix: 'secondes',
        }}
      />
    );
    expect(
      getByRole('button', { name: 'Basculer le raisonnement' })
    ).toBeInTheDocument();
    expect(getByText(/Réflexion pendant/)).toBeInTheDocument();
    expect(getByText(/secondes/)).toBeInTheDocument();
  });

  test('falls back to the injectable thinking label when the summarizer returns no label', () => {
    const { getByText } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'thinking' }])}
        summarizer={() => ({ label: '', category: 'thinking' })}
        translations={{ thinkingLabel: 'Réflexion en cours' }}
      />
    );
    expect(getByText('Réflexion en cours')).toBeInTheDocument();
  });

  test('applies injectable class names', () => {
    const { container } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'hello' }])}
        visibility="expanded"
        classNames={{ root: 'my-root', text: 'my-text' }}
      />
    );
    expect(container.querySelector('.my-root')).toBeInTheDocument();
    expect(container.querySelector('.my-text')).toBeInTheDocument();
  });

  test('redacts the body when the summarizer flags it', () => {
    const { getByText, queryByText } = render(
      <ChatMessageReasoning
        message={messageWith([
          {
            type: 'reasoning',
            text: 'the api_key is sk-01234567890123456789',
            state: 'streaming',
          },
        ])}
        visibility="expanded"
      />
    );
    expect(getByText('(reasoning redacted for privacy)')).toBeInTheDocument();
    expect(queryByText(/sk-01234567890123456789/)).not.toBeInTheDocument();
  });

  test('uses a custom summarizer when provided', () => {
    const summarizer = jest.fn(() => ({
      label: 'Custom label',
      category: 'thinking' as const,
    }));
    const { getByText } = render(
      <ChatMessageReasoning
        message={messageWith([{ type: 'reasoning', text: 'anything' }])}
        summarizer={summarizer}
      />
    );
    expect(summarizer).toHaveBeenCalled();
    expect(getByText('Custom label')).toBeInTheDocument();
  });
});
