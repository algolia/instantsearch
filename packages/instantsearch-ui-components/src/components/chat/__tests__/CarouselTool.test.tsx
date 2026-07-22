/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';

import { createCarouselToolComponent } from '../tools/CarouselTool';

import type { Pragma, RecordWithObjectID } from '../../../types';
import type { ChatToolMessage, ClientSideToolComponentProps } from '../types';

type Hit = RecordWithObjectID<{ name: string }>;
type InputHit = { objectID: string; name: string };

const CarouselTool = createCarouselToolComponent<Hit>({
  createElement: createElement as Pragma,
  Fragment,
  useMemo,
  useRef,
  useState,
});

type ItemComponentProps = NonNullable<
  Parameters<typeof CarouselTool>[0]['itemComponent']
>;
type ItemArgs = Parameters<ItemComponentProps>[0];

const ItemComponent: ItemComponentProps = ({ item }: ItemArgs) =>
  (
    <div className="hit" data-position={item.__position}>
      {item.name}
    </div>
  ) as JSX.Element;

function buildMessage(
  input: { query: string; number_of_results?: number },
  output: { hits?: InputHit[]; nbHits?: number; queryID?: string }
): ChatToolMessage {
  return {
    type: 'tool-algolia_search_index',
    toolCallId: 'call-1',
    state: 'output-available',
    input,
    output,
  } as ChatToolMessage;
}

function renderTool(
  message: ChatToolMessage,
  overrides: Partial<{
    showViewAll: boolean;
    applyFilters: ClientSideToolComponentProps['applyFilters'];
    onClose: () => void;
    getSearchPageURL: (params: any) => string;
  }> = {}
) {
  const applyFilters =
    overrides.applyFilters ?? (jest.fn(() => ({} as any)) as any);
  const onClose = overrides.onClose ?? jest.fn();

  function Wrapper() {
    return (
      <CarouselTool
        getSearchPageURL={overrides.getSearchPageURL}
        headerProps={{ showViewAll: overrides.showViewAll ?? false }}
        itemComponent={ItemComponent}
        toolProps={{
          message,
          indexUiState: {},
          setIndexUiState: jest.fn(),
          onClose,
          addToolResult: jest.fn(),
          applyFilters,
          sendEvent: jest.fn(),
        }}
      />
    );
  }

  return {
    ...render(<Wrapper />),
    applyFilters,
    onClose,
  };
}

function makeHits(count: number): InputHit[] {
  return Array.from({ length: count }, (_, i) => ({
    objectID: String(i + 1),
    name: `Item ${i + 1}`,
  }));
}

