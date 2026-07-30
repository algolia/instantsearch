/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

/**
 * Grounding tests for the builtin `algolia_compare_products` chat tool.
 *
 * This is the "grounded comparison table" fix from the agentic-evals comparison
 * study (`comparison-eval/README.md`), promoted from the display-block prototype
 * to a first-class builtin tool: the agent triggers the tool with ONLY the
 * product objectIDs and the attribute *keys* to compare — never the values.
 * Every cell is hydrated from the preceding `algolia_search_index` hits (via
 * `getHitsByObjectID`), so a fabricated price/spec is structurally impossible:
 * the model never types one.
 *
 * The eval showed hallucination worsens as comparison tables grow wider
 * (~4% grounded at 4 items when the model types every cell). These tests
 * guarantee the tool can only ever show catalog-sourced values, no matter what
 * arguments the model sends.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { createCompareProductsTool } from '../CompareProductsTool';

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';

type CatalogHit = {
  objectID: string;
  name?: string;
  price?: number;
  rating?: number;
};

/**
 * Builds a turn shaped like an agent-triggered comparison: one
 * `algolia_search_index` call carrying the real catalog hits, then an
 * `algolia_compare_products` call whose INPUT names the products by objectID
 * and lists the attribute KEYS to render (no values).
 */
function buildCompareTurn(
  searchHits: Array<Partial<CatalogHit> & { objectID: string }>,
  input: Record<string, unknown>,
  state: 'input-available' | 'output-available' = 'input-available'
) {
  const compareMessage = {
    type: 'tool-algolia_compare_products',
    state,
    toolCallId: 'compare',
    input,
  } as ClientSideToolComponentProps['message'];

  const messages = [
    {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index',
          toolCallId: 'search',
          state: 'output-available',
          input: {},
          output: { hits: searchHits },
        },
        compareMessage,
      ],
    },
  ] as ClientSideToolComponentProps['messages'];

  return { compareMessage, messages };
}

function renderCompare(
  message: ClientSideToolComponentProps['message'],
  messages: ClientSideToolComponentProps['messages']
) {
  const tool = createCompareProductsTool();
  const LayoutComponent = tool.layoutComponent!;

  return render(
    <LayoutComponent
      message={message}
      messages={messages}
      applyFilters={jest.fn()}
      onClose={jest.fn()}
      indexUiState={{}}
      addToolResult={jest.fn()}
      setIndexUiState={jest.fn()}
      sendEvent={jest.fn()}
    />
  );
}

describe('CompareProductsTool grounding', () => {
  test('every cell value comes from the retrieved catalog hits', () => {
    const { compareMessage, messages } = buildCompareTurn(
      [
        { objectID: 'A', name: 'Galaxy A50', price: 199, rating: 4 },
        { objectID: 'B', name: 'OnePlus 6T', price: 299, rating: 5 },
      ],
      {
        objectIDs: ['A', 'B'],
        attributes: ['price', 'rating'],
        columns: ['Phone', 'Price', 'Rating'],
        intro: 'Two solid mid-rangers:',
      }
    );

    renderCompare(compareMessage, messages);

    // Model-authored lead-in renders as prose above the table.
    expect(screen.getByText('Two solid mid-rangers:')).toBeInTheDocument();

    // Product names come from the hits.
    expect(screen.getByTestId('product-A')).toHaveTextContent('Galaxy A50');
    expect(screen.getByTestId('product-B')).toHaveTextContent('OnePlus 6T');

    // Every attribute cell is the EXACT value from the search hit.
    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('199');
    expect(screen.getByTestId('cell-A-rating')).toHaveTextContent('4');
    expect(screen.getByTestId('cell-B-price')).toHaveTextContent('299');
    expect(screen.getByTestId('cell-B-rating')).toHaveTextContent('5');
  });

  test('a missing attribute renders an em-dash, never a fabricated value', () => {
    // Hit A has no rating in the catalog — the cell must be —, not guessed.
    const { compareMessage, messages } = buildCompareTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      { objectIDs: ['A'], attributes: ['price', 'rating'] }
    );

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('199');
    expect(screen.getByTestId('cell-A-rating')).toHaveTextContent('—');
  });

  test('an item referenced without a backing search hit shows no fabricated cells', () => {
    // The model references objectID 'B', but only 'A' was retrieved — the
    // exact "one item not in the catalog" failure the eval penalizes.
    const { compareMessage, messages } = buildCompareTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      { objectIDs: ['A', 'B'], attributes: ['price'] }
    );

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('199');
    // B has no hit: product label AND attribute cell are the missing marker.
    expect(screen.getByTestId('product-B')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-B-price')).toHaveTextContent('—');
  });

  test('values smuggled into the tool arguments are ignored', () => {
    // Defense-in-depth: even if the model ships attribute values in its
    // arguments, there is no schema field for them — the renderer only reads
    // objectIDs/attributes off the input and values off the search hits.
    const { compareMessage, messages } = buildCompareTurn(
      [{ objectID: 'A', name: 'Real Name', price: 10 }],
      {
        objectIDs: ['A'],
        attributes: ['price'],
        values: { A: { price: 9999, name: 'FABRICATED' } },
        rows: [{ objectID: 'A', price: 9999 }],
      }
    );

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('product-A')).toHaveTextContent('Real Name');
    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('10');
    expect(screen.queryByText('FABRICATED')).not.toBeInTheDocument();
    expect(screen.queryByText('9999')).not.toBeInTheDocument();
  });

  test('renders nothing while the tool arguments are still streaming', () => {
    const { compareMessage, messages } = buildCompareTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      { objectIDs: ['A'], attributes: ['price'] }
    );
    (compareMessage as { state: string }).state = 'input-streaming';

    const { container } = renderCompare(compareMessage, messages);

    expect(container).toBeEmptyDOMElement();
  });

  test('a table is only hydrated from its OWN turn, not a later search', () => {
    const compareMessage = {
      type: 'tool-algolia_compare_products',
      state: 'input-available',
      toolCallId: 'compare-turn-1',
      input: { objectIDs: ['A'], attributes: ['price'] },
    } as ClientSideToolComponentProps['message'];

    const messages = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-turn-1',
            state: 'output-available',
            input: {},
            // Turn 1 retrieved A with NO price.
            output: { hits: [{ objectID: 'A', name: 'Galaxy A50' }] },
          },
          compareMessage,
        ],
      },
      {
        id: '2',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-turn-2',
            state: 'output-available',
            input: {},
            // A later turn re-fetched A WITH a price — must not leak backwards.
            output: { hits: [{ objectID: 'A', name: 'Galaxy A50', price: 999 }] },
          },
        ],
      },
    ] as ClientSideToolComponentProps['messages'];

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('product-A')).toHaveTextContent('Galaxy A50');
    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('—');
    expect(screen.queryByText('999')).not.toBeInTheDocument();
  });

  test('acknowledges the client-side tool call so the agent turn completes', () => {
    const tool = createCompareProductsTool();
    const addToolResult = jest.fn();

    tool.onToolCall!({
      toolName: 'algolia_compare_products',
      toolCallId: 'compare',
      input: { objectIDs: ['A', 'B'], attributes: ['price'] },
      addToolResult,
    } as unknown as Parameters<NonNullable<typeof tool.onToolCall>>[0]);

    expect(addToolResult).toHaveBeenCalledWith({
      output: { status: 'displayed', objectIDs: ['A', 'B'] },
    });
  });
});
