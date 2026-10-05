/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

/**
 * Tests for the builtin `algolia_compare_products` chat tool.
 *
 * The agent calls the tool with the products to compare (by objectID) and the
 * comparison criteria: a label plus one value per product. The table lays the
 * products across the top — hydrated from the chat records store, rendered with
 * the widget's item component — and the criteria down the side, so the header
 * can never name a product that isn't in the catalog, while the agent stays
 * free to compare on anything it read in the records (a description detail, a
 * derived verdict) and not just on stored attributes.
 */

import { chatToolProps } from '@instantsearch/testutils';
import { render, screen } from '@testing-library/react';
import { collectChatRecords } from 'instantsearch-ui-components';
import { parsePartialJson } from 'instantsearch.js/es/lib/ai-lite';
import React from 'react';

import { createCompareProductsTool } from '../CompareProductsTool';

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
  description?: string;
};

/**
 * Builds a turn shaped like an agent-triggered comparison: one
 * `algolia_search_index` call carrying the catalog hits, then an
 * `algolia_compare_products` call whose INPUT names the products by objectID
 * and lists the criteria rows.
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
        compareMessage,
      ],
    },
  ] as ChatComponentContext['messages'];

  return { compareMessage, messages };
}

function renderCompare(
  message: ToolMessage,
  messages: ChatComponentContext['messages'],
  tool = createCompareProductsTool()
) {
  const LayoutComponent = tool.layoutComponent!;

  return render(
    <LayoutComponent
      {...chatToolProps({
        ...metadata,
        messages,
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

const phones = [
  { objectID: 'A', name: 'Galaxy A50', price: 199, rating: 4 },
  { objectID: 'B', name: 'OnePlus 6T', price: 299, rating: 5 },
];

describe('CompareProductsTool', () => {
  test('lays products across the top and criteria down the side', () => {
    const { compareMessage, messages } = buildCompareTurn(phones, {
      objectIDs: ['A', 'B'],
      criteria: [
        { label: 'Price', values: ['$199', '$299'] },
        { label: 'Rating', values: [4, 5] },
      ],
      intro: 'Two solid mid-rangers:',
    });

    renderCompare(compareMessage, messages);

    // Model-authored lead-in renders as prose above the table.
    expect(screen.getByText('Two solid mid-rangers:')).toBeInTheDocument();

    // Header row: one column per product, named from the records.
    const headers = screen
      .getAllByRole('columnheader')
      .map((th) => th.textContent);
    expect(headers).toEqual(['', 'Galaxy A50', 'OnePlus 6T']);

    // Body: one row per criterion, values aligned to the products.
    expect(screen.getByTestId('criterion-0')).toHaveTextContent('Price');
    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('$199');
    expect(screen.getByTestId('cell-B-0')).toHaveTextContent('$299');
    expect(screen.getByTestId('criterion-1')).toHaveTextContent('Rating');
    expect(screen.getByTestId('cell-A-1')).toHaveTextContent('4');
    expect(screen.getByTestId('cell-B-1')).toHaveTextContent('5');
  });

  test('criteria can carry values the agent derived from the records', () => {
    // Nothing in the record is called "Best for": the agent read the
    // description and wrote a verdict. The table renders it as-is.
    const { compareMessage, messages } = buildCompareTurn(
      [
        {
          objectID: 'A',
          name: 'Galaxy A50',
          description: 'Large 4000 mAh battery for all-day use.',
        },
        {
          objectID: 'B',
          name: 'OnePlus 6T',
          description: 'Flagship-grade performance and a fast display.',
        },
      ],
      {
        objectIDs: ['A', 'B'],
        criteria: [
          { label: 'Battery', values: ['4000 mAh', null] },
          { label: 'Best for', values: ['Battery life', 'Performance'] },
        ],
      }
    );

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('4000 mAh');
    // The agent did not have a value for B: explicit marker, nothing invented.
    expect(screen.getByTestId('cell-B-0')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-A-1')).toHaveTextContent('Battery life');
    expect(screen.getByTestId('cell-B-1')).toHaveTextContent('Performance');
  });

  test('renders each product header with the item component when provided', () => {
    const { compareMessage, messages } = buildCompareTurn(phones, {
      objectIDs: ['A', 'B'],
      criteria: [{ label: 'Price', values: ['$199', '$299'] }],
    });

    const tool = createCompareProductsTool(({ item }) => (
      <article data-testid={`card-${item.objectID}`}>
        {String(item.name)} card
      </article>
    ));

    renderCompare(compareMessage, messages, tool);

    expect(screen.getByTestId('card-A')).toHaveTextContent('Galaxy A50 card');
    expect(screen.getByTestId('card-B')).toHaveTextContent('OnePlus 6T card');
    expect(screen.getByTestId('product-A')).toContainElement(
      screen.getByTestId('card-A')
    );
  });

  test('a product without a backing record shows the missing marker in the header', () => {
    // The model references objectID 'B', but only 'A' is in the records store.
    const { compareMessage, messages } = buildCompareTurn(
      [{ objectID: 'A', name: 'Galaxy A50' }],
      {
        objectIDs: ['A', 'B'],
        criteria: [{ label: 'Price', values: ['$199', '$299'] }],
      }
    );

    const tool = createCompareProductsTool(({ item }) => (
      <span>{String(item.name)} card</span>
    ));

    renderCompare(compareMessage, messages, tool);

    expect(screen.getByTestId('product-A')).toHaveTextContent(
      'Galaxy A50 card'
    );
    // No record → no item component either, just the marker.
    expect(screen.getByTestId('product-B')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-B-0')).toHaveTextContent('$299');
  });

  test('a missing or unprintable value renders the marker, never [object Object]', () => {
    const { compareMessage, messages } = buildCompareTurn(phones, {
      objectIDs: ['A', 'B'],
      criteria: [
        { label: 'Colors', values: [['black', 'blue'], undefined] },
        { label: 'Price', values: [{ value: 199, currency: 'USD' }, ''] },
        // Values shorter than the product list pad with the marker.
        { label: 'Weight', values: ['166 g'] },
      ],
    });

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('black, blue');
    expect(screen.getByTestId('cell-B-0')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-A-1')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-B-1')).toHaveTextContent('—');
    expect(screen.getByTestId('cell-B-2')).toHaveTextContent('—');
    expect(screen.queryByText(/object Object/)).not.toBeInTheDocument();
  });

  test('drops malformed criteria instead of breaking the table', () => {
    const { compareMessage, messages } = buildCompareTurn(phones, {
      objectIDs: ['A', 'B'],
      criteria: [
        'not a row',
        { values: ['no label'] },
        { label: '', values: ['empty label'] },
        { label: 'Price', values: 'not an array' },
        { label: 'Rating', values: [4, 5] },
      ],
    });

    renderCompare(compareMessage, messages);

    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 kept rows
    expect(screen.getByTestId('criterion-0')).toHaveTextContent('Price');
    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('—');
    expect(screen.getByTestId('criterion-1')).toHaveTextContent('Rating');
    expect(screen.queryByText('no label')).not.toBeInTheDocument();
  });

  test('still renders the attribute-based contract by reading the records', () => {
    // Agents configured with the previous tool definition send attribute keys
    // (and optionally `[product, ...attributes]` labels); values come from the
    // records, laid out in the same products-on-top table.
    const { compareMessage, messages } = buildCompareTurn(phones, {
      objectIDs: ['A', 'B'],
      attributes: ['price', 'rating'],
      columns: ['Phone', 'Price', 'Rating'],
    });

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('criterion-0')).toHaveTextContent('Price');
    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('199');
    expect(screen.getByTestId('cell-B-0')).toHaveTextContent('299');
    expect(screen.getByTestId('criterion-1')).toHaveTextContent('Rating');
    expect(screen.getByTestId('cell-A-1')).toHaveTextContent('4');
    expect(screen.getByTestId('cell-B-1')).toHaveTextContent('5');
  });

  describe('while the tool arguments stream', () => {
    /**
     * A streaming part as the chat exposes it with `streamInput`: `rawInput`
     * is the text received so far, `input` its partial-JSON repair (open
     * strings, arrays and objects closed).
     */
    function streamingTurn(rawInput: string) {
      const input = parsePartialJson(rawInput, undefined) as Record<
        string,
        unknown
      >;
      const { compareMessage, messages } = buildCompareTurn(phones, input);
      Object.assign(compareMessage, { state: 'input-streaming', rawInput });
      return { compareMessage, messages };
    }

    test('is registered to render while the input streams', () => {
      expect(createCompareProductsTool().streamInput).toBe(true);
    });

    test('renders nothing until the product list is complete', () => {
      // "B" could still become "B2": the columns wait for the array to close.
      const { compareMessage, messages } = streamingTurn(
        '{"objectIDs": ["A", "B'
      );

      const { container } = renderCompare(compareMessage, messages);

      expect(container).toBeEmptyDOMElement();
    });

    test('shows the columns once the products are known, then rows as they finish', () => {
      const { compareMessage, messages } = streamingTurn(
        '{"objectIDs": ["A", "B"], "criteria": [{"label": "Price", "values": ["$199", "$299"]}, {"label": "Rat'
      );

      renderCompare(compareMessage, messages);

      const headers = screen
        .getAllByRole('columnheader')
        .map((th) => th.textContent);
      expect(headers).toEqual(['', 'Galaxy A50', 'OnePlus 6T']);
      // The finished row is in; the one being written ("Rat…") is not.
      expect(screen.getByTestId('criterion-0')).toHaveTextContent('Price');
      expect(screen.getByTestId('cell-B-0')).toHaveTextContent('$299');
      expect(screen.queryByTestId('criterion-1')).not.toBeInTheDocument();
    });

    test('withholds a row whose last value is still being written', () => {
      // Repair closes the open string, so "$2" would otherwise render as a value.
      const { compareMessage, messages } = streamingTurn(
        '{"objectIDs": ["A", "B"], "criteria": [{"label": "Price", "values": ["$199", "$2'
      );

      renderCompare(compareMessage, messages);

      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.queryByTestId('criterion-0')).not.toBeInTheDocument();
    });

    test('shows every row between rows and once the criteria array has closed', () => {
      const betweenRows = streamingTurn(
        '{"objectIDs": ["A", "B"], "criteria": [{"label": "Price", "values": ["$199", "$299"]},'
      );
      const { unmount } = renderCompare(
        betweenRows.compareMessage,
        betweenRows.messages
      );
      expect(screen.getByTestId('criterion-0')).toHaveTextContent('Price');
      unmount();

      const closed = streamingTurn(
        '{"objectIDs": ["A", "B"], "criteria": [{"label": "Price", "values": ["$199", "$299"]}, {"label": "Rating", "values": [4, 5]}], "intro": "Two solid mid-ran'
      );
      renderCompare(closed.compareMessage, closed.messages);
      expect(screen.getByTestId('criterion-1')).toHaveTextContent('Rating');
      // The intro is a string under the cursor: shown once it is complete.
      expect(screen.queryByText(/Two solid/)).not.toBeInTheDocument();
    });

    test('renders nothing when a streaming part carries no raw input', () => {
      const { compareMessage, messages } = buildCompareTurn(phones, {
        objectIDs: ['A'],
        criteria: [{ label: 'Price', values: ['$199'] }],
      });
      (compareMessage as { state: string }).state = 'input-streaming';

      const { container } = renderCompare(compareMessage, messages);

      expect(container).toBeEmptyDOMElement();
    });
  });

  test('renders nothing without products', () => {
    const { compareMessage, messages } = buildCompareTurn(phones, {
      objectIDs: [],
      criteria: [{ label: 'Price', values: [] }],
    });

    const { container } = renderCompare(compareMessage, messages);

    expect(container).toBeEmptyDOMElement();
  });

  test('hydrates the header from the shared conversation records store', () => {
    // The records store is conversation-level: products selected by the user or
    // fetched in an earlier turn are available to the table.
    const compareMessage = {
      type: 'tool-algolia_compare_products',
      state: 'input-available',
      toolCallId: 'compare-turn-2',
      input: {
        objectIDs: ['A'],
        criteria: [{ label: 'Price', values: ['$999'] }],
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
            output: { hits: [{ objectID: 'A', name: 'Galaxy A50' }] },
          },
        ],
      },
      {
        id: '2',
        role: 'assistant',
        parts: [compareMessage],
      },
    ] as ChatComponentContext['messages'];

    renderCompare(compareMessage, messages);

    expect(screen.getByTestId('product-A')).toHaveTextContent('Galaxy A50');
    expect(screen.getByTestId('cell-A-0')).toHaveTextContent('$999');
  });

  test('acknowledges the client-side tool call so the agent turn completes', () => {
    const tool = createCompareProductsTool();
    const addToolResult = jest.fn();

    tool.onToolCall!({
      toolName: 'algolia_compare_products',
      toolCallId: 'compare',
      input: {
        objectIDs: ['A', 'B'],
        criteria: [{ label: 'Price', values: ['$199', '$299'] }],
      },
      addToolResult,
    } as unknown as Parameters<NonNullable<typeof tool.onToolCall>>[0]);

    expect(addToolResult).toHaveBeenCalledWith({
      output: { status: 'displayed', objectIDs: ['A', 'B'] },
    });
  });
});
