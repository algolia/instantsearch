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

  test('renders placeholders while loading', () => {
    const { container } = render(
      <ChatPromptSuggestions
        suggestions={[]}
        isLoading
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelectorAll('.ais-ChatPromptSuggestions-skeletonItem')
    ).toHaveLength(3);
  });

  test('honors skeletonCount', () => {
    const { container } = render(
      <ChatPromptSuggestions
        suggestions={[]}
        isLoading
        skeletonCount={2}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelectorAll('.ais-ChatPromptSuggestions-skeletonItem')
    ).toHaveLength(2);
  });

  test('renders suggestions that arrive early but ignores clicks until loading finishes', () => {
    const onSuggestionClick = jest.fn();
    const { container } = render(
      <ChatPromptSuggestions
        suggestions={['Cheaper opt']}
        isLoading
        onSuggestionClick={onSuggestionClick}
      />
    );

    expect(
      container.querySelector('.ais-ChatPromptSuggestions-skeletonItem')
    ).toBeNull();

    screen.getByText('Cheaper opt').click();

    expect(onSuggestionClick).not.toHaveBeenCalled();
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
