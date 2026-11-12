/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { screen, within } from '@testing-library/dom';
import { collectChatRecords } from 'instantsearch-core';
import { h, render } from 'preact';

import { createComparisonTableTool } from '../comparison-table-tool';

import type {
  ChatComponentContext,
  ClientSideToolComponentProps,
} from 'instantsearch-core';
import type { ComponentType } from 'preact';

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
 * `algolia_display_results` call whose `markdownTable` block references items
 * by objectID only and lists the attribute KEYS to render (no values).
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
  const container = document.createElement('div');
  document.body.appendChild(container);
  const tool = createComparisonTableTool();
  const LayoutComponent = tool.templates
    .layout as unknown as ComponentType<ClientSideToolComponentProps>;

  render(
    <LayoutComponent
      context={{
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
      }}
    />,
    container
  );
}

describe('createComparisonTableTool', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

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
    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('199');
    expect(screen.getByTestId('cell-A-1')).toHaveTextContent('4');
    expect(screen.getByTestId('cell-B-0')).toHaveTextContent('299');
    expect(screen.getByTestId('cell-B-1')).toHaveTextContent('5');
  });

  test('a missing attribute renders an em-dash, never a fabricated value', () => {
    // Hit A has no rating in the catalog — the cell must be empty/—, not
    // guessed.
    const { displayMessage, messages } = buildComparisonTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      { attributes: ['price', 'rating'], objectIDs: ['A'] }
    );

    renderComparison(displayMessage, messages);

    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('199');
    // No rating in the record → explicit missing marker, nothing invented.
    expect(screen.getByTestId('cell-A-1')).toHaveTextContent('—');
  });

  test('an item referenced without a backing search hit shows no fabricated cells', () => {
    // The model references objectID 'B', but only 'A' was retrieved — the
    // exact "one item not in the catalog" failure the eval penalizes.
    const { displayMessage, messages } = buildComparisonTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      { attributes: ['price'], objectIDs: ['A', 'B'] }
    );

    renderComparison(displayMessage, messages);

    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('199');
    // B has no record: product label AND attribute cell are the missing
    // marker.
    expect(screen.getByTestId('product-B')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-B-0')).toHaveTextContent('—');
  });

  test('values are never sourced from the display output (model cannot smuggle them)', () => {
    // Defense-in-depth: even if the display block tried to ship attribute
    // values, there is no schema field for them and the renderer only reads
    // the records store.
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

    const table = screen.getByTestId('product-A').closest('table')!;
    expect(within(table).getByTestId('product-A')).toHaveTextContent(
      'Real Name'
    );
    expect(within(table).getByTestId('cell-A-0')).toHaveTextContent('10');
    expect(screen.queryByText('FABRICATED')).not.toBeInTheDocument();
    expect(screen.queryByText('9999')).not.toBeInTheDocument();
  });

  test('hydrates from the shared conversation records store, last write winning', () => {
    // The records store is conversation-level: a later re-fetch of the same
    // objectID updates the record every table reads from. Cells still can
    // only ever hold catalog-sourced values — never model-typed ones.
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
    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('999');
  });
});
