/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

/**
 * Grounding tests for the GROUNDED comparison-table prototype.
 *
 * This pins the "render the table from product IDs, not model text" fix from the
 * agentic-evals comparison study (`comparison-eval/README.md`). The agent emits a
 * v2 `markdownTable` block that names only the product objectIDs and the
 * attribute *keys* to compare — never the values. Every cell is hydrated from
 * the chat records store (the hits the search tools actually fetched). That
 * makes a fabricated price/spec structurally impossible: the model never types
 * one.
 *
 * The eval (offline, LLM-judged) showed hallucination collapses as a comparison
 * table grows wider (to ~4% grounded at 4 items) precisely because the model
 * types every cell. These tests guarantee the rendering layer can only ever show
 * catalog-sourced values, no matter what the model emits.
 */

import { chatToolProps } from '@instantsearch/testutils';
import { render, screen, within } from '@testing-library/react';
import { collectChatRecords } from 'instantsearch-ui-components';
import React from 'react';

import { createComparisonTableTool } from '../ComparisonTableTool';

import type {
  ChatComponentContext,
  ClientSideToolComponentProps,
} from 'instantsearch-ui-components';

type ToolMessage = ClientSideToolComponentProps['context']['message'];

const metadata: ChatComponentContext = {
  messages: [],
  status: 'ready',
  isClearing: false,
  open: true,
  maximized: false,
  tools: {},
  regenerate: jest.fn(),
  stop: jest.fn(),
  onReload: jest.fn(),
  onClose: jest.fn(),
};

type CatalogHit = {
  objectID: string;
  name?: string;
  price?: number;
  rating?: number;
  __position?: number;
};

/**
 * Builds a comparison turn shaped like an Agent Studio grounded-table answer:
 * one `algolia_search_index` call carrying the real catalog hits, then an
 * `algolia_display_results` call whose `markdownTable` block references items by
 * objectID only and lists the attribute KEYS to render (no values).
 */
function buildComparisonTurn(
  searchHits: Array<Partial<CatalogHit> & { objectID: string }>,
  table: {
    attributes: string[];
    columns?: string[];
    objectIDs: string[];
    intro?: string;
  }
) {
  const displayMessage = {
    type: 'tool-algolia_display_results',
    state: 'output-available',
    toolCallId: 'display',
    input: {},
    output: {
      intro: table.intro,
      content: [
        {
          type: 'markdownTable',
          attributes: table.attributes,
          columns: table.columns,
          // Backend sends ONLY objectIDs per row — no attribute values.
          rows: table.objectIDs.map((objectID) => ({ objectID })),
        },
      ],
    },
  } as ToolMessage;

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
        displayMessage,
      ],
    },
  ] as ChatComponentContext['messages'];

  return { displayMessage, messages };
}

function renderComparison(
  message: ToolMessage,
  messages: ChatComponentContext['messages']
) {
  const tool = createComparisonTableTool();
  const LayoutComponent = tool.layoutComponent!;

  return render(
    <LayoutComponent
      {...chatToolProps({
        ...metadata,
        messages,
        // The tool only consumes records; the search tool fetched them.
        records: collectChatRecords(messages),
        message,
        applyFilters: jest.fn(),
        indexUiState: {},
        addToolResult: jest.fn(),
        setIndexUiState: jest.fn(),
        sendEvent: jest.fn(),
      })}
    />
  );
}

describe('ComparisonTable grounding', () => {
  test('every cell value comes from the retrieved catalog hits', () => {
    const { displayMessage, messages } = buildComparisonTurn(
      [
        { objectID: 'A', name: 'Galaxy A50', price: 199, rating: 4 },
        { objectID: 'B', name: 'OnePlus 6T', price: 299, rating: 5 },
      ],
      {
        attributes: ['price', 'rating'],
        columns: ['Phone', 'Price', 'Rating'],
        objectIDs: ['A', 'B'],
      }
    );

    renderComparison(displayMessage, messages);

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
    // Hit A has no rating in the catalog — the cell must be empty/—, not guessed.
    const { displayMessage, messages } = buildComparisonTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      { attributes: ['price', 'rating'], objectIDs: ['A'] }
    );

    renderComparison(displayMessage, messages);

    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('199');
    // No rating in the record → explicit missing marker, nothing invented.
    expect(screen.getByTestId('cell-A-rating')).toHaveTextContent('—');
  });

  test('an item referenced without a backing search hit shows no fabricated cells', () => {
    // The model references objectID 'B', but only 'A' was retrieved — the exact
    // "one item not in the catalog" failure the eval penalizes.
    const { displayMessage, messages } = buildComparisonTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      { attributes: ['price'], objectIDs: ['A', 'B'] }
    );

    renderComparison(displayMessage, messages);

    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('199');
    // B has no record: product label AND attribute cell are the missing marker.
    expect(screen.getByTestId('product-B')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-B-price')).toHaveTextContent('—');
  });

  test('values are never sourced from the display output (model cannot smuggle them)', () => {
    // Defense-in-depth: even if the display block tried to ship attribute values,
    // there is no schema field for them and the renderer only reads the records
    // store.
    const searchHits = [{ objectID: 'A', name: 'Real Name', price: 10 }];
    const displayMessage = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {},
      output: {
        content: [
          {
            type: 'markdownTable',
            attributes: ['price'],
            // A spoofed value smuggled onto the row — must be ignored.
            rows: [{ objectID: 'A', name: 'FABRICATED', price: 9999 }],
          },
        ],
      },
    } as ToolMessage;

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
          displayMessage,
        ],
      },
    ] as ChatComponentContext['messages'];

    renderComparison(displayMessage, messages);

    const row = screen.getByTestId('product-A').closest('tr')!;
    expect(within(row).getByTestId('product-A')).toHaveTextContent('Real Name');
    expect(within(row).getByTestId('cell-A-price')).toHaveTextContent('10');
    expect(screen.queryByText('FABRICATED')).not.toBeInTheDocument();
    expect(screen.queryByText('9999')).not.toBeInTheDocument();
  });

  test('hydrates from the shared conversation records store, last write winning', () => {
    // The records store is conversation-level: a later re-fetch of the same
    // objectID updates the record every table reads from. Cells still can only
    // ever hold catalog-sourced values — never model-typed ones.
    const displayMessage = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display-turn-1',
      input: {},
      output: {
        content: [
          {
            type: 'markdownTable',
            attributes: ['price'],
            rows: [{ objectID: 'A' }],
          },
        ],
      },
    } as ToolMessage;

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
          displayMessage,
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
            // A later turn re-fetched A WITH a price: last write wins.
            output: {
              hits: [{ objectID: 'A', name: 'Galaxy A50', price: 999 }],
            },
          },
        ],
      },
    ] as ChatComponentContext['messages'];

    renderComparison(displayMessage, messages);

    expect(screen.getByTestId('product-A')).toHaveTextContent('Galaxy A50');
    expect(screen.getByTestId('cell-A-price')).toHaveTextContent('999');
  });
});
