/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createChatPromptSuggestionsComponent } from '../chat/ChatPromptSuggestions';

describe('ChatPromptSuggestions', () => {
  const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
    createElement,
    Fragment,
  });

  test('renders nothing when there are no suggestions and not loading', () => {
    const { container } = render(
      <ChatPromptSuggestions suggestions={[]} onSuggestionClick={jest.fn()} />
    );

    expect(
      container.querySelector('.ais-ChatPromptSuggestions')
    ).not.toBeInTheDocument();
  });

  test('renders the suggestion pills', () => {
    const { container } = render(
      <ChatPromptSuggestions
        suggestions={['A', 'B']}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelectorAll('.ais-ChatPromptSuggestions-suggestion')
    ).toHaveLength(2);
    expect(
      container.querySelector('.ais-ChatPromptSuggestions-skeleton')
    ).not.toBeInTheDocument();
  });

  test('renders skeletons while loading with no suggestions yet', () => {
    const { container } = render(
      <ChatPromptSuggestions
        suggestions={[]}
        isLoading={true}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelector('.ais-ChatPromptSuggestions-skeleton')
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('.ais-ChatPromptSuggestions-skeletonItem')
    ).toHaveLength(3);
  });

  test('keeps existing pills (no skeletons) while refetching', () => {
    // Loading with suggestions already present must not swap the pills for
    // skeletons — that would make existing suggestions disappear mid-refetch.
    const { container } = render(
      <ChatPromptSuggestions
        suggestions={['A', 'B']}
        isLoading={true}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelectorAll('.ais-ChatPromptSuggestions-suggestion')
    ).toHaveLength(2);
    expect(
      container.querySelector('.ais-ChatPromptSuggestions-skeleton')
    ).not.toBeInTheDocument();
  });
});