describe('CarouselTool', () => {
  test('renders no header when there are no hits', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: [], nbHits: 0 })
    );

    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeader')
    ).toBeNull();
    expect(container.querySelectorAll('.hit')).toHaveLength(0);
  });

  test('header count reflects rendered items, not input.number_of_results', () => {
    // Reviewer scenario: input requested 5 but the model only returned 2.
    // The header must show "2 of 100" — not "5 of 100".
    const { container } = renderTool(
      buildMessage(
        { query: 'tv', number_of_results: 5 },
        { hits: makeHits(2), nbHits: 100 }
      )
    );

    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeaderCount')
        ?.textContent
    ).toBe('2 of 100 results');
    expect(container.querySelectorAll('.hit')).toHaveLength(2);
  });

  test('header count when number_of_results is unset uses items.length', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: makeHits(3), nbHits: 42 })
    );

    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeaderCount')
        ?.textContent
    ).toBe('3 of 42 results');
  });

  test('singular "result" when nbHits is 1', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: makeHits(1), nbHits: 1 })
    );

    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeaderCount')
        ?.textContent
    ).toBe('1 of 1 result');
  });

  test('omits the count line when nbHits is missing', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: makeHits(2) })
    );

    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeader')
    ).not.toBeNull();
    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeaderCount')
    ).toBeNull();
  });

  test('hides scroll buttons when rendered items <= 2, even if number_of_results suggests more', () => {
    // Bug fix: previously hitsPerPage came from number_of_results, so scroll
    // buttons could show with only 2 rendered items.
    const { container } = renderTool(
      buildMessage(
        { query: 'tv', number_of_results: 10 },
        { hits: makeHits(2), nbHits: 100 }
      )
    );

    expect(
      container.querySelector(
        '.ais-ChatToolSearchIndexCarouselHeaderScrollButtons'
      )
    ).toBeNull();
  });

  test('shows scroll buttons when rendered items > 2', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: makeHits(3), nbHits: 100 })
    );

    const scrollButtons = container.querySelector(
      '.ais-ChatToolSearchIndexCarouselHeaderScrollButtons'
    );
    expect(scrollButtons).not.toBeNull();
    expect(
      scrollButtons?.querySelectorAll(
        '.ais-ChatToolSearchIndexCarouselHeaderScrollButton'
      )
    ).toHaveLength(2);
  });

  test('does not show "View all" when showViewAll is false', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: makeHits(2), nbHits: 100 }),
      { showViewAll: false }
    );

    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeaderViewAll')
    ).toBeNull();
  });

  test('shows "View all" when showViewAll is true', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: makeHits(2), nbHits: 100 }),
      { showViewAll: true }
    );

    expect(
      container.querySelector('.ais-ChatToolSearchIndexCarouselHeaderViewAll')
        ?.textContent
    ).toContain('View all');
  });

  test('annotates hits with __position (1-indexed)', () => {
    const { container } = renderTool(
      buildMessage({ query: 'tv' }, { hits: makeHits(3), nbHits: 100 })
    );

    const positions = Array.from(container.querySelectorAll('.hit')).map((el) =>
      el.getAttribute('data-position')
    );
    expect(positions).toEqual(['1', '2', '3']);
  });

  test('annotates hits with __queryID when output.queryID is present', () => {
    const seen: Array<Record<string, unknown>> = [];
    const SpyItem: ItemComponentProps = ({ item }: ItemArgs) => {
      seen.push(item as Record<string, unknown>);
      return (<div className="hit" />) as JSX.Element;
    };

    function Wrapper() {
      return (
        <CarouselTool
          headerProps={{ showViewAll: false }}
          itemComponent={SpyItem}
          toolProps={{
            message: buildMessage(
              { query: 'tv' },
              { hits: makeHits(2), nbHits: 100, queryID: 'abc' }
            ),
            indexUiState: {},
            setIndexUiState: jest.fn(),
            onClose: jest.fn(),
            addToolResult: jest.fn(),
            applyFilters: jest.fn(() => ({} as any)) as any,
            sendEvent: jest.fn(),
          }}
        />
      );
    }

    render(<Wrapper />);

    expect(seen).toHaveLength(2);
    expect(seen[0].__queryID).toBe('abc');
    expect(seen[1].__queryID).toBe('abc');
  });

  test('does not annotate hits with __queryID when missing on output', () => {
    const seen: Array<Record<string, unknown>> = [];
    const SpyItem: ItemComponentProps = ({ item }: ItemArgs) => {
      seen.push(item as Record<string, unknown>);
      return (<div className="hit" />) as JSX.Element;
    };

    function Wrapper() {
      return (
        <CarouselTool
          headerProps={{ showViewAll: false }}
          itemComponent={SpyItem}
          toolProps={{
            message: buildMessage(
              { query: 'tv' },
              { hits: makeHits(1), nbHits: 1 }
            ),
            indexUiState: {},
            setIndexUiState: jest.fn(),
            onClose: jest.fn(),
            addToolResult: jest.fn(),
            applyFilters: jest.fn(() => ({} as any)) as any,
            sendEvent: jest.fn(),
          }}
        />
      );
    }

    render(<Wrapper />);

    expect(seen).toHaveLength(1);
    expect('__queryID' in seen[0]).toBe(false);
  });
});
