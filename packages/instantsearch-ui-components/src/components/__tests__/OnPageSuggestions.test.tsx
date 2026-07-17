/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { Fragment, createElement } from 'preact';

import { createOnPageSuggestionsComponent } from '../chat/OnPageSuggestions';

describe('OnPageSuggestions', () => {
  const OnPageSuggestions = createOnPageSuggestionsComponent({
    createElement,
    Fragment,
  });

  test('renders an empty root when there are no suggestions and not loading', () => {
    const { container } = render(
      <OnPageSuggestions suggestions={[]} onSuggestionClick={jest.fn()} />
    );

    const root = container.querySelector('.ais-OnPageSuggestions');
    expect(root).toBeInTheDocument();
    expect(root).toBeEmptyDOMElement();
    expect(
      container.querySelector('.ais-OnPageSuggestions-skeleton')
    ).not.toBeInTheDocument();
  });

  test('forwards HTML attributes and merges className onto the root', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={[]}
        onSuggestionClick={jest.fn()}
        className="CUSTOM"
        title="hello"
      />
    );

    const root = container.querySelector<HTMLDivElement>(
      '.ais-OnPageSuggestions'
    )!;
    expect(root.classList.contains('CUSTOM')).toBe(true);
    expect(root.title).toBe('hello');
  });

  test('renders the default header when there are suggestions', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={['A', 'B']}
        onSuggestionClick={jest.fn()}
      />
    );

    const header = container.querySelector('.ais-OnPageSuggestions-header');
    expect(header).toBeInTheDocument();
    expect(
      container.querySelector('.ais-OnPageSuggestions-headerTitle')
    ).toHaveTextContent('Suggestions');
  });

  test('translates the header title', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={['A']}
        translations={{ headerTitle: 'Ideas' }}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelector('.ais-OnPageSuggestions-headerTitle')
    ).toHaveTextContent('Ideas');
  });

  test('renders the default header while loading', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={[]}
        isLoading={true}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelector('.ais-OnPageSuggestions-header')
    ).toBeInTheDocument();
  });

  test('does not render the header when empty and not loading', () => {
    const { container } = render(
      <OnPageSuggestions suggestions={[]} onSuggestionClick={jest.fn()} />
    );

    expect(
      container.querySelector('.ais-OnPageSuggestions-header')
    ).not.toBeInTheDocument();
  });

  test('disables the header when headerComponent is false', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={['A']}
        headerComponent={false}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelector('.ais-OnPageSuggestions-header')
    ).not.toBeInTheDocument();
    expect(
      container.querySelectorAll('.ais-OnPageSuggestions-suggestion')
    ).toHaveLength(1);
  });

  test('renders a custom header component', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={['A']}
        headerComponent={() => <div className="custom-header">Custom</div>}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelector('.ais-OnPageSuggestions-header')
    ).not.toBeInTheDocument();
    const custom = container.querySelector('.custom-header');
    expect(custom).toBeInTheDocument();
    expect(custom).toHaveTextContent('Custom');
  });

  test('renders the suggestion pills', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={['A', 'B']}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelectorAll('.ais-OnPageSuggestions-suggestion')
    ).toHaveLength(2);
    expect(
      container.querySelector('.ais-OnPageSuggestions-skeleton')
    ).not.toBeInTheDocument();
  });

  test('renders skeletons while loading with no suggestions yet', () => {
    const { container } = render(
      <OnPageSuggestions
        suggestions={[]}
        isLoading={true}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelector('.ais-OnPageSuggestions-skeleton')
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('.ais-OnPageSuggestions-skeletonItem')
    ).toHaveLength(3);
  });

  test('keeps existing pills (no skeletons) while refetching', () => {
    // Loading with suggestions already present must not swap the pills for
    // skeletons — that would make existing suggestions disappear mid-refetch.
    const { container } = render(
      <OnPageSuggestions
        suggestions={['A', 'B']}
        isLoading={true}
        onSuggestionClick={jest.fn()}
      />
    );

    expect(
      container.querySelectorAll('.ais-OnPageSuggestions-suggestion')
    ).toHaveLength(2);
    expect(
      container.querySelector('.ais-OnPageSuggestions-skeleton')
    ).not.toBeInTheDocument();
  });
});
