/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createDisplayResultsTool } from '../DisplayResultsTool';

import type {
  ChatComponentContext,
  ClientSideToolComponentProps,
} from 'instantsearch-ui-components';

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

type TestResult = {
  objectID: string;
  name?: string;
  __position: number;
  // Curation payload from the display tool, kept separate from record fields.
  __displayToolResult?: { objectID: string; why?: string };
};

const mockItemComponent = ({ item }: { item: TestResult }) => (
  <div data-testid={`item-${item.objectID}`}>
    <span>{item.objectID}</span>
    <span data-testid={`position-${item.objectID}`}>{item.__position}</span>
    {item.name && (
      <strong data-testid={`name-${item.objectID}`}>{item.name}</strong>
    )}
    {item.__displayToolResult?.why && (
      <small data-testid={`why-${item.objectID}`}>
        {item.__displayToolResult.why}
      </small>
    )}
  </div>
);

const createMessages = (
  message: ClientSideToolComponentProps['context']['message'],
  hits: Array<{ objectID: string; name?: string; why?: string }>
): ChatComponentContext['messages'] =>
  [
    {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-algolia_search_index',
          toolCallId: 'search',
          state: 'output-available',
          input: {},
          output: { hits },
        },
        message,
      ],
    },
  ] as ChatComponentContext['messages'];

