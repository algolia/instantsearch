/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render, screen } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatPromptSuggestionsComponent } from '../ChatPromptSuggestions';

const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
  createElement,
  Fragment,
});

describe('ChatPromptSuggestions', () => {
  test('renders the suggestions', () => {
    render(
      <ChatPromptSuggestions
        suggestions={['Cheaper options?', 'In stock?']}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(screen.getByText('Cheaper options?')).toBeInTheDocument();
    expect(screen.getByText('In stock?')).toBeInTheDocument();
  });

  test('renders nothing without suggestions', () => {
    const { container } = render(
      <ChatPromptSuggestions suggestions={[]} onSuggestionClick={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('ignores blank suggestions', () => {
    const { container } = render(
      <ChatPromptSuggestions
        suggestions={['', '  ']}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
