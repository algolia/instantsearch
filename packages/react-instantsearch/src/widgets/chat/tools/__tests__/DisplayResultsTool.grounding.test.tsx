/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

/**
 * Grounding regression tests for the comparison UI.
 *
 * These encode, as widget-level assertions, the criterion from the
 * `agentic-evals` comparison eval: a comparison answer must never surface a
 * product attribute (price, rating, spec) that isn't present in the actual
 * retrieved catalog data. The Agent Studio agent emits only objectIDs for the
 * `algolia_display_results` tool and the client hydrates each cell from the
 * preceding search hits (see `getHitsByObjectID`). That design is what makes
 * fabrication structurally impossible — these tests pin that contract so a
 * future change can't reintroduce model-authored (hallucinated) values.
 *
 * The eval (offline, LLM-judged) measures how often the agent *produces*
 * grounded comparisons; this test guarantees the *rendering layer* can only
 * ever show grounded values, independent of the model.
 */

import { render, screen, within } from '@testing-library/react';
import React from 'react';

import { createDisplayResultsTool } from '../DisplayResultsTool';

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';

type CatalogHit = {
  objectID: string;
  name?: string;
  price?: number;
  __position: number;
  __displayToolResult?: { objectID: string; why?: string };
};

// Renders every catalog-sourced attribute we care about for a comparison, each
// behind its own testid so we can assert exactly which values reach the DOM.
const comparisonItemComponent = ({ item }: { item: CatalogHit }) => (
  <div data-testid={`item-${item.objectID}`}>
    <span data-testid={`id-${item.objectID}`}>{item.objectID}</span>
    {item.name !== undefined && (
      <strong data-testid={`name-${item.objectID}`}>{item.name}</strong>
    )}
    {item.price !== undefined && (
      <span data-testid={`price-${item.objectID}`}>${item.price}</span>
    )}
  </div>
);

/**
 * Builds a conversation turn shaped exactly like an Agent Studio comparison:
 * one `algolia_search_index` tool call carrying the real catalog hits, followed
 * by an `algolia_display_results` tool call that references items *by objectID
 * only* (the backend never sends attribute values for display).
 */
function buildComparisonTurn(
  searchHits: Array<Partial<CatalogHit> & { objectID: string }>,
  displayedObjectIDs: string[]
) {
  const displayMessage: ClientSideToolComponentProps['message'] = {
    type: 'tool-algolia_display_results',
    state: 'output-available',
    toolCallId: 'display',
    input: {},
    output: {
      intro: 'Here is the comparison',
      groups: [
        {
          title: 'Comparison',
          // Backend sends ONLY objectIDs (+ optional curation `why`).
          results: displayedObjectIDs.map((objectID) => ({ objectID })),
        },
      ],
    },
  };

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
  ] as ClientSideToolComponentProps['messages'];

  return { displayMessage, messages };
}

function renderComparison(
  message: ClientSideToolComponentProps['message'],
  messages: ClientSideToolComponentProps['messages']
) {
  const tool = createDisplayResultsTool<CatalogHit>(comparisonItemComponent);
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

describe('DisplayResults comparison grounding', () => {
  test('every displayed attribute comes from the retrieved catalog hits', () => {
    // Two genuinely-retrieved products, as a "compare A vs B" turn would have.
    const { displayMessage, messages } = buildComparisonTurn(
      [
        { objectID: 'A', name: 'Galaxy A50', price: 199 },
        { objectID: 'B', name: 'OnePlus 6T', price: 299 },
      ],
      ['A', 'B']
    );

    renderComparison(displayMessage, messages);

    // Both items are shown, each with the EXACT values from the search hits.
    expect(screen.getByTestId('name-A')).toHaveTextContent('Galaxy A50');
    expect(screen.getByTestId('price-A')).toHaveTextContent('$199');
    expect(screen.getByTestId('name-B')).toHaveTextContent('OnePlus 6T');
    expect(screen.getByTestId('price-B')).toHaveTextContent('$299');
  });

  test('an item referenced without a backing search hit renders NO fabricated attributes', () => {
    // The model references objectID 'B', but only 'A' was actually retrieved —
    // the exact "one item not in the catalog" failure the eval penalizes.
    // The widget must show A's real data and surface B with zero invented specs.
    const { displayMessage, messages } = buildComparisonTurn(
      [{ objectID: 'A', name: 'Galaxy A50', price: 199 }],
      ['A', 'B']
    );

    renderComparison(displayMessage, messages);

    // A is fully grounded.
    expect(screen.getByTestId('name-A')).toHaveTextContent('Galaxy A50');
    expect(screen.getByTestId('price-A')).toHaveTextContent('$199');

    // B is rendered (its objectID is known) but carries NO hydrated attributes,
    // because there is no search hit to source them from. Nothing is fabricated.
    expect(screen.getByTestId('item-B')).toBeInTheDocument();
    expect(screen.queryByTestId('name-B')).not.toBeInTheDocument();
    expect(screen.queryByTestId('price-B')).not.toBeInTheDocument();
  });

  test('rendered values are never sourced from the display tool output itself', () => {
    // Defense-in-depth: even if a (malformed/compromised) display output tried
    // to smuggle attribute values, only the search-hit-sourced record is used.
    const searchHits = [{ objectID: 'A', name: 'Real Name', price: 10 }];
    const displayMessage = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {},
      output: {
        groups: [
          {
            title: 'Comparison',
            results: [
              // A spoofed attribute that must NOT win over the search hit.
              { objectID: 'A', name: 'FABRICATED', price: 9999 },
            ],
          },
        ],
      },
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
          displayMessage,
        ],
      },
    ] as ClientSideToolComponentProps['messages'];

    renderComparison(displayMessage, messages);

    const item = screen.getByTestId('item-A');
    // The catalog values win; the display-output values never appear.
    expect(within(item).getByTestId('name-A')).toHaveTextContent('Real Name');
    expect(within(item).getByTestId('price-A')).toHaveTextContent('$10');
    expect(screen.queryByText('FABRICATED')).not.toBeInTheDocument();
    expect(screen.queryByText('$9999')).not.toBeInTheDocument();
  });

  test('an objectID is only hydrated from its OWN turn, not a later search', () => {
    // The display tool must be scoped to the turn that produced it: a later
    // turn searching a different product can't retroactively fill this table.
    const tool = createDisplayResultsTool<CatalogHit>(comparisonItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const displayMessage: ClientSideToolComponentProps['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display-turn-1',
      input: {},
      output: {
        groups: [{ title: 'Comparison', results: [{ objectID: 'A' }] }],
      },
    };

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
            // A later turn re-fetched A WITH a price — must not leak backwards.
            output: { hits: [{ objectID: 'A', name: 'Galaxy A50', price: 999 }] },
            input: {},
          },
        ],
      },
    ] as ClientSideToolComponentProps['messages'];

    render(
      <LayoutComponent
        message={displayMessage}
        messages={messages}
        applyFilters={jest.fn()}
        onClose={jest.fn()}
        indexUiState={{}}
        addToolResult={jest.fn()}
        setIndexUiState={jest.fn()}
        sendEvent={jest.fn()}
      />
    );

    expect(screen.getByTestId('name-A')).toHaveTextContent('Galaxy A50');
    // The price from turn 2 must not appear in turn 1's comparison.
    expect(screen.queryByTestId('price-A')).not.toBeInTheDocument();
  });
});