describe('createDisplayResultsTool', () => {
  test('opts into tool input streaming', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);

    expect(tool.streamInput).toBe(true);
  });

  test('renders hydrated groups while tool input is streaming', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'input-streaming',
      toolCallId: 'display',
      input: {
        intro: 'Curating for you',
        groups: [
          {
            title: 'Runners',
            results: [{ objectID: '1', why: 'lightweight' }],
          },
        ],
      },
    };

    const messages = createMessages(message, [
      { objectID: '1', name: 'Air Runner' },
    ]);

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages,
          status: 'streaming',
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getByText('Curating for you')).toBeInTheDocument();
    expect(screen.getByText('Runners')).toBeInTheDocument();
    expect(screen.getByTestId('name-1')).toHaveTextContent('Air Runner');
    expect(screen.getByText('Curating results…')).toBeInTheDocument();
  });

  test('keeps carousel controls focused while tool input streams', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const createToolProps = (intro: string, objectIDs: string[]) => {
      const message: ClientSideToolComponentProps['context']['message'] = {
        type: 'tool-algolia_display_results',
        state: 'input-streaming',
        toolCallId: 'display',
        input: {
          intro,
          groups: [
            {
              title: 'Products',
              results: objectIDs.map((objectID) => ({ objectID })),
            },
          ],
        },
      };

      return {
        context: {
          ...metadata,
          messages: createMessages(
            message,
            objectIDs.map((objectID) => ({
              objectID,
              name: `Product ${objectID}`,
            }))
          ),
          status: 'streaming' as const,
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        },
      };
    };
    const { container, rerender } = render(
      <LayoutComponent {...createToolProps('Original intro', ['1'])} />
    );
    const list = container.querySelector('.ais-Carousel-list')!;
    Object.defineProperties(list, {
      clientWidth: { configurable: true, value: 100 },
      scrollWidth: { configurable: true, value: 200 },
    });
    const nextButtonBefore = within(container).getAllByRole('button')[1];

    nextButtonBefore.focus();
    rerender(
      <LayoutComponent {...createToolProps('Updated intro', ['1', '2'])} />
    );

    const nextButtonAfter = within(container).getAllByRole('button')[1];

    expect(screen.getByText('2 results')).toBeInTheDocument();
    expect(nextButtonAfter).toBe(nextButtonBefore);
    expect(document.activeElement).toBe(nextButtonAfter);
  });

  test('names the carousel scroll controls', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'input-streaming',
      toolCallId: 'display',
      input: {
        intro: 'Curating',
        groups: [{ title: 'Products', results: [{ objectID: '1' }] }],
      },
    };
    const { container } = render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [
            { objectID: '1', name: 'Runner' },
          ]),
          status: 'streaming',
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    // Icon-only controls carry no text, so the name has to come from the label.
    expect(
      within(container).getByRole('button', { name: 'Previous' })
    ).toHaveClass('ais-ChatToolDisplayResultsCarouselHeaderScrollButton');
    expect(within(container).getByRole('button', { name: 'Next' })).toHaveClass(
      'ais-ChatToolDisplayResultsCarouselHeaderScrollButton'
    );
  });

  test('renders completed legacy v1 output when input has no v1 fields', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {},
      output: {
        intro: 'Curated for you',
        groups: [
          {
            title: 'Runners',
            why: 'matches your stride',
            results: [{ objectID: '1', why: 'iconic' }],
          },
          {
            title: 'Casual',
            results: [{ objectID: '2', why: 'everyday classic' }],
          },
        ],
      },
    };

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [
            { objectID: '1', name: 'Air Runner' },
            { objectID: '2', name: 'Street Runner' },
          ]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getByText('Curated for you')).toBeInTheDocument();
    expect(screen.getByText('Runners')).toBeInTheDocument();
    expect(screen.getByText('matches your stride')).toBeInTheDocument();
    expect(screen.getByText('Casual')).toBeInTheDocument();
    expect(screen.getByTestId('why-1')).toHaveTextContent('iconic');
    expect(screen.getByTestId('why-2')).toHaveTextContent('everyday classic');
  });

  test('sends a click event when a displayed result is selected', async () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const sendEvent = jest.fn();

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {},
      output: {
        groups: [
          {
            results: [{ objectID: '1', why: 'iconic' }],
          },
        ],
      },
    };

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [{ objectID: '1' }]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent,
        }}
      />
    );

    await userEvent.click(screen.getByTestId('item-1'));

    expect(sendEvent).toHaveBeenCalledWith(
      'click:internal',
      expect.objectContaining({
        objectID: '1',
        __position: 1,
        __displayToolResult: { objectID: '1', why: 'iconic' },
      }),
      'Item Clicked'
    );
  });

  test('lets custom displayed result items send conversion events', async () => {
    const sendEvent = jest.fn();
    const conversionItemComponent = ({
      item,
      sendEvent: sendItemEvent,
    }: {
      item: TestResult;
      sendEvent: ClientSideToolComponentProps['context']['sendEvent'];
    }) => (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          sendItemEvent('conversion', item, 'Product Added To Cart');
        }}
      >
        Add {item.objectID} to cart
      </button>
    );

    const tool = createDisplayResultsTool<TestResult>(conversionItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {},
      output: {
        groups: [
          {
            results: [{ objectID: '1' }],
          },
        ],
      },
    };

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [{ objectID: '1' }]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent,
        }}
      />
    );

    await userEvent.click(screen.getByText('Add 1 to cart'));

    expect(sendEvent).toHaveBeenCalledWith(
      'conversion',
      expect.objectContaining({
        objectID: '1',
        __position: 1,
      }),
      'Product Added To Cart'
    );
  });

  test('hydrates results from the preceding search tool, keeping display fields', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            title: 'Runners',
            // Backend only sends the objectID (and an optional `why`).
            results: [{ objectID: '1', why: 'iconic' }, { objectID: '2' }],
          },
        ],
      },
      output: { status: 'success', unknownObjectIds: [] },
    };

    // The preceding search tool (same assistant message) carries the full
    // records; the display tool hydrates from them.
    const messages = createMessages(message, [
      { objectID: '1', name: 'Air Runner', why: 'from search' },
      { objectID: '2', name: 'Trail Runner' },
    ]);

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages,
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    // Full record fields are hydrated from the search hits…
    expect(screen.getByTestId('name-1')).toHaveTextContent('Air Runner');
    expect(screen.getByTestId('name-2')).toHaveTextContent('Trail Runner');
    // …while the display tool's curation payload stays in its own namespace,
    // so a record field named `why` ("from search") can't clobber it.
    expect(screen.getByTestId('why-1')).toHaveTextContent('iconic');
  });

  test('omits results when no matching hit is available', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          { title: 'Runners', results: [{ objectID: '1', why: 'iconic' }] },
        ],
      },
      output: { status: 'success', unknownObjectIds: ['1'] },
    };

    const messages = createMessages(message, [
      { objectID: '99', name: 'Unrelated' },
    ]);

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages,
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('name-1')).not.toBeInTheDocument();
    expect(screen.queryByText('Runners')).not.toBeInTheDocument();
  });

  test('omits unresolved prototype-named object IDs', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            title: 'Runners',
            results: [
              { objectID: '1' },
              { objectID: 'constructor' },
              { objectID: '__proto__' },
              { objectID: '2' },
            ],
          },
          {
            title: 'Unknown only',
            results: [{ objectID: 'constructor' }],
          },
        ],
      },
      output: {
        status: 'warning',
        unknownObjectIds: ['constructor', '__proto__'],
      },
    };

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [
            { objectID: '1', name: 'Air Runner' },
            { objectID: '2', name: 'Trail Runner' },
          ]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(
      screen
        .getAllByTestId(/^item-/)
        .map((element) => element.getAttribute('data-testid'))
    ).toEqual(['item-1', 'item-2']);
    expect(screen.queryByTestId('item-constructor')).not.toBeInTheDocument();
    expect(screen.queryByTestId('item-__proto__')).not.toBeInTheDocument();
    expect(screen.queryByText('Unknown only')).not.toBeInTheDocument();
  });

  test('uses dense rendered positions for click analytics after omissions', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const sendEvent = jest.fn();

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            results: [
              { objectID: 'missing' },
              { objectID: 'known' },
              { objectID: 'known-2' },
              { objectID: 'known' },
            ],
          },
        ],
      },
      output: { status: 'warning', unknownObjectIds: ['missing'] },
    };

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [
            { objectID: 'known', name: 'Known record' },
            { objectID: 'known-2', name: 'Second known record' },
          ]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent,
        }}
      />
    );

    const knownItems = screen.getAllByTestId('item-known');
    fireEvent.click(knownItems[0]);
    fireEvent.click(screen.getByTestId('item-known-2'));
    fireEvent.click(knownItems[1]);

    expect(sendEvent).toHaveBeenNthCalledWith(
      1,
      'click:internal',
      expect.objectContaining({ objectID: 'known', __position: 1 }),
      'Item Clicked'
    );
    expect(sendEvent).toHaveBeenNthCalledWith(
      2,
      'click:internal',
      expect.objectContaining({ objectID: 'known-2', __position: 2 }),
      'Item Clicked'
    );
    expect(sendEvent).toHaveBeenNthCalledWith(
      3,
      'click:internal',
      expect.objectContaining({ objectID: 'known', __position: 3 }),
      'Item Clicked'
    );
  });

  test('renders hydrated prototype-named object IDs', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            title: 'Reserved names',
            results: [{ objectID: 'constructor' }, { objectID: '__proto__' }],
          },
        ],
      },
      output: { status: 'success', unknownObjectIds: [] },
    };

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [
            { objectID: 'constructor', name: 'Constructor record' },
            { objectID: '__proto__', name: 'Prototype record' },
          ]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getByTestId('name-constructor')).toHaveTextContent(
      'Constructor record'
    );
    expect(screen.getByTestId('name-__proto__')).toHaveTextContent(
      'Prototype record'
    );
  });

  test('does not render preliminary legacy output', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const { container } = render(
      <LayoutComponent
        context={{
          ...metadata,
          message: {
            type: 'tool-algolia_display_results',
            state: 'output-available',
            toolCallId: 'display',
            input: {},
            output: {
              intro: 'Curating',
              groups: [{ title: 'Runners', results: [{ objectID: '1' }] }],
            },
            preliminary: true,
          } as ClientSideToolComponentProps['context']['message'],
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('drops results that are missing an objectID and skips groups with no valid results', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const message = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          { title: 'Empty', results: [{}, { objectID: '' }] },
          {
            title: 'Full',
            results: [{}, { objectID: '1', why: 'iconic' }],
          },
        ],
      },
      output: { status: 'success' },
    } as ClientSideToolComponentProps['context']['message'];

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [
            { objectID: '1', name: 'Air Runner' },
          ]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
  });

  test('renders nothing when there are no groups and no intro', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const { container } = render(
      <LayoutComponent
        context={{
          ...metadata,
          message: {
            type: 'tool-algolia_display_results',
            state: 'output-available',
            toolCallId: 'display',
            input: {},
            output: { groups: [] },
          } as ClientSideToolComponentProps['context']['message'],
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('keeps input authoritative when output contains diagnostics', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        intro: 'Input intro',
        groups: [{ title: 'Input group', results: [{ objectID: '1' }] }],
      },
      output: {
        status: 'warning',
        unknownObjectIds: ['missing'],
      },
    };

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, [
            { objectID: '1', name: 'Air Runner' },
          ]),
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getByText('Input intro')).toBeInTheDocument();
    expect(screen.getByText('Input group')).toBeInTheDocument();
    expect(screen.getByTestId('name-1')).toHaveTextContent('Air Runner');
    expect(screen.queryByText('warning')).not.toBeInTheDocument();
  });

  test('shows the streaming caption before a renderable input field arrives', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const message = {
      type: 'tool-algolia_display_results',
      state: 'input-streaming',
      toolCallId: 'display',
      input: {},
    } as ClientSideToolComponentProps['context']['message'];

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages: createMessages(message, []),
          status: 'streaming',
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getByText('Curating results…')).toBeInTheDocument();
  });

  test('does not expose legacy output when input claims malformed v1 fields', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const { container } = render(
      <LayoutComponent
        context={{
          ...metadata,
          message: {
            type: 'tool-algolia_display_results',
            state: 'output-available',
            toolCallId: 'display',
            input: { groups: 'invalid' },
            output: { intro: 'Legacy output' },
          } as ClientSideToolComponentProps['context']['message'],
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('preserves duplicate result order and uses the latest preceding hit', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;

    const message: ClientSideToolComponentProps['context']['message'] = {
      type: 'tool-algolia_display_results',
      state: 'output-available',
      toolCallId: 'display',
      input: {
        groups: [
          {
            results: [
              { objectID: '1', why: 'first' },
              { objectID: '1', why: 'second' },
            ],
          },
        ],
      },
      output: { status: 'success' },
    };
    const messages = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-1',
            state: 'output-available',
            input: {},
            output: { hits: [{ objectID: '1', name: 'Old Runner' }] },
          },
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-2',
            state: 'output-available',
            input: {},
            output: { hits: [{ objectID: '1', name: 'New Runner' }] },
          },
          message,
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-after-display',
            state: 'output-available',
            input: {},
            output: { hits: [{ objectID: '1', name: 'Future Runner' }] },
          },
        ],
      },
    ] as ChatComponentContext['messages'];

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages,
          message,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getAllByTestId('name-1')).toHaveLength(2);
    expect(screen.getAllByTestId('name-1')[0]).toHaveTextContent('New Runner');
    expect(screen.getAllByTestId('position-1')[0]).toHaveTextContent('1');
    expect(screen.getAllByTestId('position-1')[1]).toHaveTextContent('2');
    expect(screen.getAllByTestId('why-1')[0]).toHaveTextContent('first');
    expect(screen.getAllByTestId('why-1')[1]).toHaveTextContent('second');
  });

  test('hydrates reused tool call IDs within their owning messages', () => {
    const tool = createDisplayResultsTool<TestResult>(mockItemComponent);
    const LayoutComponent = tool.layoutComponent!;
    const firstDisplayMessage: ClientSideToolComponentProps['context']['message'] =
      {
        type: 'tool-algolia_display_results',
        state: 'output-available',
        toolCallId: 'display',
        input: {
          groups: [
            { title: 'First turn', results: [{ objectID: 'old-product' }] },
          ],
        },
        output: { status: 'success' },
      };
    const secondDisplayMessage: ClientSideToolComponentProps['context']['message'] =
      {
        type: 'tool-algolia_display_results',
        state: 'output-available',
        toolCallId: 'display',
        input: {
          groups: [
            { title: 'Second turn', results: [{ objectID: 'new-product' }] },
          ],
        },
        output: { status: 'success' },
      };
    const messages = [
      {
        id: 'first-message',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'first-search',
            state: 'output-available',
            input: {},
            output: {
              hits: [{ objectID: 'old-product', name: 'Old product' }],
            },
          },
          firstDisplayMessage,
        ],
      },
      {
        id: 'second-message',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'second-search',
            state: 'output-available',
            input: {},
            output: {
              hits: [{ objectID: 'new-product', name: 'New product' }],
            },
          },
          secondDisplayMessage,
        ],
      },
    ] as ChatComponentContext['messages'];

    const firstRender = render(
      <LayoutComponent
        context={{
          ...metadata,
          messages,
          message: firstDisplayMessage,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getByTestId('name-old-product')).toHaveTextContent(
      'Old product'
    );

    firstRender.unmount();

    render(
      <LayoutComponent
        context={{
          ...metadata,
          messages,
          message: secondDisplayMessage,
          applyFilters: jest.fn(),
          indexUiState: {},
          addToolResult: jest.fn(),
          setIndexUiState: jest.fn(),
          sendEvent: jest.fn(),
        }}
      />
    );

    expect(screen.getByTestId('name-new-product')).toHaveTextContent(
      'New product'
    );
    expect(screen.queryByTestId('name-old-product')).not.toBeInTheDocument();
  });
});
